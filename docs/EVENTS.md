# 이벤트 사전 (Event Dictionary)

| 문서 버전 | v1.0 (M0) | 갱신일 | 2026-07-08 |
|---|---|---|---|

계측의 단일 진실 소스. 새 이벤트는 **반드시 이 문서에 먼저 추가**한 뒤 구현한다 (중복 도입 방지 — 로드맵 M0-E4).
구현: `src/lib/analytics.ts`의 `track(event, props)`. `VITE_ANALYTICS_URL` 미설정 시 no-op.

## 이벤트 목록 (M0)

| 이벤트 | props | 발생 시점 | 관련 지표 (PRD 2장) |
|---|---|---|---|
| `pageview` | — (path는 공통 필드) | 해시 라우트 변경마다 | 주간 재방문율 |
| `tactic_view` | `tactic`: 전술 id | 상세 화면 진입 | 상세 체류·항목별 인기 |
| `search` | `query` (50자 절단) | 검색어 입력 후 800ms 디바운스 | 검색 성공률(→ 콘텐츠 갭 발견) |
| `favorite_toggle` | `tactic`, `on`: 1/0 | 즐겨찾기 추가/해제 | 즐겨찾기 사용률 30% 목표 |
| `counter_click` | `from`, `to`: 전술 id | 카운터 전술 링크 클릭 | 상성 탐색(차별화 기능) 사용률 |
| `client_error` | `message` (200자 절단), `kind?` | window.onerror / unhandledrejection | 프로덕션 오류 가시성 (Sentry 대체) |

공통 필드(래퍼가 자동 첨부): `path`(현재 해시), `ts`(epoch ms).

## 원칙

- **개인정보 금지**: 이메일·이름·자유 텍스트 원문을 props에 넣지 않는다. 검색어는 50자 절단만 허용(콘텐츠 갭 분석 목적).
- **계측은 부작용이 없어야 한다**: 실패는 조용히 삼킨다. 차단기 사용자도 앱 경험이 동일해야 한다(M0 게이트).
- **행동 지표는 참고용**: 트래픽 임계(주간 방문 500) 도달 전에는 출시 판단에 쓰지 않는다(로드맵 원칙 2).

## 예정 (해당 릴리스에서 추가)

| 릴리스 | 이벤트 후보 |
|---|---|
| v1.1 | `sequence_play`(시퀀스 재생), `pwa_installed` |
| v1.1.5 | `view3d_open`, `view3d_camera`(프리셋 전환) |
| v1.2 | `board_created`, `image_shared`(공유 성공/폴백 구분) |
