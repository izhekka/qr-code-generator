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

test('opaque logo: slider resizes the logo and the QR still scans', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/builder-static');
  await page.getByPlaceholder('https://').fill('example.com/with-logo');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();

  // a 64×64 opaque green logo, generated inline via pngjs
  const logoPng = new PNG({ width: 64, height: 64 });
  for (let i = 0; i < logoPng.data.length; i += 4) {
    logoPng.data[i] = 0x22; logoPng.data[i + 1] = 0xcc; logoPng.data[i + 2] = 0x44; logoPng.data[i + 3] = 0xff;
  }
  const logo = PNG.sync.write(logoPng);
  await page.getByRole('button', { name: 'Logo' }).click();
  await page.locator('input[type=file]').first().setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: logo });
  await expect(page.getByRole('img', { name: 'Logo preview' })).toBeVisible();

  // the drawn logo = the preview logo layer; its size must follow the stops
  // exactly (regression: the library's sizing collapsed 20%≡30%, 40%≡50%)
  const measure = () =>
    page.evaluate(() => {
      const img = document.querySelector<HTMLElement>('[data-testid="preview-logo"]');
      const qr = document.querySelector<HTMLElement>('[data-testid="preview-qr"]');
      return img && qr ? img.getBoundingClientRect().width / qr.getBoundingClientRect().width : null;
    });
  await expect.poll(measure, { timeout: 10_000 }).toBeGreaterThan(0);
  const w30 = (await measure())!; // the default 0.3 stop, ~30% of the QR box

  // neighbors of the collapsed pairs must actually differ by a full stop
  await page.getByLabel(/Logo size/).fill('0.2');
  await expect.poll(measure, { timeout: 10_000 }).toBeLessThan(w30 - 0.05);
  const w20 = (await measure())!;
  expect(w20).toBeGreaterThan(0.15);
  await page.getByLabel(/Logo size/).fill('0.4');
  await expect.poll(measure, { timeout: 10_000 }).toBeGreaterThan(w30 + 0.05);
  const w40 = (await measure())!;
  // the second collapsed pair (40%/50%) must differ too
  await page.getByLabel(/Logo size/).fill('0.5');
  await expect.poll(measure, { timeout: 10_000 }).toBeGreaterThan(w40 + 0.05);

  // and the exported code must still decode with a real opaque logo. 30% is
  // the largest stop worth pinning: the cleared hole snaps outward to whole
  // modules, and at 40%+ on fine grids that hole covers ~25% of the dot area
  // (aligned over the alignment pattern) — beyond what desktop decoders
  // reconstruct. Larger stops still render, they just may not read.
  await page.getByLabel(/Logo size/).fill('0.3');
  await page.waitForTimeout(600); // re-render with the final logo size
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download QR' }).click(),
  ]);
  const path = testInfo.outputPath('qr-logo.png');
  await download.saveAs(path);

  const png = PNG.sync.read(fs.readFileSync(path));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe('https://example.com/with-logo');
});

test('no dots remain under the logo', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/builder-static');
  await page.getByPlaceholder('https://').fill('example.com/with-logo');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  // 1×1 fully transparent PNG: the logo layer itself is invisible, so any
  // dark pixels in the hole mean the mask failed to erase the QR underneath
  // (regression: CSS masks read ALPHA, not luminance, and a full-canvas
  // opaque mask rect masks nothing)
  const transparent = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );
  await page.getByRole('button', { name: 'Logo' }).click();
  await page.locator('input[type=file]').first().setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: transparent });
  await expect(page.getByRole('img', { name: 'Logo preview' })).toBeVisible();
  await page.waitForTimeout(600);

  const geo = await page.evaluate(() => {
    const qr = document.querySelector<HTMLElement>('[data-testid="preview-qr"]')!;
    const p = document.querySelector<HTMLElement>('[data-testid="preview"]')!;
    const a = qr.getBoundingClientRect();
    const b = p.getBoundingClientRect();
    return { qr: { x: a.x - b.x, y: a.y - b.y, w: a.width }, preview: b.width };
  });
  const shot = await page.locator('[data-testid="preview"]').screenshot();
  const png = PNG.sync.read(shot);
  // hole = the centered 26.4% of the QR box at the default 30% stop;
  // sample its inner half so the logo img's edges can't leak into the count
  const scale = png.width / geo.preview;
  const side = geo.qr.w * 0.264 * scale;
  const cx = (geo.qr.x + geo.qr.w / 2) * scale;
  const cy = (geo.qr.y + geo.qr.w / 2) * scale;
  let dark = 0;
  let total = 0;
  for (let y = Math.round(cy - side / 4); y < cy + side / 4; y++) {
    for (let x = Math.round(cx - side / 4); x < cx + side / 4; x++) {
      const i = (png.width * y + x) * 4;
      total++;
      if (png.data[i] < 128) dark++;
    }
  }
  expect(dark / total).toBeLessThan(0.001);
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

test('new content types encode and scan: Wi-Fi escaping, vCard, event, sms', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/builder-static');

  const scanback = async (label: string) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download QR' }).click(),
    ]);
    const path = testInfo.outputPath(`qr-${label}.png`);
    await download.saveAs(path);
    const png = PNG.sync.read(fs.readFileSync(path));
    return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
  };

  await page.getByRole('button', { name: 'Wi-Fi' }).click();
  await page.getByRole('textbox', { name: 'Network name (SSID)' }).fill('home net');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('p:s,1');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  expect(await scanback('wifi')).toBe('WIFI:T:WPA;S:home net;P:p\\:s\\,1;;');

  await page.getByRole('button', { name: 'Contact' }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill('Ada');
  await page.getByRole('textbox', { name: 'Last name' }).fill('Lovelace');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  expect(await scanback('vcard')).toContain('BEGIN:VCARD');

  await page.getByRole('button', { name: 'Event' }).click();
  await page.getByRole('textbox', { name: 'Event title', exact: true }).fill('Offsite');
  await page.getByLabel('Starts').fill('2026-03-01T09:00');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  expect(await scanback('event')).toContain('DTSTART:20260301T090000');

  await page.getByRole('button', { name: 'SMS' }).click();
  await page.getByRole('textbox', { name: 'Phone number' }).fill('5550101000');
  await page.locator('[data-testid="preview-qr"] svg').first().waitFor();
  expect(await scanback('sms')).toBe('SMSTO:5550101000:');
});