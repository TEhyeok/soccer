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
        # 전원 에이전트 제어라 아웃 시 스로인 던질 AI가 없음 — False면
        # 엔진이 인플레이 복귀를 무한 대기(행). 반드시 True 유지.
        "    builder.config().end_episode_on_out_of_play = True",
        "    builder.config().right_team_difficulty = 0.6",
        "    builder.config().left_team_difficulty = 1.0",
    ]
    bx, by = to_grf(**board["ball"]) if board.get("ball") else to_grf(50, 50)
    lines.append(f"    builder.SetBallPosition({bx:.4f}, {by:.4f})")
    lines.append("    builder.SetTeam(Team.e_Left)")
    players = list(board["players"])
    players.sort(key=lambda p: 0 if p.get("role") == "GK" else 1)
    if not any(p.get("role") == "GK" for p in players):
        players.insert(0, {"id": "gk-auto", "role": "GK", "x": 50, "y": 3})
    board["players"] = players
    for p in players:
        gx, gy = to_grf(p["x"], p["y"])
        role = ROLE_MAP.get(p.get("role", "CM"), "CM")
        lines.append(f"    builder.AddPlayer({gx:.4f}, {gy:.4f}, e_PlayerRole_{role})  # {p['id']}")
    lines.append("    builder.SetTeam(Team.e_Right)")
    # 엔진 규칙: 각 팀 첫 선수는 반드시 GK — 보드에 상대 GK가 없으면 자동 추가
    # (없으면 킥오프 로직이 깨져 엔진이 네이티브 행에 빠진다)
    opponents = list(board.get("opponents") or [])
    opponents.sort(key=lambda p: 0 if p.get("role") == "GK" else 1)
    if not any(p.get("role") == "GK" for p in opponents):
        opponents.insert(0, {"id": "o-gk-auto", "role": "GK", "x": 50, "y": 97})
    for p in opponents:
        gx, gy = to_grf(p["x"], p["y"])
        role = ROLE_MAP.get(p.get("role", "CM"), "CM")
        # 오른팀은 자기 관점 좌표 (180도 회전)
        lines.append(f"    builder.AddPlayer({-gx:.4f}, {-gy:.4f}, e_PlayerRole_{role})  # {p['id']}")
    board["opponents"] = opponents  # meta·궤적 매핑도 동일 순서 사용
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

N_PLAYERS = len(board["players"])  # 시나리오 생성 후 확정 (GK 자동 보정 반영)

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
    number_of_left_players_agent_controls=N_PLAYERS,
    number_of_right_players_agent_controls=0,
    render=False,
)
core = env.unwrapped._env


def raw():
    return core.observation()


def snap(traj, o, step_no):
    traj.append({
        "step": step_no,
        "left": [[float(x), float(y)] for x, y in o["left_team"]],
        "right": [[float(x), float(y)] for x, y in o["right_team"]],
        "ball": [float(v) for v in o["ball"][:2]],
        "score": list(o.get("score", [0, 0])),
        "owned": [int(o.get("ball_owned_team", -1)), int(o.get("ball_owned_player", -1))],
    })


def run_once():
    """한 판 실행 — (궤적, 득점여부, 공 최대전진 gx) 반환. 아웃이면 그 시점에 종료."""
    env.reset()
    traj = []
    snap(traj, raw(), 0)
    ended = False
    for k in range(len(steps)):
        targets = [to_grf(*frames[k + 1][pid]) for pid in ids]
        pending = pass_plan(k)
        extra = 0
        t = 0
        while t < TICKS_PER_STEP + extra:
            o = raw()
            own_team = int(o.get("ball_owned_team", -1))
            own_player = int(o.get("ball_owned_player", -1))
            actions = []
            for i in range(N_PLAYERS):
                px, py = float(o["left_team"][i][0]), float(o["left_team"][i][1])
                tx, ty = targets[i]
                dx, dy = tx - px, ty - py
                dist = math.hypot(dx, dy)
                act = None
                # 패스/슛: 계획된 패서가 공을 잡고 있으면 실행 (조준 1틱 → 발사)
                for pl in pending:
                    if pl["passer"] == i and own_team == 0 and own_player == i:
                        aim_dx, aim_dy = pl["to"][0] - px, pl["to"][1] - py
                        if not pl.get("aimed"):
                            pl["aimed"] = True
                            act = dir_action(aim_dx, aim_dy)
                        else:
                            pend_dist = math.hypot(aim_dx, aim_dy)
                            act = A["shot"] if pl["shot"] else (
                                A["long_pass"] if pend_dist > 0.5 else A["short_pass"])
                            pending.remove(pl)
                        break
                # 공이 우리 소유가 아니면 이번 스텝 패서가 공을 잡으러 간다
                # (AI와 달리 스크립트 제어는 루즈볼 회수를 명시해야 함)
                if act is None and own_team != 0 and any(pl["passer"] == i for pl in pending):
                    bx_, by_ = float(o["ball"][0]), float(o["ball"][1])
                    act = dir_action(bx_ - px, by_ - py)
                if act is None:
                    if dist > 0.02:
                        act = A["sprint"] if t == 0 and dist > 0.12 else dir_action(dx, dy)
                    else:
                        act = A["release_direction"]
                actions.append(act)
            _, _, done, _ = env.step(actions)
            snap(traj, raw(), k + 1)
            if done:  # 득점 or 아웃 (end_episode_on_*)
                ended = True
                break
            if int(raw().get("game_mode", 0)) != 0:
                # 세트피스(프리킥 등) 진입 — 전원 제어 상태에선 진행 불가, 런 종료
                ended = True
                break
            if t == TICKS_PER_STEP + extra - 1 and pending and extra < 20:
                extra += 5  # 패스 대기 연장
            t += 1
        if ended:
            break
    if not ended:  # 마무리 관찰 2초
        for _ in range(20):
            _, _, done, _ = env.step([A["idle"]] * N_PLAYERS)
            snap(traj, raw(), len(steps))
            if done:
                break
    fin = traj[-1]
    scored = fin["score"][0] > 0
    max_gx = max(f["ball"][0] for f in traj)
    return traj, scored, max_gx


RUNS = int(os.environ.get("RUNS", "6"))
traj, best_gx = None, -2.0
scored = False
for r in range(RUNS):
    t_r, s_r, gx_r = run_once()
    print(f"  런 {r + 1}/{RUNS}: 틱 {len(t_r)}, 스코어 {t_r[-1]['score']}, 공 최대전진 {gx_r:.2f}")
    if s_r:
        traj, scored = t_r, True
        break
    if gx_r > best_gx:
        traj, best_gx = t_r, gx_r

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
