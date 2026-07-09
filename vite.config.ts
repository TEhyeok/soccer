import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        // 단일 파일 시뮬레이터 빌드: 3D lazy 청크까지 한 파일에 합쳐
        // 아티팩트/오프라인 HTML에서도 동작하게 한다. 배포 빌드는 분할 유지.
        inlineDynamicImports: process.env.SINGLE_FILE === '1',
      },
    },
    // 3D 포함 단일 번들은 원래 큰 것이 정상 — 경고 소음 방지 (분할 빌드는 기본값)
    chunkSizeWarningLimit: process.env.SINGLE_FILE === '1' ? 1200 : 500,
  },
});
