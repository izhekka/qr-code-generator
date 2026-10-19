import { describe, expect, it, vi } from 'vitest';
import { metadata } from './layout';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/seo';

// globals.css is stubbed for the same reason as layout.test.tsx: vite's
// PostCSS loader rejects the repo's Tailwind 4 config.
vi.mock('./globals.css', () => ({}));

describe('root layout metadata', () => {
  it('pins the domain, self-canonicalizes and defaults the title', () => {
    expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    expect(metadata.title).toEqual({
      template: '%s — QR',
      default: SITE_TITLE,
    });
    expect(metadata.description).toBe(SITE_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe('/');
  });

  it('builds Open Graph and Twitter cards without hard-coding the domain', () => {
    expect(metadata.openGraph).toMatchObject({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      type: 'website',
      locale: 'en_US',
      siteName: 'QR',
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('omits google verification when the env var is absent', () => {
    // Assumption: nothing exports NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in this
    // checkout's env (nothing in .env.local does). A locally exported value
    // would make the metadata carry verification and fail this test.
    expect(metadata.verification).toBeUndefined();
  });

  it('enables the iOS home-screen app fallback (hides Safari UI)', () => {
    expect(metadata.appleWebApp).toEqual({
      capable: true,
      title: 'QR',
      statusBarStyle: 'default',
    });
  });
});