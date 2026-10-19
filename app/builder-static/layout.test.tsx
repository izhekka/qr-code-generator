import { describe, expect, it } from 'vitest';
import { metadata } from './layout';
import ogImage, { alt } from './opengraph-image';
import rootOgImage, { alt as rootAlt } from '../opengraph-image';
import { SITE_DESCRIPTION } from '@/lib/seo';

describe('builder layout metadata', () => {
  it('overrides the default title, description and canonical', () => {
    expect(metadata.title).toBe('QR code builder');
    expect(metadata.description).not.toBe(SITE_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe('/builder-static');
  });

  it('carries its own OG and Twitter wording instead of the root fallback', () => {
    expect(metadata.openGraph?.title).toBe('QR code builder');
    expect(metadata.twitter?.title).toBe('QR code builder');
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it('keeps the card format and OG properties that the shallow merge would drop', () => {
    // Nested metadata objects shallow-replace the root's, so the card
    // preference and the site-level OG fields must be restated here.
    // toMatchObject (not property access): `card`/`type` exist only on
    // variants of the Twitter/OpenGraph unions, so `.card` won't typecheck.
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(metadata.openGraph).toMatchObject({ type: 'website', siteName: 'QR' });
  });
});

describe('builder OG cover image', () => {
  it('re-exports the shared cover so og:image survives the nested layout', () => {
    expect(ogImage).toBe(rootOgImage);
    expect(alt).toBe(rootAlt);
  });
});