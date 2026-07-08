/**
 * 서비스 워커 등록 + 업데이트 감지 (v1.1-E3).
 * 새 버전이 대기(waiting) 상태가 되면 onUpdate 콜백으로 알리고,
 * 사용자가 수락하면 SKIP_WAITING → controllerchange → 새로고침.
 * 등록 실패(미지원·file://·아티팩트 환경)는 조용히 무시한다.
 */
export function registerSW(onUpdate: (apply: () => void) => void): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

  const start = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');

      const notify = (worker: ServiceWorker) => {
        onUpdate(() => worker.postMessage({ type: 'SKIP_WAITING' }));
      };

      // 이미 대기 중인 새 버전 (탭을 오래 열어둔 경우)
      if (reg.waiting && navigator.serviceWorker.controller) notify(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        next?.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) notify(next);
        });
      });

      // 최초 설치의 clients.claim()도 controllerchange를 발화시킨다 —
      // 이미 제어 중이던 페이지(= 업데이트)일 때만 새로고침한다
      let hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) {
          hadController = true;
          return;
        }
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    } catch {
      // 등록 불가 환경 — 앱은 SW 없이 동일하게 동작
    }
  };

  // useEffect 시점에 load가 이미 지났을 수 있다 — readyState로 분기 (레이스 방지)
  if (document.readyState === 'complete') {
    void start();
  } else {
    window.addEventListener('load', () => void start(), { once: true });
  }
}
