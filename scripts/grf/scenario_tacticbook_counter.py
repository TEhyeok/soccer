# GRF 커스텀 시나리오 — 택틱북 a-counter(역습) 보드의 초기 배치 (R&D 스파이크)
# 좌표 매핑: 우리 논리(x 0~100 좌우, y 0~100 자기골→상대골)
#   → GRF (x -1~1 길이축, y -0.42~0.42 폭축)
# 오른팀(상대) 좌표는 GRF 관례상 자기 진영 관점으로 미러링해 전달한다.
from . import *  # noqa: F401,F403 — gfootball 시나리오 로더 관례


def _left(x, y):
    """우리 팀: 논리 → GRF 절대 좌표 (왼쪽 골문이 자기 골문)"""
    return (2.0 * (y / 100.0) - 1.0, 0.84 * (x / 100.0) - 0.42)


def _right(x, y):
    """상대 팀: 절대 좌표를 180도 회전 (오른팀은 미러링되어 배치됨)"""
    gx, gy = _left(x, y)
    return (-gx, -gy)


def build_scenario(builder):
    builder.config().game_duration = 400
    builder.config().deterministic = False
    builder.config().offsides = True
    builder.config().end_episode_on_score = True
    builder.config().end_episode_on_out_of_play = True
    builder.config().end_episode_on_possession_change = False
    builder.config().right_team_difficulty = 0.8
    builder.config().left_team_difficulty = 1.0

    # 공: 방금 탈취한 지점 (cm1 발밑)
    bx, by = _left(38, 33)
    builder.SetBallPosition(bx, by)

    # ── 우리 팀 (a-counter 로우블록 4-4-2, 탈취 직후) ──
    builder.SetTeam(Team.e_Left)
    builder.AddPlayer(*_left(50, 6), e_PlayerRole_GK)   # gk
    builder.AddPlayer(*_left(15, 18), e_PlayerRole_LB)  # lb
    builder.AddPlayer(*_left(37, 15), e_PlayerRole_CB)  # cb1
    builder.AddPlayer(*_left(63, 15), e_PlayerRole_CB)  # cb2
    builder.AddPlayer(*_left(85, 18), e_PlayerRole_RB)  # rb
    builder.AddPlayer(*_left(14, 34), e_PlayerRole_LM)  # lm
    builder.AddPlayer(*_left(38, 30), e_PlayerRole_CM)  # cm1 (볼 소유)
    builder.AddPlayer(*_left(62, 30), e_PlayerRole_CM)  # cm2
    builder.AddPlayer(*_left(86, 34), e_PlayerRole_RM)  # rm
    builder.AddPlayer(*_left(40, 52), e_PlayerRole_CF)  # st1
    builder.AddPlayer(*_left(60, 52), e_PlayerRole_CF)  # st2

    # ── 상대 팀 (전진해 있다가 역습 맞는 상황 — 백2 + 중원2 + GK) ──
    builder.SetTeam(Team.e_Right)
    builder.AddPlayer(*_right(50, 97), e_PlayerRole_GK)   # o-gk
    builder.AddPlayer(*_right(40, 68), e_PlayerRole_CB)   # o-cb1
    builder.AddPlayer(*_right(66, 70), e_PlayerRole_CB)   # o-cb2
    builder.AddPlayer(*_right(30, 42), e_PlayerRole_CM)   # o-cm1
    builder.AddPlayer(*_right(65, 45), e_PlayerRole_CM)   # o-cm2
