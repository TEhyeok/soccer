/// <reference types="vite/client" />

/** package.json version — vite.config.ts define으로 주입 */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** 쿠키리스 애널리틱스 수집 엔드포인트 (미설정 시 계측 no-op) */
  readonly VITE_ANALYTICS_URL?: string;
}
