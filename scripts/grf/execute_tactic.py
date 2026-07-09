"""전술 실행기 — 보드 steps 시퀀스대로 GRF에서 우리 팀 11명을 직접 조종한다.

보드 JSON(export-board.ts 출력 또는 편집기 'JSON 내보내기' 항목)을 입력으로:
  1. 초기 배치로 커스텀 시나리오를 생성해 gfootball에 설치
  2. 11명 전원을 에이전트로 제어 — 스텝별 목표 지점(웨이포인트)으로 이동,
     pass 화살표는 실제 패스/슛 액션으로 실행 (물리·상대 AI 반응은 엔진 담당)
  3. 궤적을 trajectory.json으로 저장 (convert-replay.mjs로 앱 리플레이 변환)

사용: python3 scripts/grf/execute_tactic.py [보드.json] [스텝당틱=30]
"""

import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BOARD_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "board-a-counter.json")
TICKS_PER_STEP = int(sys.argv[2]) if len(sys.argv) > 2 else 30  # 1틱 = 0.1초
SCENARIO_NAME = "tacticbook_exec"

with open(BOARD_PATH) as f:
    tactic = json.load(f)
board = tactic["board"]
steps = board.get("steps") or []
if not steps:
    sys.exit("보드에 steps가 없습니다 — 실행할 시퀀스가 필요해요.")

# ── 좌표 변환 (scenario_tacticbook_counter.py와 동일 규약) ──
def to_grf(x, y):
    return (2.0 * (y / 100.0) - 1.0, 0.84 * (x / 100.0) - 0.42)


ROLE_MAP = {  # 우리 role → GRF e_PlayerRole_*
    "GK": "GK", "LB": "LB", "RB": "RB", "CB": "CB", "DM": "DM",
    "CM": "CM", "LM": "LM", "RM": "RM", "AM": "AM", "ST": "CF", "CF": "CF",
    "LW": "LM", "RW": "RM", "WB": "LB", "SW": "CB",
}

# ── 1) 시나리오 생성·설치 ──
def scenario_source():
    lines = [
        "from . import *  # noqa: F401,F403",
        "",
        "",
        "def build_scenario(builder):",
        "    builder.config().game_duration = 3000",
        "    builder.config().deterministic = False",
        "    builder.config().offsides = False",  # 연출 우선 — 오프사이드로 끊기지 않게
        "    builder.config().end_episode_on_score = True",
        "    builder.config().end_episode_on_out_of_play = False",
        "    builder.config().right_team_difficulty = 0.6",
        "    builder.config().left_team_difficulty = 1.0",
    ]
    bx, by = to_grf(**board["ball"]) if board.get("ball") else to_grf(50, 50)
    lines.append(f"    builder.SetBallPosition({bx:.4f}, {by:.4f})")
    lines.append("    builder.SetTeam(Team.e_Left)")
    for p in board["players"]:
        gx, gy = to_grf(p["x"], p["y"])
        role = ROLE_MAP.get(p.get("role", "CM"), "CM")
        lines.append(f"    builder.AddPlayer({gx:.4f}, {gy:.4f}, e_PlayerRole_{role})  # {p['id']}")
    lines.append("    builder.SetTeam(Team.e_Right)")
    for p in board.get("opponents") or []:
        gx, gy = to_grf(p["x"], p["y"])
        role = ROLE_MAP.get(p.get("role", "CM"), "CM")
        # 오른팀은 자기 관점 좌표 (180도 회전)
        lines.append(f"    builder.AddPlayer({-gx:.4f}, {-gy:.4f}, e_PlayerRole_{role})  # {p['id']}")
    return "\n".join(lines) + "\n"


import gfootball.scenarios as scenarios_pkg

with open(os.path.join(os.path.dirname(scenarios_pkg.__file__), SCENARIO_NAME + ".py"), "w") as f:
    f.write(scenario_source())

# ── 2) 누적 프레임 (lib/playback.ts buildFrames와 동일 의미론) ──
ids = [p["id"] for p in board["players"]]
all_pos = {p["id"]: (p["x"], p["y"]) for p in board["players"]}
for p in board.get("opponents") or []:
    all_pos[p["id"]] = (p["x"], p["y"])
frames = [dict(all_pos)]
for s in steps:
    nxt = dict(frames[-1])
    for pid, pos in (s.get("positions") or {}).items():
        nxt[pid] = (pos["x"], pos["y"])
    frames.append(nxt)

# 스텝별 패스 계획: (passer_idx, 목표 GRF좌표, 슛 여부)
GOAL_X = (38, 62)
def pass_plan(k):
    plans = []
    for a in steps[k].get("arrows") or []:
        if a.get("kind") != "pass" or a.get("subjectId") not in ids:
            continue
        tx, ty = a["to"]["x"], a["to"]["y"]
        shot = ty >= 92 and GOAL_X[0] <= tx <= GOAL_X[1]
        plans.append({"passer": ids.index(a["subjectId"]), "to": to_grf(tx, ty), "shot": shot})
    return plans


