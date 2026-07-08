/**
 * 단일 HTML 시뮬레이터 빌드 — 배포 없이 앱 전체를 파일 하나로 묶는다.
 * 용도: Cloudflare 연결 전 PM 눈 검증(아티팩트/카톡 전달), 오프라인 데모.
 * 사용: npm run build && node scripts/build-single.mjs [--fragment]
 *   기본: dist/single.html (완전한 HTML 문서)
 *   --fragment: <head> 골격 없이 body 콘텐츠만 (아티팩트 게시용)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const assets = readdirSync('dist/assets');
const jsFile = assets.find((f) => f.endsWith('.js'));
const cssFile = assets.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) {
  console.error('dist/assets 에 빌드 산출물이 없습니다. 먼저 npm run build 를 실행하세요.');
  process.exit(1);
}

// 인라인 <script> 안의 '</script' 시퀀스는 HTML 파서를 깨뜨린다 — 표준 이스케이프
const js = readFileSync(`dist/assets/${jsFile}`, 'utf-8').replaceAll('</script', '<\\/script');
const css = readFileSync(`dist/assets/${cssFile}`, 'utf-8');

const title = '택틱북 — 축구 전략·전술 모음집';
const body = `<title>${title}</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>`;

if (process.argv.includes('--fragment')) {
  writeFileSync('dist/single-fragment.html', body);
  console.log(`✓ dist/single-fragment.html (${Math.round(body.length / 1024)}KB) — 아티팩트 게시용`);
} else {
  const full = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0d1b12" />
</head>
<body>
${body}
</body>
</html>`;
  writeFileSync('dist/single.html', full);
  console.log(`✓ dist/single.html (${Math.round(full.length / 1024)}KB) — 브라우저에서 바로 열기`);
}
