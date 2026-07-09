# Changelog

표기: [Semantic Versioning](https://semver.org/lang/ko/) · 형식: [Keep a Changelog](https://keepachangelog.com/ko/)

## [1.3.0] — 2026-07-08 · "3D 보기" (로드맵 마일스톤 v1.1.5)

### Added
- **3D 뷰어 본 구현** (`#/t/:id/3d` 베타 → 정식): 스타일화 선수 피규어(몸통·머리
  인스턴싱 + 머리 위 역할 라벨), 전술 화살표의 피치 바닥 리본 표현(run 실선/pass
  점선 분절/press 적색), 시퀀스 재생 컨트롤 완전판(단계 이동·배속·캡션)
- **품질 자동 티어**: fps 실측 후 pixelRatio 단계 하향(1.5→1→0.75), 비활성 탭
  렌더 정지, reduced-motion 스틸 컷
- **커스텀 보드 3D 미리보기**: 편집기에서 '🧊 3D 미리보기' — 내가 만든 보드를
  3D로 열람 (v1.2-E3 잔여 항목)
- 계측: view3d_play, view3d_quality

### Fixed
- steps 없는 보드를 3D로 열면 매 프레임 크래시하던 문제 (초기 재생 위치 경계)

## [1.2.0] — 2026-07-08 · "나만의 전술 보드"

### Added
- **전술 이미지 공유**: 보드 SVG→PNG(CSS 변수 인라인·워터마크), Web Share API +
  다운로드 폴백 — 라이브러리·재생 보드·편집기 어디서나 단톡 공유
- **커스텀 보드 편집기** (`#/editor`): 선수 드래그 배치, 우리/상대 선수 추가·삭제·라벨,
  화살표 3종(run/pass/press) 드래그 그리기, 공 배치, 되돌리기(50단계)
- **내 전술** (`#/my`): localStorage envelope 버저닝(v1) 저장, 자동 draft(새로고침 복원),
  목록·복제·삭제, JSON 내보내기/가져오기(백업 + v1.3 계정 마이그레이션 보험)
- **템플릿 시작**: 상세 화면 "이 전술로 보드 만들기"(출처 표시), 편집기 시작 화면
  (기본 4-4-2 / 빈 보드 / 포메이션 7종)
- 계측: board_created, image_shared

### Fixed
- SVG 레터박스 환경(데스크톱 max-height)에서 편집기 드래그 좌표가 어긋나던 문제
  (preserveAspectRatio 보정 — E2E가 발견)

## [1.1.0] — 2026-07-08 · "살아 움직이는 전술"

### Added
- **전술 움직임 애니메이션** (ADR-002): `Board.steps` 스키마(선수 id 기반, additive),
  재생 엔진(순수 보간 함수, 렌더러 독립), 재생/단계 이동/배속 컨트롤,
  `prefers-reduced-motion` 스틸 컷 폴백. 시퀀스 6종: 게겐프레싱·티키타카·역습·
  오프사이드 트랩·니어포스트 코너·하이 프레스
- **콘텐츠 팩 10종 (20→30종)**: 신규 카테고리 '빌드업·전개'(살리다 라볼피아나,
  인버티드 풀백, 하프 스페이스, 스위칭) + 가짜 9번, 오버로드 투 아이솔레이트,
  대인 vs 지역방어, 수비 전환, 스로인 루틴, 지역방어 코너 수비. 역링크 통합
- **PWA**: 웹 매니페스트+아이콘, 서비스 워커 오프라인 캐시(빌드 시 정확한
  프리캐시 목록·버전 자동 생성), 새 버전 새로고침 토스트, kill switch 절차
  (scripts/sw-kill.js, 리허설 실증), 오프라인 E2E 2종

- **3D 보기 스파이크** (ADR-008 검증, `#/t/:id/3d` 베타): three.js WebGPU+WebGL2 폴백,
  선수 인스턴싱, 카메라 프리셋 3종, steps 3D 재생(2D와 보간 함수 공유).
  측정 결과·판단 재료는 docs/SPIKE-3D.md

### Fixed
- SW 최초 설치 시 페이지가 불필요하게 새로고침되던 문제 (clients.claim 레이스)
- Vary 헤더 환경에서 오프라인 캐시 매칭 실패 (ignoreVary)

## [M0] — 2026-07-08 · 기반 다지기

### Added
- 검증 파이프라인: ESLint + Prettier + `npm run check`, Vitest 단위·데이터 무결성 테스트 46건, 보드 렌더 스냅샷 기준선 21건, Playwright E2E 스모크 6종(데스크톱/모바일), GitHub Actions CI
- 데이터 스키마 v2 (ADR-001): 보드 선수 `id`, 화살표 `subjectId` — 20종 전체 스크립트 마이그레이션 (`scripts/migrate-board-ids.ts`)
- 데이터-코드 분리: 단일 `tactics.ts` → 카테고리별 5개 파일 + 로더(`src/data/index.ts`) + 무결성 검증기(`validate.ts`, 개발 모드 자동 실행)
- 계측 기반 (ADR-006): 쿠키리스 `track()` 래퍼, `window.onerror` → client_error, 이벤트 사전(docs/EVENTS.md). `VITE_ANALYTICS_URL` 미설정 시 no-op
- 푸터 피드백 채널(mailto), 앱 버전 주입(`__APP_VERSION__`)
- 문서: docs/ADR.md (001~008), docs/CONTENT_GUIDE.md, docs/EVENTS.md, docs/DEPLOY.md
- OG 메타 태그 + 대표 OG 이미지

### Changed
- 필터 로직을 `src/lib/filterTactics.ts` 순수 함수로 추출 (동작 불변)
- `DIFFICULTY_LABELS` 타입을 `Record<1|2|3, string>`으로 정리

### Fixed
- 오프사이드 트랩 약점 항목 오탈자(快속 → 쾌속) — 로드맵 v1.0 커밋에서 선반영

## [1.0.0] — 2026-07-08

### Added
- 최초 릴리스 (MVP): 전술 라이브러리 20종(포메이션 7 · 공격 4 · 수비 3 · 압박·전환 3 · 세트피스 3), SVG 전술 보드(선수 배치 + 이동/패스/압박 화살표), 검색·카테고리·난이도 필터, 즐겨찾기(localStorage), 해시 라우팅 딥링크, 모바일 우선 반응형
