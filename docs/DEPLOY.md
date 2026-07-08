# 배포 가이드 — Cloudflare Pages (ADR-003)

| 문서 버전 | v1.0 (M0) | 갱신일 | 2026-07-08 |
|---|---|---|---|

## 왜 Cloudflare Pages인가

무료 티어 무제한 대역폭 + **PR마다 프리뷰 URL 자동 생성**. 프리뷰 URL은 "AI가 만들고 → PM이 URL에서 눈으로 확인"하는 M0 검증 루프의 핵심이다. 해시 라우팅이라 SPA rewrite 설정도 필요 없다.

## 최초 연결 (PM 수동 작업, 1회 — 약 10분)

1. [Cloudflare 대시보드](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**
2. GitHub 계정 연결 → `TEhyeok/soccer` 저장소 선택
3. 빌드 설정:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - 환경 변수(선택): `VITE_ANALYTICS_URL` — 계측 엔드포인트 (미설정 시 계측 no-op)
4. Save and Deploy → 발급된 `*.pages.dev` URL 확인

이후는 자동이다: **main 머지 → 프로덕션 갱신, PR 생성 → 프리뷰 URL이 PR에 코멘트**된다.

## 배포 후 확인 (M0 게이트)

- [ ] `https://<프로젝트>.pages.dev/#/t/f433` 딥링크가 새로고침 후에도 동작
- [ ] 폰 실기기(iOS Safari + Android Chrome)에서 접속 확인
- [ ] main 커밋 → 프로덕션 반영 리드타임 10분 이내
- [ ] PR 프리뷰 URL 생성 확인

## 브랜치 보호 (PM 수동 작업, 1회)

GitHub → Settings → Branches → `main` 보호 규칙:
- Require status checks: **CI / verify** 필수
- CI 실패 시 머지 불가 (M0 게이트: 레드 머지 0건)

## 커스텀 도메인 (선택)

Pages 프로젝트 → Custom domains → 도메인 추가. 도메인 구입은 PM 수동 작업(로드맵 상시 트랙 — 브랜드 자산).

## 롤백

Pages 대시보드 → Deployments → 이전 배포 선택 → **Rollback**. 정적 사이트라 즉시 전환된다.

## 서비스 워커 kill switch (비상 절차, v1.1+)

캐시 사고(깨진 버전이 캐시에 고정되는 등)가 나면 일반 롤백만으로는 부족할 수 있다 —
사용자 브라우저에 이미 설치된 SW가 구 캐시를 계속 서빙하기 때문이다. 이때:

1. `scripts/sw-kill.js`의 내용을 빌드 산출물의 `/sw.js` 자리에 배포한다
   (가장 간단한 방법: `scripts/build-sw.mjs` 실행 대신 `cp scripts/sw-kill.js dist/sw.js` 후 배포)
2. 사용자가 재방문하면 브라우저의 SW 업데이트 체크가 kill 버전을 설치하고,
   kill SW는 **스스로 등록 해제 + 캐시 전량 삭제 + 열린 탭을 네트워크 버전으로 이동**시킨다
3. 사고 원인을 고친 뒤 정상 빌드를 다시 배포하면 SW가 재설치된다

리허설 실증(v1.1 게이트): 로컬에서 위 절차 수행 → 등록 1→0, 캐시 1→0, 앱은 네트워크로 정상 로드 확인 완료.
