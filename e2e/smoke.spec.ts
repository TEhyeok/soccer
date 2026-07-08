/**
 * E2E 스모크 — PRD 4장 사용자 스토리 1:1 매핑 (M0-E1).
 * desktop/mobile 두 프로젝트로 실행된다 (playwright.config.ts).
 */
import { expect, test } from '@playwright/test';

test('스토리 1: 홈에서 전체 전술 20종을 카드로 훑어볼 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCount(20);
  await expect(page.locator('.filters__count')).toHaveText('20개');
});

test('스토리 2: 검색으로 3탭 이내에 상세 도달 — 게겐프레싱', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type=search]', '게겐');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('.card__title').first().click();
  await expect(page.locator('h1')).toHaveText('게겐프레싱');
  await expect(page.locator('.pitch')).toBeVisible();
});

test('스토리 4: 카운터 전술 링크로 바로 이동한다', async ({ page }) => {
  await page.goto('/#/t/f433');
  await expect(page.locator('h1')).toHaveText('4-3-3');
  await page
    .locator('.detail__section', { hasText: '이 전술을 깨려면' })
    .locator('.chip--link')
    .first()
    .click();
  await expect(page.locator('h1')).toHaveText('로우 블록 (두 줄 수비)');
});

test('스토리 5: 즐겨찾기는 새로고침 후에도 유지된다', async ({ page }) => {
  await page.goto('/#/t/p-gegen');
  const fav = page.locator('.detail__nav .fav');
  await expect(fav).toHaveText('☆ 즐겨찾기');
  await fav.click();
  await expect(fav).toHaveText('★ 즐겨찾기됨');

  await page.reload();
  await expect(page.locator('.detail__nav .fav')).toHaveText('★ 즐겨찾기됨');

  // 즐겨찾기만 보기 필터에도 반영
  await page.goto('/#/');
  await page.getByRole('button', { name: '★ 즐겨찾기만' }).click();
  await expect(page.locator('.card')).toHaveCount(1);
});

test('딥링크: #/t/f433 직접 진입이 동작한다 (M0 게이트 ④)', async ({ page }) => {
  await page.goto('/#/t/f433');
  await expect(page.locator('h1')).toHaveText('4-3-3');
  await expect(page.locator('.pitch')).toBeVisible();
});

test('404 폴백: 없는 전술 id는 안내와 복귀 링크를 보여준다', async ({ page }) => {
  await page.goto('/#/t/no-such-tactic');
  await expect(page.locator('.empty')).toContainText('전술을 찾을 수 없습니다');
  await page.locator('.empty .chip--link').click();
  await expect(page.locator('.card')).toHaveCount(20);
});
