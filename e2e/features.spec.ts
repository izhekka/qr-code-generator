import { test, expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import * as fs from 'node:fs';

async function downloadQr(page: Page, format: string, size?: string): Promise<string> {
  await page.goto('/builder-static');
  await page.getByPlaceholder('https://').fill('example.com/e2e-format');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  await page.getByLabel('Format').selectOption(format);
  if (size) await page.getByLabel('Size').selectOption(size);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  return await download.path();
}

test('exports each format: SVG well-formed, rasters sized correctly, PNG scanback', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const sizes: Record<string, string> = { png: '512', jpeg: '1024', webp: '1024', svg: '' };

  const svg = fs.readFileSync(await downloadQr(page, 'svg'), 'utf-8');
  expect(svg).not.toContain('<?xml');
  expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  expect(svg).toContain('viewBox="0 0 1000 1000"'); // the nested QR layer

  const pngPath = await downloadQr(page, 'png', sizes.png);
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  expect(png.width).toBe(512);
  expect(png.height).toBe(512);
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('https://example.com/e2e-format');

  for (const format of ['jpeg', 'webp']) {
    const path = await downloadQr(page, format, sizes[format]);
    const stat = fs.statSync(path);
    expect(stat.size).toBeGreaterThan(0);
  }
});

test('scanback works with sticker frame and logo composited', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/builder-static');
  await page.getByPlaceholder('https://').fill('example.com/with-sticker');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();

  // 1×1 transparent PNG as the logo (file input lives in the Logo tab)
  const logo = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  await page.getByRole('button', { name: 'Logo' }).click();
  await page.locator('input[type=file]').first().setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: logo });
  // The 1px transparent logo draws nothing; with dot-hiding on it would erase
  // the QR's center entirely, so switch clearing off for this export.
  await page.getByRole('checkbox', { name: 'Clear dots behind the logo' }).click();

  // pick the square sticker frame
  await page.getByRole('button', { name: 'Sticker' }).click();
  await page.getByRole('button', { name: /Sticker square/ }).first().click();
  await page.waitForTimeout(400); // re-render with logo + frame

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  const path = testInfo.outputPath('qr-sticker.png');
  await download.saveAs(path);

  const png = PNG.sync.read(fs.readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('https://example.com/with-sticker');
});

test('switching content type updates the encoded payload', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/builder-static');
  await page.getByRole('button', { name: /E-mail/i }).click();
  await page.getByRole('textbox', { name: 'To', exact: true }).fill('hello@example.com');
  await page.getByRole('textbox', { name: 'Subject', exact: true }).fill('Hi there');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  const path = testInfo.outputPath('qr-email.png');
  await download.saveAs(path);

  const png = PNG.sync.read(fs.readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('mailto:hello@example.com?subject=Hi%20there');
});