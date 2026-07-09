"""학습 정책(또는 랜덤)의 플레이를 3D 렌더 캡처 — 학습 전/후 비교 영상용.

사용: xvfb-run -a python3.12 eval_render.py <ckpt.zip|random> <출력프레임디렉터리> [에피소드=3]
"""

import os
import random
import sys

import cv2
import gfootball.env as football_env

MODEL_PATH = sys.argv[1]
OUT = sys.argv[2]
EPISODES = int(sys.argv[3]) if len(sys.argv) > 3 else 3
SCEN = os.environ.get("SCEN", "academy_empty_goal_close")
os.makedirs(OUT, exist_ok=True)

model = None
if MODEL_PATH != "random":
    from stable_baselines3 import PPO

    model = PPO.load(MODEL_PATH)

env = football_env.create_environment(
    env_name=SCEN,
    representation="simple115v2",
    rewards="scoring",
    number_of_left_players_agent_controls=1,
    stacked=False,
    render=True,
    other_config_options={"physics_steps_per_frame": 2, "real_time": False},
)

n = 0
score = 0
for ep in range(EPISODES):
    obs = env.reset()
    done = False
    while not done:
        if model is not None:
            action, _ = model.predict(obs, deterministic=False)
        else:
            action = random.randrange(19)
        obs, reward, done, info = env.step(action)
        if reward > 0:
            score += 1
        frame = env.unwrapped._env.observation().get("frame")
        if frame is not None:
            cv2.imwrite(
                os.path.join(OUT, f"{n:05d}.jpg"),
                cv2.cvtColor(frame, cv2.COLOR_RGB2BGR),
                [cv2.IMWRITE_JPEG_QUALITY, 88],
            )
            n += 1

print(f"✓ {OUT} — {n} 프레임, {EPISODES}에피소드 중 득점 {score}회")
