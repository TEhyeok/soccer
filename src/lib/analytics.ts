/**
 * 쿠키리스 경량 계측 래퍼 (ADR-006).
 * - VITE_ANALYTICS_URL 미설정 시 no-op — 계측 없이도 앱은 완전히 동일하게 동작한다.
 * - 실패는 조용히 삼킨다: 계측이 앱을 깨뜨리면 안 된다 (M0 게이트: 차단 시 무회귀).
 * - 이벤트 정의는 docs/EVENTS.md (이벤트 사전) 참조.
 */
const endpoint: string | undefined = import.meta.env.VITE_ANALYTICS_URL;

export function track(event: string, props: Record<string, string | number> = {}): void {
  try {
    if (import.meta.env.DEV) {
      console.debug('[track]', event, props);
    }
    if (!endpoint) return;
    const body = JSON.stringify({
      event,
      props,
      path: window.location.hash || '#/',
      ts: Date.now(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch {
    // 계측 실패는 무시
  }
}

/** window.onerror → client_error 이벤트 (Sentry 없이 프로덕션 오류 인지) */
export function initErrorTracking(): void {
  window.addEventListener('error', (e) => {
    track('client_error', { message: String(e.message).slice(0, 200) });
  });
  window.addEventListener('unhandledrejection', (e) => {
    track('client_error', { message: String(e.reason).slice(0, 200), kind: 'rejection' });
  });
}
