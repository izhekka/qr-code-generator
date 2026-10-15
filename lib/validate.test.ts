import { describe, expect, it } from 'vitest';
import { getValidationError } from './validate';
import { DEFAULT_SETTINGS } from './settings';
import type { Settings } from './types';

const settings = (over: (s: Settings) => Settings): Settings =>
  over(structuredClone(DEFAULT_SETTINGS));

describe('getValidationError', () => {
  it('rejects empty defaults (no link typed yet)', () => {
    expect(getValidationError(DEFAULT_SETTINGS)).not.toBeNull();
  });
  it('accepts a link', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, link: 'example.com' } }));
    expect(getValidationError(s)).toBeNull();
  });
  it('rejects text that is not a link', () => {
    for (const bad of ['not a link', 'exa mple.com', '!']) {
      const s = settings(s => ({ ...s, content: { ...s.content, link: bad } }));
      expect(getValidationError(s)).toMatch(/valid link/i);
    }
  });
  it('rejects non-web schemes', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, link: 'javascript:alert(1)' } }));
    expect(getValidationError(s)).toMatch(/valid link/i);
  });
  it('rejects an invalid e-mail', () => {
    const s = settings(s => ({ ...s, content: { type: 'email', link: '', text: '', email: { to: 'bad', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toMatch(/valid e-mail/i);
  });
  it('rejects an empty phone', () => {
    const s = settings(s => ({ ...s, content: { type: 'call', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '' } }));
    expect(getValidationError(s)).toMatch(/phone/i);
  });
  it('rejects oversized payloads', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2501) } }));
    expect(getValidationError(s)).toMatch(/too long/i);
  });

  it('accepts a payload at the 2500-character boundary', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: 'x'.repeat(2500) } }));
    expect(getValidationError(s)).toBeNull();
  });

  it('rejects an empty text field', () => {
    const s = settings(s => ({ ...s, content: { ...s.content, type: 'text', text: '  ' } }));
    expect(getValidationError(s)).toMatch(/text/i);
  });
});