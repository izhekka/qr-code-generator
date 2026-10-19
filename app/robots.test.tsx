import { describe, expect, it } from 'vitest';
import robots from './robots';
import { SITE_URL } from '@/lib/seo';

describe('robots.txt route', () => {
  it('allows all crawlers and cites the sitemap on the pinned domain', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});