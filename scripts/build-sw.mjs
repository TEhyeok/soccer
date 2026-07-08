/**
 * 서비스 워커 생성 (v1.1-E3, 빌드 후 실행).
 * dist/ 산출물을 스캔해 정확한 프리캐시 목록과 캐시 버전을 주입한 sw.js를 dist/에 쓴다.
 * 전략: 내비게이션 = 네트워크 우선(오프라인 시 캐시된 index.html),
 *       해시된 에셋 = 캐시 우선. 새 배포 = 새 캐시 버전 → 구 캐시 삭제.
 * kill switch 절차: docs/DEPLOY.md 참조 (sw.js를 자기 해제 버전으로 교체 배포).
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const assets = readdirSync('dist/assets').map((f) => `/assets/${f}`);
const statics = readdirSync('dist')
  .filter((f) => /\.(png|webmanifest|svg)$/.test(f))
  .map((f) => `/${f}`);
const precache = ['/', '/index.html', ...assets, ...statics];

// 캐시 버전 = 버전 + 프리캐시 목록 해시 (내용이 바뀌면 반드시 새 캐시)
const hash = createHash('sha256').update(JSON.stringify(precache)).digest('hex').slice(0, 8);
const CACHE = `tacticbook-${pkg.version}-${hash}`;

const sw = `// 자동 생성 파일 — scripts/build-sw.mjs (수정 금지)
const CACHE = ${JSON.stringify(CACHE)};
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 내비게이션: 네트워크 우선, 오프라인이면 캐시된 앱 셸
  // ignoreVary: 서버가 Vary 헤더를 보내면 crossorigin 요청과 매칭이 실패할 수 있다
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html', { ignoreVary: true }))
    );
    return;
  }
  // 정적 에셋(해시 파일명): 캐시 우선
  e.respondWith(
    caches.match(e.request, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
    )
  );
});
`;

writeFileSync('dist/sw.js', sw);
console.log(`✓ dist/sw.js (${CACHE}, 프리캐시 ${precache.length}개)`);
