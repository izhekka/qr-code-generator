// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GuidePage, { generateMetadata, generateStaticParams } from './page';
import ogImage, { alt } from './opengraph-image';
import rootOgImage, { alt as rootAlt } from '../opengraph-image';
import { GUIDES } from '@/lib/guides';

const LINK_SLUG = 'link-qr-code-generator';
const params = () => Promise.resolve({ slug: LINK_SLUG });

describe('guide [slug] template', () => {
  it('prerenders one path per registry entry', () => {
    expect(generateStaticParams()).toEqual(
      GUIDES.map((g) => ({ slug: g.slug })),
    );
  });

  it('sets per-slug metadata with a self-canonical and its own card wording', async () => {
    const meta = await generateMetadata({ params: params() });
    expect(meta.title).toBe('QR code generator for a link');
    expect(meta.alternates?.canonical).toBe(`/guides/${LINK_SLUG}`);
    expect(meta.openGraph).toMatchObject({ title: 'QR code generator for a link', type: 'website', siteName: 'QR' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('renders a NON-FIRST slug with its own content — not GUIDES[0]', async () => {
    // A template that pinned GUIDES[0] would pass every first-slug assertion;
    // render a later entry and require its own title/metadata.
    const sms = GUIDES.find((g) => g.slug === 'sms-qr-code-generator')!;
    expect(sms).toBe(GUIDES[4]);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: sms.slug }) });
    expect(meta.title).toBe(sms.title);
    expect(meta.description).toBe(sms.description);
    render(await GuidePage({ params: Promise.resolve({ slug: sms.slug }) }));
    expect(screen.getByRole('heading', { level: 1, name: sms.title })).toBeInTheDocument();
  });

  it('renders title, sections, FAQ and the builder CTA', async () => {
    render(await GuidePage({ params: params() }));
    expect(screen.getByRole('heading', { level: 1, name: 'QR code generator for a link' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is a link QR code?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open the QR builder' })).toHaveAttribute('href', '/builder-static');
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.textContent!)).toEqual(
      expect.objectContaining({ '@type': 'Article', headline: 'QR code generator for a link', datePublished: '2026-10-19' }),
    );
  });
});

describe('guide [slug] OG cover image', () => {
  it('lives in this segment — file-convention images do not inherit into it', () => {
    // The [slug] pages set their own openGraph, and the guides-level
    // opengraph-image does not cascade into a deeper segment with its own
    // metadata: the re-export must sit right here.
    expect(ogImage).toBe(rootOgImage);
    expect(alt).toBe(rootAlt);
  });
});