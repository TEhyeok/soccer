"""GRF 헤드리스 시뮬레이션 → 궤적 JSON (R&D 스파이크).

사용: python3 scripts/grf/run_sim.py [스텝수]
출력: scripts/grf/trajectory.json — 스텝별 left/right/ball 좌표 (GRF 좌표계)
"""

import json
import os
import shutil
import sys

import gfootball.env as football_env
import gfootball.scenarios as scenarios_pkg

STEPS = int(sys.argv[1]) if len(sys.argv) > 1 else 100
HERE = os.path.dirname(os.path.abspath(__file__))

# 커스텀 시나리오를 gfootball 패키지 시나리오 디렉터리에 복사
scenario_dir = os.path.dirname(scenarios_pkg.__file__)
shutil.copy(
    os.path.join(HERE, "scenario_tacticbook_counter.py"),
    os.path.join(scenario_dir, "tacticbook_counter.py"),
)

env = football_env.create_environment(
    env_name="tacticbook_counter",
    representation="raw",
    number_of_left_players_agent_controls=0,
    number_of_right_players_agent_controls=0,
    render=False,
)

env.reset()
frames = []


def snap():
    # 에이전트 0명 제어 시 obs 리스트가 비므로 코어 엔진의 전체 상태 dict를 직접 읽는다
    raw = env.unwrapped._env.observation()
    return {
        "left": [[float(x), float(y)] for x, y in raw["left_team"]],
        "right": [[float(x), float(y)] for x, y in raw["right_team"]],
        "ball": [float(v) for v in raw["ball"][:2]],
        "score": list(raw.get("score", [0, 0])),
    }


frames.append(snap())
done = False
for i in range(STEPS):
    _, reward, done, info = env.step([])
    frames.append(snap())
    if done:
        print(f"에피소드 종료 @ step {i + 1} (득점/아웃)")
        break

out = os.path.join(HERE, "trajectory.json")
with open(out, "w") as f:
    json.dump({"steps": len(frames), "frames": frames}, f)
print(f"✓ {out} — {len(frames)} 프레임, 최종 스코어 {frames[-1]['score']}")
