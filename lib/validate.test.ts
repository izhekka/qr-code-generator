import { describe, expect, it } from 'vitest';
import { getValidationError, isEncodable } from './validate';
import { DEFAULT_SETTINGS } from './settings';
import type { Settings } from './types';

const settings = (over: (s: Settings) => Settings): Settings =>
  over(structuredClone(DEFAULT_SETTINGS));

describe('getValidationError', () => {
  it('rejects empty defaults (no link typed yet)', () => {
    expect(getValidationError(DEFAULT_SETTINGS)).toBe('enterUrl');
  });
  it('accepts a link', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, link: 'example.com' } }));
    expect(getValidationError(s)).toBeNull();
  });
  it('rejects text that is not a link', () => {
    for (const bad of ['not a link', 'exa mple.com', '!']) {
      const s = settings(s => ({ ...s, content: { ...s.content, link: bad } }));
      expect(getValidationError(s)).toBe('invalidUrl');
    }
  });
  it('rejects non-web schemes', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, link: 'javascript:alert(1)' } }));
    expect(getValidationError(s)).toBe('invalidUrl');
  });
  it('rejects an invalid e-mail', () => {
    const s = settings(s => ({ ...s, content: { type: 'email', link: '', text: '', email: { to: 'bad', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toBe('invalidEmail');
  });
  it('rejects an empty phone', () => {
    const s = settings(s => ({ ...s, content: { type: 'call', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toBe('enterPhone');
  });
  it('rejects oversized payloads', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2501) } }));
    expect(getValidationError(s)).toBe('tooLong');
  });

  it('accepts a payload exactly at the Model 2 byte capacity (EC M)', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2331) } }));
    expect(getValidationError(s)).toBeNull();
  });

  it('rejects a payload one char past the Model 2 capacity (EC M)', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2332) } }));
    expect(getValidationError(s)).toBe('tooLong');
  });

  it('enforces the tighter EC-H capacity when a logo is set', () => {
    const withLogo = (text: string) => settings(s => ({
      ...s, logo: { dataUrl: 'data:image/png;base64,AAA', size: 0.4 },
      content: { ...s.content, type: 'text', text },
    }));
    expect(getValidationError(withLogo('x'.repeat(1273)))).toBeNull();
    expect(getValidationError(withLogo('x'.repeat(1274)))).toBe('tooLong');
  });

  it('rejects an empty text field', () => {
    const s = settings(s => ({ ...s, content: { type: 'text', link: '', text: '  ', email: { to: '', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toBe('enterText');
  });
});

describe('isEncodable', () => {
  it('accepts the default (empty) content', () => {
    expect(isEncodable(DEFAULT_SETTINGS)).toBe(true);
  });

  it('is false exactly at one char past the EC-M ceiling', () => {
    const over = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2332) } }));
    const at = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2331) } }));
    expect(isEncodable(over)).toBe(false);
    expect(isEncodable(at)).toBe(true);
  });

  it('is false for an overflowing payload even when validation fails on validity first', () => {
    // an invalid e-mail whose oversized body would still overflow the engine —
    // capacity, not the error key, decides encodability
    const s = settings(s => ({
      ...s,
      content: { ...s.content, type: 'email', email: { to: 'bad', subject: '', body: 'x'.repeat(2400) } },
    }));
    expect(getValidationError(s)).toBe('invalidEmail');
    expect(isEncodable(s)).toBe(false);
  });
});