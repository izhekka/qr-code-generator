import { test, expect } from '@playwright/test';
import { COPY } from '../lib/i18n';

// Switching the language must render Russian copy and leave the builder's
// rendering pipeline untouched (preview still lays out its QR modules).
test('language switch renders Russian and the builder keeps working', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'RU' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(COPY.ru.hero.title);
  await expect(page.getByRole('link', { name: COPY.ru.header.createCta }).first()).toBeVisible();

  await page.goto('/builder-static');
  await expect(page.getByRole('heading', { name: COPY.ru.steps.one })).toBeVisible();
  const qrBox = await page.locator('[data-testid="preview-qr"]').boundingBox();
  expect(qrBox?.height ?? 0).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('heading', { name: '1 · Complete the content' })).toBeVisible();
});