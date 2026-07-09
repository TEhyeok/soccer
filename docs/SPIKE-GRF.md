# R&D 스파이크: Google Research Football → 택틱북 리플레이

- **날짜**: 2026-07-09 · **상태**: ✅ 성공 (E2E 검증 완료)
- **질문**: GRF(github.com/google-research/football) 물리 시뮬레이션으로 우리 전술 보드의
  "실제로 그럴듯한" 리플레이를 생성해 앱 3D 뷰어에서 재생할 수 있는가?

## 결론

**된다.** a-counter(역습) 보드의 초기 배치를 GRF 커스텀 시나리오로 옮겨 헤드리스
시뮬레이션(11 vs 5, 에이전트 0명 — 양 팀 모두 내장 game AI)을 40초 돌렸고,
스텝별 좌표 궤적을 우리 `steps` 스키마로 변환해 **앱 수정 0줄로** '내 전술 →
JSON 가져오기'로 임포트, 3D 뷰어에서 50단계 리플레이 재생을 Playwright로 확인했다.

```
보드(a-counter) ─→ scenario_*.py ─→ GRF 헤드리스 시뮬 ─→ trajectory.json
                                                            │ convert-replay.mjs
앱 3D 뷰어 ←─ '내 전술 > JSON 가져오기' ←─ replay-custom.json ←┘
```

## 산출물 (scripts/grf/)

| 파일 | 역할 |
| --- | --- |
| `scenario_tacticbook_counter.py` | 보드 좌표(0~100) → GRF 좌표(±1, ±0.42) 매핑, 난이도·경기규칙 설정 |
| `run_sim.py` | 헤드리스 실행, 코어 엔진 관측(dict)에서 좌표 추출 → `trajectory.json` |
| `convert-replay.mjs` | 궤적 → 앱 호환 envelope(8스텝≈0.8초 샘플링, 캡션 자동 생성) |
| `replay-custom.json` | 생성된 리플레이 샘플 (88KB, 16명×50단계) — 그대로 임포트 가능 |

## 설치 여정 (이 환경 기준 — 재현 시 그대로 따라하면 됨)

GRF는 2022년 이후 사실상 유지보수가 멈춰 최신 파이썬 스택과 마찰이 크다.
전부 해결 가능했지만, 아래 5개가 실제로 막혔던 지점이다.

1. **시스템 의존성**: `libsdl2-{,image,ttf,gfx}-dev libboost-all-dev` + Mesa GL/EGL 헤더 (apt).
2. **Boost.Python 버전 불일치**: CMake `find_package(Python COMPONENTS Development)`가
   최신 헤더(3.13)를 잡지만 데비안 Boost는 `libboost_python312`뿐.
   → `build_game_engine.sh`의 cmake 호출에
   `-DPython_INCLUDE_DIR=/usr/include/python3.12 -DPython_LIBRARY=.../libpython3.12.so`
   를 박아 3.12로 고정 (소스 클론 후 패치, `Python_EXECUTABLE`만으론 부족).
3. **gym==0.21.0 메타데이터 버그**: `opencv-python>=3.` (버전 불완전)이 최신 setuptools에서
   거부 → sdist를 받아 `>=3.0`으로 패치 후 로컬 설치.
4. **gym 0.21 × Python 3.12**: `metadata.entry_points().get(...)` API 제거됨
   → 설치본 `gym/envs/registration.py` 1줄 패치 (`entry_points(group=...)`).
5. **관측 추출**: 에이전트 0명 제어 시 `step()`/`observation()`의 obs 리스트가 빔
   → `env.unwrapped._env.observation()` (코어 엔진 dict)에서 직접 읽음.

빌드 자체(C++ 엔진 컴파일)는 ~7분. 이후 400스텝 시뮬레이션은 수 초.

## 좌표 매핑 (검증됨)

- 우리 논리: x 0~100(좌→우 폭), y 0~100(자기 골문→상대 골문)
- GRF: x −1~+1(자기 골대→상대 골대), y −0.42~+0.42(위→아래 폭)
- 시나리오 입력: `gx = 2·(y/100)−1`, `gy = 0.84·(x/100)−0.42` (오른팀은 180° 회전해 전달)
- 관측 출력(양 팀 절대좌표): 역변환 후 0~100 클램프 — 라인아웃 좌표도 안전

## 한계 / 알게 된 것

- **결정성 없음**: `deterministic = False`면 매 실행 다른 전개. 좋은 리플레이는
  여러 번 돌려 고르는 큐레이션 작업이 됨 (콘텐츠 파이프라인 관점에선 오히려 장점).
- **전술 "지시" 불가**: 내장 AI는 자기 판단으로 움직임 — 우리가 강제할 수 있는 건
  초기 배치·난이도·규칙뿐. 화살표(의도한 전개)대로 움직이게 하려면 RL 학습이 필요 (스파이크 범위 밖).
- **11 vs 11도 동일하게 동작** (이번엔 역습 상황 연출을 위해 11 vs 5 사용).
- 에피소드 종료 조건(`end_episode_on_score/out_of_play`)으로 "골 장면까지" 클립을 만들 수 있으나,
  이번 40초 런은 득점 없이 상대 진영 압박까지 전개됨 (공 x: −0.34 → +0.79).

## 프로덕트 제안 (다음 결정)

GRF를 **런타임 의존성이 아니라 오프라인 콘텐츠 생성 도구**로 쓴다:

1. (지금 가능) 대표 전술 5~10종에 시나리오를 만들어 "시뮬레이션 리플레이" 팩 생성 →
   정적 데이터로 앱에 동봉. 앱 코드 변경은 데이터 추가뿐.
2. (선택) `deterministic`/시드 고정 + 여러 런 중 큐레이션하는 생성 스크립트 정비.
3. (범위 밖) 사용자 보드 → 실시간 시뮬레이션은 서버 GPU/RL 이슈로 v2 이후 재검토.
