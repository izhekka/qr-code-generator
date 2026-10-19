// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GuidesIndexPage, { metadata as guidesIndexMetadata } from './page';
import ogImage, { alt } from './opengraph-image';
import rootOgImage, { alt as rootAlt } from '../opengraph-image';
import { GUIDES } from '@/lib/guides';

describe('guides index', () => {
  it('lists every guide with a link into the builder', () => {
    render(<GuidesIndexPage />);
    for (const g of GUIDES) {
      // The card's accessible name is title + description concatenated; match
      // on the title fragment rather than an exact name.
      expect(screen.getByRole('link', { name: new RegExp(g.title) })).toHaveAttribute('href', `/guides/${g.slug}`);
    }
    expect(screen.getByRole('heading', { name: 'QR code guides' })).toBeInTheDocument();
  });

  it('sets index metadata with canonical and its own card wording', () => {
    expect(guidesIndexMetadata.title).toBe('QR code guides');
    expect(guidesIndexMetadata.alternates?.canonical).toBe('/guides');
    expect(guidesIndexMetadata.openGraph).toMatchObject({ type: 'website', siteName: 'QR' });
    expect(guidesIndexMetadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});

describe('guides OG cover image', () => {
  it('re-exports the shared cover so og:image exists on the index and every guide', () => {
    expect(ogImage).toBe(rootOgImage);
    expect(alt).toBe(rootAlt);
  });
});