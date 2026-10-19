import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/lib/seo';

describe('sitemap.xml route', () => {
  it('lists both pages on the pinned domain with priorities', () => {
    const entries = sitemap();
    expect(
      entries.map(({ url, priority }) => ({ url, priority })),
    ).toEqual([
      // Root without a trailing slash: matches the canonical the prerendered
      // landing page emits (`<link rel="canonical" href="https://qr.w-app.online">`).
      { url: SITE_URL, priority: 1 },
      { url: `${SITE_URL}/builder-static`, priority: 0.8 },
    ]);
    expect(entries.every((e) => e.lastModified instanceof Date)).toBe(true);
  });
});