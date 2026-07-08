/**
 * PWA 오프라인 스모크 (v1.1 게이트 ④).
 * SW 프리캐시(install 완료 = addAll 완료) 후 오프라인 전환 → 앱 셸이 캐시에서 열려야 한다.
 */
import { expect, test } from '@playwright/test';
import { TACTICS } from '../src/data';

test('PWA: 오프라인에서도 앱이 열린다', async ({ page, context }) => {
  await page.goto('/');
  // controller 확보까지 대기: install(addAll) → activate(claim) 완료 = 프리캐시 + 페이지 제어 보장
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        if (navigator.serviceWorker.controller) return resolve();
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        });
      })
  );

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.card')).toHaveCount(TACTICS.length);

  // 오프라인에서 딥링크 새로고침도 캐시된 앱 셸로 동작
  await page.goto('/#/t/f433');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('4-3-3');
  await context.setOffline(false);
});
