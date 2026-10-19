import { expect, test } from '@playwright/test';

test('manifest is served with installable content and icons resolve', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBeTruthy();
  const manifest = await res.json();
  expect(manifest.display).toBe('fullscreen');
  expect(manifest.start_url).toBe('/');
  expect(manifest.id).toBe('/');

  const icons = (manifest.icons ?? []) as { src: string }[];
  expect(icons.length).toBeGreaterThanOrEqual(3);
  for (const icon of icons) {
    expect((await request.get(icon.src)).status()).toBe(200);
  }
});

test('the builder renders offline after one online visit (Chromium)', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'offline SW verification runs on Chromium only');

  await page.goto('/builder-static');
  // Registration is production-only; wait until the worker is active and
  // (via clients.claim()) controlling this tab before severing the network.
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state === 'activated' && navigator.serviceWorker.controller !== null;
  });

  await context.setOffline(true);
  await page.reload();
  // Prove the builder actually works offline: type content, QR renders.
  await expect(page.getByPlaceholder('https://')).toBeVisible();
  await page.getByPlaceholder('https://').fill('example.com/offline');
  await expect(page.locator('[data-testid="preview-qr"] svg').first()).toBeVisible();
});