# Changelog

표기: [Semantic Versioning](https://semver.org/lang/ko/) · 형식: [Keep a Changelog](https://keepachangelog.com/ko/)

## [Unreleased] — M0 기반 다지기

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
