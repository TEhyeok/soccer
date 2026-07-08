/**
 * v1.2 편집기 E2E — 페르소나 시나리오: "보드를 만들어 저장하고 다시 연다".
 */
import { expect, test, type Page } from '@playwright/test';

/** 논리 좌표(0~100) → 보드 위 화면 좌표 (preserveAspectRatio 레터박스 보정 — coords.ts와 동일) */
async function pt(page: Page, x: number, y: number) {
  const bb = await page.locator('.editor__board svg.pitch').boundingBox();
  if (!bb) throw new Error('보드 없음');
  const scale = Math.min(bb.width / 74, bb.height / 111);
  const ox = (bb.width - 74 * scale) / 2;
  const oy = (bb.height - 111 * scale) / 2;
  const sx = 3 + (x / 100) * 68;
  const sy = 3 + ((100 - y) / 100) * 105;
  return { cx: bb.x + ox + sx * scale, cy: bb.y + oy + sy * scale };
}

test('편집기: 템플릿 시작 → 드래그 → 화살표 → 저장 → 내 전술 → 재편집', async ({ page }) => {
  await page.goto('/#/editor');
  await page.getByRole('button', { name: '기본 11명 (4-4-2)로 시작' }).click();

  // 선수 드래그 (st2: 62,76 → 75,88)
  const from = await pt(page, 62, 76);
  const to = await pt(page, 75, 88);
  await page.mouse.move(from.cx, from.cy);
  await page.mouse.down();
  await page.mouse.move(to.cx, to.cy, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.editor__selected')).toBeVisible();

  // 화살표 그리기
  await page.getByRole('button', { name: '패스 화살표' }).click();
  const a1 = await pt(page, 40, 50);
  const a2 = await pt(page, 70, 85);
  await page.mouse.move(a1.cx, a1.cy);
  await page.mouse.down();
  await page.mouse.move(a2.cx, a2.cy, { steps: 6 });
  await page.mouse.up();

  // 저장 → 내 전술 목록
  await page.locator('.editor__name').fill('E2E 테스트 전술');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('.my .card')).toHaveCount(1);
  await expect(page.locator('.card__summary')).toContainText('11명 · 1개 화살표');

  // 새로고침 후 유지 + 재편집 진입
  await page.reload();
  await expect(page.locator('.my .card')).toHaveCount(1);
  await page.getByRole('button', { name: '편집' }).click();
  await expect(page.locator('.editor__name')).toHaveValue('E2E 테스트 전술');
});

test('편집기: 상세 → "이 전술로 보드 만들기" 템플릿 복사 (출처 표시)', async ({ page }) => {
  await page.goto('/#/t/f433');
  await page.getByRole('button', { name: '이 전술로 보드 만들기' }).click();
  await expect(page.locator('.editor__name')).toHaveValue('4-3-3 (내 버전)');
  await expect(page.locator('.editor__source')).toContainText('원본: 4-3-3');
});

test('편집기: draft는 강제 새로고침 후 복원된다 (v1.2 게이트 ④)', async ({ page }) => {
  await page.goto('/#/editor');
  await page.getByRole('button', { name: '빈 보드로 시작' }).click();
  await page.locator('.editor__name').fill('복원 테스트');
  await page.getByRole('button', { name: '+ 우리 선수' }).click();
  await page.waitForTimeout(600); // draft 디바운스 저장 대기

  await page.reload();
  await expect(page.locator('.editor__name')).toHaveValue('복원 테스트');
});
