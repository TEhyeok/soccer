# ⚽ 택틱북 (TacticBook)

[![CI](https://github.com/TEhyeok/soccer/actions/workflows/ci.yml/badge.svg)](https://github.com/TEhyeok/soccer/actions/workflows/ci.yml)

축구 포메이션과 전략·전술을 인터랙티브 전술 보드로 배우는 **축구 전략·전술 모음집** 웹앱.

## 주요 기능 (v1.1)

- **전술 라이브러리 30종** — 6개 카테고리
  - 포메이션 7종 (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2, 4-4-2 다이아몬드)
  - 빌드업·전개 4종 (살리다 라볼피아나, 인버티드 풀백, 하프 스페이스, 스위칭)
  - 공격 전술 6종 (티키타카, 역습, 측면 공격, 롱볼, 가짜 9번, 오버로드 투 아이솔레이트)
  - 수비 전술 5종 (로우/미드 블록, 오프사이드 트랩, 대인 vs 지역, 수비 전환)
  - 압박·전환 3종 (게겐프레싱, 하이 프레스, 압박 트리거)
  - 세트피스 5종 (니어포스트 코너, 프리킥, 숏 코너, 스로인, 지역방어 코너 수비)
- **SVG 전술 보드** — 선수 배치, 이동/패스/압박 화살표 시각화
- **시퀀스 재생** — 대표 전술 6종의 움직임을 단계별 애니메이션으로 (재생/배속/단계 이동)
- **검색 & 필터** — 카테고리, 난이도, 텍스트 검색
- **상세 페이지** — 작동 원리, 강점/약점, 핵심 포인트, 카운터 전술, 대표 팀
- **즐겨찾기** — localStorage 기반, 모아보기
- **모바일 우선 반응형** + 해시 라우팅 딥링크 (`#/t/f433`)

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
```

## 검증 (CI와 동일)

```bash
npm run check      # 린트 + 포맷 + 타입체크
npm test           # 단위·데이터 무결성 테스트 + 보드 스냅샷
npm run e2e        # Playwright E2E 스모크 (빌드 후)
```

- 전술 데이터를 추가·수정하면 `npm test`가 참조 무결성(counters·선수 id·좌표 범위)을 자동 검증한다.
- 보드 시각 변경 시 스냅샷 갱신: `npx vitest run -u` (PR에서 diff 확인).
- 콘텐츠 품질 기준: [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md)

## 배포

Cloudflare Pages (main 머지 → 자동 배포, PR → 프리뷰 URL). 절차: [docs/DEPLOY.md](docs/DEPLOY.md)

## 기술 스택

React 18 · TypeScript · Vite · 순수 SVG (외부 차트/보드 라이브러리 없음)

## 프로젝트 구조

```
docs/
  PRD.md               제품 요구사항 문서
  ROADMAP.md           구현 로드맵 (M0~v1.3, 릴리스 게이트)
  ADR.md               아키텍처 결정 기록 (001~008)
  CONTENT_GUIDE.md     콘텐츠 스타일 가이드 (전술 항목 품질 기준)
  EVENTS.md            계측 이벤트 사전
  DEPLOY.md            배포 가이드 (Cloudflare Pages)
src/
  data/                전술 데이터 (카테고리별 5개 파일 + 로더 + 검증기)
  components/
    PitchBoard.tsx     SVG 축구장 + 선수/화살표 렌더러
    TacticCard.tsx     라이브러리 카드
    TacticDetail.tsx   상세 화면
    FilterBar.tsx      검색/필터 UI
  lib/
    filterTactics.ts   필터링 순수 함수
    analytics.ts       쿠키리스 계측 래퍼 (미설정 시 no-op)
  App.tsx              해시 라우팅 + 목록/상세 전환
  hooks.ts             useHashRoute, useFavorites
  types.ts             데이터 스키마 (v2 — 선수 id, ADR-001)
scripts/
  migrate-board-ids.ts 스키마 마이그레이션 (데이터 일괄 변경은 스크립트로만)
e2e/                   Playwright 스모크 (PRD 사용자 스토리 1:1)
```

## 로드맵

| 마일스톤 | 내용 |
|---|---|
| **M0 (완료)** | 검증 파이프라인, 스키마 v2, 계측 기반, 배포 준비 |
| v1.1 | 전술 움직임 애니메이션, 콘텐츠 팩 10종, PWA, 3D 스파이크 |
| v1.1.5 | 3D 보기 모드 (three.js, 뷰어 전용) |
| v1.2 | 이미지 공유(팀 단톡), 커스텀 전술 보드 |
| v1.3 | 계정/동기화, 팀 플레이북 |

상세: [docs/ROADMAP.md](docs/ROADMAP.md)