# ── 3) 제어 루프 ──
import gfootball.env as football_env

A = {  # 액션 id (default action set)
    "idle": 0, "left": 1, "top_left": 2, "top": 3, "top_right": 4, "right": 5,
    "bottom_right": 6, "bottom": 7, "bottom_left": 8, "long_pass": 9,
    "high_pass": 10, "short_pass": 11, "shot": 12, "sprint": 13,
    "release_direction": 14, "release_sprint": 15,
}
DIRS = [  # 45도 섹터 → 방향 액션 (GRF: +x 상대골문, +y 화면 아래)
    (0, "right"), (45, "bottom_right"), (90, "bottom"), (135, "bottom_left"),
    (180, "left"), (-135, "top_left"), (-90, "top"), (-45, "top_right"),
]


def dir_action(dx, dy):
    ang = math.degrees(math.atan2(dy, dx))
    best = min(DIRS, key=lambda d: abs((ang - d[0] + 180) % 360 - 180))
    return A[best[1]]


env = football_env.create_environment(
    env_name=SCENARIO_NAME,
    representation="raw",
    number_of_left_players_agent_controls=11,
    number_of_right_players_agent_controls=0,
    render=False,
)
env.reset()
core = env.unwrapped._env


def raw():
    return core.observation()


traj = []


def snap(o, step_no):
    traj.append({
        "step": step_no,
        "left": [[float(x), float(y)] for x, y in o["left_team"]],
        "right": [[float(x), float(y)] for x, y in o["right_team"]],
        "ball": [float(v) for v in o["ball"][:2]],
        "score": list(o.get("score", [0, 0])),
        "owned": [int(o.get("ball_owned_team", -1)), int(o.get("ball_owned_player", -1))],
    })


snap(raw(), 0)
scored = False

for k in range(len(steps)):
    targets = [to_grf(*frames[k + 1][pid]) for pid in ids]
    plans = pass_plan(k)
    pending = list(plans)
    extra = 0
    t = 0
    while t < TICKS_PER_STEP + extra:
        o = raw()
        own_team, own_player = int(o.get("ball_owned_team", -1)), int(o.get("ball_owned_player", -1))
        actions = []
        for i in range(11):
            px, py = float(o["left_team"][i][0]), float(o["left_team"][i][1])
            tx, ty = targets[i]
            dx, dy = tx - px, ty - py
            dist = math.hypot(dx, dy)
            act = None
            # 패스/슛: 계획된 패서가 공을 잡고 있으면 실행
            for pl in pending:
                if pl["passer"] == i and own_team == 0 and own_player == i:
                    aim_dx, aim_dy = pl["to"][0] - px, pl["to"][1] - py
                    if not pl.get("aimed"):
                        pl["aimed"] = True
                        act = dir_action(aim_dx, aim_dy)  # 먼저 조준
                    else:
                        pend_dist = math.hypot(aim_dx, aim_dy)
                        act = A["shot"] if pl["shot"] else (
                            A["long_pass"] if pend_dist > 0.5 else A["short_pass"])
                        pending.remove(pl)
                    break
            if act is None:
                if dist > 0.02:
                    # 스텝 첫 틱에 스프린트 온 (스티키), 이후 방향
                    act = A["sprint"] if t == 0 and dist > 0.12 else dir_action(dx, dy)
                else:
                    act = A["release_direction"]
            actions.append(act)
        _, _, done, _ = env.step(actions)
        snap(raw(), k + 1)
        if done:
            scored = True
            break
        # 패스가 남았는데 스텝이 끝나가면 최대 20틱 연장 (패서가 공 받기 대기)
        if t == TICKS_PER_STEP + extra - 1 and pending and extra < 20:
            extra += 5
        t += 1
    if scored:
        break

# 마무리 관찰 2초
if not scored:
    for _ in range(20):
        _, _, done, _ = env.step([A["idle"]] * 11)
        snap(raw(), len(steps))
        if done:
            break

meta = {
    "name": tactic.get("name", tactic.get("id", "tactic")),
    "sourceId": tactic.get("id"),
    "leftIds": ids,
    "leftRoles": [p.get("role", "CM") for p in board["players"]],
    "rightIds": [p["id"] for p in board.get("opponents") or []],
    "rightRoles": [p.get("role", "CM") for p in board.get("opponents") or []],
}
out = os.path.join(HERE, "trajectory.json")
with open(out, "w") as f:
    json.dump({"meta": meta, "steps": len(traj), "frames": traj}, f)
fin = traj[-1]
print(f"✓ {out} — {len(traj)}틱, 최종 스코어 {fin['score']}, 득점={'예' if scored else '아니오'}")
