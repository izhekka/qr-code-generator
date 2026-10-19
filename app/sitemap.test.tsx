import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/lib/seo';
import { GUIDES } from '@/lib/guides';

describe('sitemap.xml route', () => {
  it('lists the app pages, the guides index and every guide on the pinned domain', () => {
    const entries = sitemap();
    expect(
      entries.map(({ url, priority }) => ({ url, priority })),
    ).toEqual([
      // Root without a trailing slash: matches the canonical the prerendered
      // landing page emits (`<link rel="canonical" href="https://qr.w-app.online">`).
      { url: SITE_URL, priority: 1 },
      { url: `${SITE_URL}/builder-static`, priority: 0.8 },
      { url: `${SITE_URL}/guides`, priority: 0.8 },
      ...GUIDES.map((g) => ({ url: `${SITE_URL}/guides/${g.slug}`, priority: 0.7 })),
    ]);
    expect(entries.every((e) => e.lastModified instanceof Date)).toBe(true);
  });
});