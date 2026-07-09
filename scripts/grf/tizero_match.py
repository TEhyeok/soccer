"""TiZero AI 경기 드라이버 — 사전학습 멀티에이전트 정책 vs GRF 내장 AI 풀 11v11.

TiZero(OpenRL-Lab, Apache 2.0)의 JiDi 대회 제출 에이전트(submission/tizero)를
그대로 로드해 좌팀 11명(GK는 에이전트 내장 규칙, 필드 10명은 RNN 정책)을 제어한다.
결과 궤적은 기존 파이프라인(convert-replay.mjs)과 호환.

사용: TIZERO_DIR=<TiZero클론>/submission/tizero \
      python3 scripts/grf/tizero_match.py [최대틱=3000]
환경변수: RENDER=1 + FRAMES_DIR=... → 3D 프레임 캡처(틱=0.02s, 50fps)
출력: scripts/grf/trajectory.json (첫 득점 시 조기 종료)
"""

import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MAX_TICKS = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
RENDER = os.environ.get("RENDER") == "1"
M = 5 if RENDER else 1
FRAMES_DIR = os.environ.get("FRAMES_DIR")
TIZERO_DIR = os.environ.get("TIZERO_DIR")
if not TIZERO_DIR or not os.path.isdir(TIZERO_DIR):
    sys.exit("TIZERO_DIR 환경변수에 TiZero submission/tizero 경로를 지정하세요.")

# TiZero 제출 에이전트 로드 (import 시 actor.pt 로드됨)
sys.path.insert(0, TIZERO_DIR)
from submission import agent  # noqa: E402

# 커스텀 시나리오: 기본 11v11에 '첫 득점 시 종료'만 얹는다
import gfootball.scenarios as scenarios_pkg  # noqa: E402

SCENARIO = "tacticbook_ai_match"
with open(os.path.join(os.path.dirname(scenarios_pkg.__file__), SCENARIO + ".py"), "w") as f:
    f.write(
        "from . import *  # noqa: F401,F403\n"
        "import importlib\n"
        "_base = importlib.import_module('gfootball.scenarios.11_vs_11_stochastic')\n"
        "\n\n"
        "def build_scenario(builder):\n"
        "    _base.build_scenario(builder)\n"
        "    builder.config().end_episode_on_score = True\n"
        f"    builder.config().game_duration = {MAX_TICKS * M}\n"
    )

import gfootball.env as football_env  # noqa: E402

env = football_env.create_environment(
    env_name=SCENARIO,
    representation="raw",
    number_of_left_players_agent_controls=11,
    number_of_right_players_agent_controls=0,
    render=RENDER,
    other_config_options={"physics_steps_per_frame": 2, "real_time": False} if RENDER else {},
)
core = env.unwrapped._env

# 11_vs_11_stochastic AddPlayer 순서 (양 팀 동일 로스터)
ROLES = ["GK", "RM", "CF", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LM"]
meta = {
    "name": "TiZero AI vs 내장 AI",
    "displayName": "[AI 경기] TiZero vs 내장 AI",
    "sourceId": "f442",  # 라이브러리 연결: 4-4-2 계열
    "leftIds": [f"l{i + 1}" for i in range(11)],
    "leftRoles": ROLES,
    "rightIds": [f"o{i + 1}" for i in range(11)],
    "rightRoles": ROLES,
}


def save_frame(idx):
    if not (RENDER and FRAMES_DIR):
        return
    frame = core.observation().get("frame")
    if frame is not None:
        import cv2

        os.makedirs(FRAMES_DIR, exist_ok=True)
        cv2.imwrite(os.path.join(FRAMES_DIR, f"{idx:05d}.jpg"),
                    cv2.cvtColor(frame, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])


traj = []


def snap():
    o = core.observation()
    traj.append({
        "left": [[float(x), float(y)] for x, y in o["left_team"]],
        "right": [[float(x), float(y)] for x, y in o["right_team"]],
        "ball": [float(v) for v in o["ball"][:2]],
        "score": list(o.get("score", [0, 0])),
    })


obs = env.reset()
snap()
scored = False
for t in range(MAX_TICKS * M):
    actions = []
    for i in range(11):
        onehot = agent.get_action(dict(obs[i]), i)  # idx=i (active==i 확인됨)
        actions.append(int(np.argmax(onehot[0])))
    obs, _, done, _ = env.step(actions)
    snap()
    save_frame(len(traj))
    if t % (200 * M) == 0:
        print(f"  틱 {t}/{MAX_TICKS * M} 스코어 {traj[-1]['score']} 공 {traj[-1]['ball'][0]:+.2f}")
    if done:
        scored = traj[-1]["score"][0] > 0 or traj[-1]["score"][1] > 0
        print(f"에피소드 종료 @ {t + 1}틱 — 스코어 {traj[-1]['score']}")
        break

out = os.path.join(HERE, "trajectory.json")
with open(out, "w") as f:
    json.dump({"meta": meta, "steps": len(traj), "frames": traj}, f)
print(f"✓ {out} — {len(traj)}틱, 최종 {traj[-1]['score']}, 득점={'예' if scored else '아니오'}")
