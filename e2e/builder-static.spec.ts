import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import * as fs from 'node:fs';

test('constructor downloads a scannable QR of the typed URL', async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  await page.goto('/builder-static');
  await expect(page.locator('header').first()).toHaveClass(/sticky/);
  await page.getByPlaceholder('https://').fill('example.com/hello-e2e');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  const path = testInfo.outputPath('qr.png');
  await download.saveAs(path);

  const png = PNG.sync.read(fs.readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('https://example.com/hello-e2e');
});

test('landing page has the hook, sticky header and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toBeAttached();
  const header = page.locator('header').first();
  await expect(header).toHaveClass(/sticky/);
  await expect(page.getByRole('navigation').locator('a', { hasText: 'FAQ' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Static QR' }).first()).toBeVisible();
  await expect(page.getByText('No sign-ups. No payments. Just grab your working QR code.')).toBeVisible();
  await expect(page.getByText('Will it expire?')).toBeVisible();
});