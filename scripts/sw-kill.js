/**
 * 서비스 워커 kill switch (비상용 — ADR/DEPLOY.md 참조).
 * 캐시 사고 시 이 파일 내용을 dist/sw.js 자리(배포 경로 /sw.js)에 배포하면
 * 기존 SW가 스스로 해제되고 캐시를 비운 뒤 모든 열린 탭을 네트워크 버전으로 이동시킨다.
 * 리허설: scripts 참고 — v1.1 게이트에서 1회 실증 완료.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.registration
      .unregister()
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  );
});
