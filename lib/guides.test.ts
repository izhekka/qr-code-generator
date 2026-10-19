import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides';

const FORBIDDEN = new Set([
  'constructor', 'hasOwnProperty', 'isPrototypeOf',
  'propertyIsEnumerable', 'toLocaleString', 'toString',
  'valueOf', '__proto__',
]);

function entryBySlug(slug: string) {
  const entry = GUIDES.find((g) => g.slug === slug);
  expect(entry, `registry must contain ${slug}`).toBeDefined();
  return entry!;
}

describe('guide registry invariants', () => {
  it('keeps slugs unique, lowercase and hyphenated', () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    for (const g of GUIDES) {
      expect(g.slug).toMatch(/^[a-z0-9-]+$/);
      expect(g.slug.startsWith('-') || g.slug.endsWith('-')).toBe(false);
    }
  });

  it('never names a slug after an Object.prototype property', () => {
    for (const g of GUIDES) {
      expect(FORBIDDEN.has(g.slug)).toBe(false);
    }
  });

  it('gives every section something to read — paragraphs or steps', () => {
    for (const g of GUIDES) {
      for (const s of g.sections) {
        // A section with neither would render as a bare h2.
        expect((s.paragraphs?.length ?? 0) + (s.steps?.length ?? 0)).toBeGreaterThan(0);
      }
    }
  });

  it('requires the fields every guide page depends on', () => {
    for (const g of GUIDES) {
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.description).toMatch(/^\S.{20,200}$/);
      expect(g.keywords).toMatch(/^[a-z0-9 ]+$/);
      expect(g.intro.length).toBeGreaterThan(0);
      expect(g.sections.length).toBeGreaterThan(0);
      expect(g.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('required guides', () => {
  it('contains all seven batch-1 intents', () => {
    const slugs = GUIDES.map((g) => g.slug);
    for (const slug of [
      'link-qr-code-generator',
      'wifi-qr-code-generator',
      'vcard-qr-code-generator',
      'event-qr-code-generator',
      'sms-qr-code-generator',
      'instagram-qr-code-generator',
      'facebook-qr-code-generator',
    ]) {
      expect(slugs).toContain(slug);
      entryBySlug(slug);
    }
  });

  it('exposes the link guide with its target query', () => {
    const guide = entryBySlug('link-qr-code-generator');
    expect(guide.keywords).toBe('qr code generator for a link');
    expect(guide.title).toBe('QR code generator for a link');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the wifi guide with its target query', () => {
    const guide = entryBySlug('wifi-qr-code-generator');
    expect(guide.keywords).toBe('wifi qr code generator');
    expect(guide.title).toBe('Wi-Fi QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the vcard guide with its target query', () => {
    const guide = entryBySlug('vcard-qr-code-generator');
    expect(guide.keywords).toBe('vcard qr code generator');
    expect(guide.title).toBe('vCard QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the event guide with its target query', () => {
    const guide = entryBySlug('event-qr-code-generator');
    expect(guide.keywords).toBe('event qr code generator');
    expect(guide.title).toBe('Event QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the sms guide with its target query', () => {
    const guide = entryBySlug('sms-qr-code-generator');
    expect(guide.keywords).toBe('sms qr code generator');
    expect(guide.title).toBe('SMS QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the instagram guide with its target query', () => {
    const guide = entryBySlug('instagram-qr-code-generator');
    expect(guide.keywords).toBe('instagram qr code generator');
    expect(guide.title).toBe('Instagram QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('exposes the facebook guide with its target query', () => {
    const guide = entryBySlug('facebook-qr-code-generator');
    expect(guide.keywords).toBe('facebook qr code generator');
    expect(guide.title).toBe('Facebook QR code generator');
    expect(guide.sections.some((s) => s.steps && s.steps.length >= 3)).toBe(true);
    expect(guide.faq!.length).toBeGreaterThanOrEqual(3);
  });

  it('completes the batch — all seven intents registered', () => {
    expect(GUIDES.length).toBe(7);
  });

  it('targets one distinct keyword query per guide', () => {
    expect(new Set(GUIDES.map((g) => g.keywords)).size).toBe(GUIDES.length);
  });
});