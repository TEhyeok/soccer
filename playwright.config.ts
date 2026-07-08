import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

// 이 컨테이너에는 시스템 Chromium이 사전 설치되어 있다 (CI에서는 playwright install 사용)
const localChromium = '/opt/pw-browsers/chromium';
const executablePath = !process.env.CI && fs.existsSync(localChromium) ? localChromium : undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npx vite preview --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
});
