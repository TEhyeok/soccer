"""컷백 마무리 학습 — 3-5-2 득점 루트의 마지막 장면을 PPO로 '득점할 때까지' 학습.

장면: 페널티 스팟 근처에서 컷백을 받은 스트라이커(에이전트 제어 1명) vs GK + 센터백.
우리 3-5-2 시퀀스의 최종 스텝과 동일 기하 구조 — 학습된 슛 판단을 얻는다.
진행 기록: rl/finisher-progress.jsonl (실시간 관람용)
"""

import json
import os
import sys
import time

# 커스텀 시나리오 설치 (우리 3-5-2 컷백 장면 기하)
import gfootball.scenarios as scenarios_pkg

SCEN = "tacticbook_finisher"
SCENARIO_SRC = """from . import *  # noqa: F401,F403


def build_scenario(builder):
    builder.config().game_duration = 100
    builder.config().deterministic = False
    builder.config().end_episode_on_score = True
    builder.config().end_episode_on_out_of_play = True
    builder.config().end_episode_on_possession_change = True
    # 컷백을 막 받은 스트라이커 (우리 논리 (55,88) ≈ GRF (0.76, 0.042))
    builder.SetBallPosition(0.76, 0.042)
    builder.SetTeam(Team.e_Left)
    builder.AddPlayer(-1.0, 0.0, e_PlayerRole_GK)
    builder.AddPlayer(0.75, 0.045, e_PlayerRole_CF)   # 에이전트 (st2)
    builder.SetTeam(Team.e_Right)
    builder.AddPlayer(-1.0, 0.0, e_PlayerRole_GK)
    builder.AddPlayer(-0.76, 0.07, e_PlayerRole_CB)   # o-cb2 (골문쪽 후퇴 위치)
"""
with open(os.path.join(os.path.dirname(scenarios_pkg.__file__), SCEN + ".py"), "w") as f:
    f.write(SCENARIO_SRC)

import gfootball.env as football_env
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import BaseCallback
from stable_baselines3.common.vec_env import SubprocVecEnv, VecMonitor

N_ENVS = 3
TOTAL = int(sys.argv[1]) if len(sys.argv) > 1 else 200_000
HERE = os.path.dirname(os.path.abspath(__file__))
RL = os.path.join(HERE, "rl")
os.makedirs(RL, exist_ok=True)
PROGRESS = os.path.join(RL, "finisher-progress.jsonl")
CKPT_EVERY = 50_000


def make_env(rank):
    def _f():
        return football_env.create_environment(
            env_name=SCEN,
            representation="simple115v2",
            rewards="scoring,checkpoints",
            number_of_left_players_agent_controls=1,
            stacked=False,
        )

    return _f


class Progress(BaseCallback):
    def __init__(self):
        super().__init__()
        self.t0 = time.time()
        self.next_ckpt = CKPT_EVERY

    def _on_rollout_end(self):
        buf = list(self.model.ep_info_buffer)
        rew = float(sum(float(e["r"]) for e in buf) / len(buf)) if buf else None
        goals = sum(1 for e in buf if float(e["r"]) >= 1.0) / len(buf) if buf else None
        line = {
            "steps": int(self.num_timesteps),
            "ep_rew_mean": round(rew, 3) if rew is not None else None,
            "goal_rate": round(goals, 3) if goals is not None else None,
            "elapsed_s": round(time.time() - self.t0),
        }
        with open(PROGRESS, "a") as f:
            f.write(json.dumps(line) + "\n")
        if self.num_timesteps >= self.next_ckpt:
            self.model.save(os.path.join(RL, f"finisher-{self.num_timesteps}"))
            self.next_ckpt += CKPT_EVERY
        return True

    def _on_step(self):
        return True


if __name__ == "__main__":
    env = VecMonitor(SubprocVecEnv([make_env(i) for i in range(N_ENVS)]))
    model = PPO("MlpPolicy", env, n_steps=512, batch_size=256,
                learning_rate=3e-4, ent_coef=0.003, verbose=0)
    with open(PROGRESS, "a") as f:
        f.write(json.dumps({"event": "start", "total": TOTAL, "scenario": SCEN}) + "\n")
    model.learn(TOTAL, callback=Progress())
    model.save(os.path.join(RL, "finisher-final"))
    with open(PROGRESS, "a") as f:
        f.write(json.dumps({"event": "done"}) + "\n")
    print("마무리 학습 완료")
