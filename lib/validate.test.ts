import { describe, expect, it } from 'vitest';
import { getValidationError, isEncodable } from './validate';
import { DEFAULT_SETTINGS } from './settings';
import type { Settings } from './types';

const settings = (over: (s: Settings) => Settings): Settings =>
  over(structuredClone(DEFAULT_SETTINGS));

// The inline group defaults below can be replaced with `content: { ...s.content, … }`
// once every test builds on DEFAULT_SETTINGS; the literal form keeps these three
// self-contained until then (vcard/wifi/event/sms are required-by-type).
const inlineExtras = {
  vcard: { firstName: '', lastName: '', org: '', title: '', phone: '', email: '', website: '', address: '' },
  wifi: { ssid: '', password: '', security: 'WPA' as const, hidden: false },
  event: { title: '', start: '', end: '', allDay: false, location: '', description: '' },
  sms: { phone: '', message: '' },
};

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
    const s = settings(s => ({ ...s, content: { type: 'email', link: '', text: '', email: { to: 'bad', subject: '', body: '' }, phone: '', ...inlineExtras } }));
    expect(getValidationError(s)).toBe('invalidEmail');
  });
  it('rejects an empty phone', () => {
    const s = settings(s => ({ ...s, content: { type: 'call', link: '', text: '', email: { to: '', subject: '', body: '' }, phone: '', ...inlineExtras } }));
    expect(getValidationError(s)).toBe('enterPhone');
  });
  it('requires a name for a contact card and checks optional fields only when filled', () => {
    const empty = settings(s => ({ ...s, content: { ...s.content, type: 'vcard', vcard: { ...s.content.vcard } } }));
    expect(getValidationError(empty)).toBe('enterName');
    const badEmail = settings(s => ({ ...s, content: { ...s.content, type: 'vcard',
      vcard: { firstName: 'Ada', lastName: '', org: '', title: '', phone: '', email: 'ada', website: 'not a url', address: '' } } }));
    expect(getValidationError(badEmail)).toBe('invalidEmail');
    const good = settings(s => ({ ...s, content: { ...s.content, type: 'vcard',
      vcard: { firstName: ' Ada ', lastName: '', org: '', title: '', phone: '', email: '', website: '', address: '' } } }));
    expect(getValidationError(good)).toBeNull();
  });

  it('requires an SSID, and a password unless the network is open', () => {
    const noSsid = settings(s => ({ ...s, content: { ...s.content, type: 'wifi' } }));
    expect(getValidationError(noSsid)).toBe('enterSsid');
    const noPassword = settings(s => ({ ...s, content: { ...s.content, type: 'wifi',
      wifi: { ssid: 'home', password: '', security: 'WPA', hidden: false } } }));
    expect(getValidationError(noPassword)).toBe('enterPassword');
    const openOk = settings(s => ({ ...s, content: { ...s.content, type: 'wifi',
      wifi: { ssid: 'cafe', password: '', security: 'nopass', hidden: false } } }));
    expect(getValidationError(openOk)).toBeNull();
  });

  it('requires a title and start, and rejects an end before the start', () => {
    const noTitle = settings(s => ({ ...s, content: { ...s.content, type: 'event' } }));
    expect(getValidationError(noTitle)).toBe('enterTitle');
    const noStart = settings(s => ({ ...s, content: { ...s.content, type: 'event' } }));
    expect(getValidationError(noStart)).toBe('enterTitle'); // title fails first
    const withTitle = settings(s => ({ ...s, content: { ...s.content, type: 'event',
      event: { title: 'Offsite', start: '', end: '', allDay: false, location: '', description: '' } } }));
    expect(getValidationError(withTitle)).toBe('enterStart');
    const reversed = settings(s => ({ ...s, content: { ...s.content, type: 'event',
      event: { title: 'Offsite', start: '2026-03-02T09:00', end: '2026-03-01T09:00', allDay: false, location: '', description: '' } } }));
    expect(getValidationError(reversed)).toBe('endBeforeStart');
    const good = settings(s => ({ ...s, content: { ...s.content, type: 'event',
      event: { title: 'Offsite', start: '2026-03-01T09:00', end: '', allDay: false, location: '', description: '' } } }));
    expect(getValidationError(good)).toBeNull();
  });

  it('requires a phone for SMS, message stays optional', () => {
    const empty = settings(s => ({ ...s, content: { ...s.content, type: 'sms' } }));
    expect(getValidationError(empty)).toBe('enterPhone');
    const ok = settings(s => ({ ...s, content: { ...s.content, type: 'sms', sms: { phone: '555', message: '' } } }));
    expect(getValidationError(ok)).toBeNull();
  });

  it('validates presets exactly like a link', () => {
    for (const type of ['social', 'pdf', 'appstore'] as const) {
      const empty = settings(s => ({ ...s, content: { ...s.content, type, link: '' } }));
      expect(getValidationError(empty)).toBe('enterUrl');
      const bad = settings(s => ({ ...s, content: { ...s.content, type, link: 'not a link' } }));
      expect(getValidationError(bad)).toBe('invalidUrl');
      const ok = settings(s => ({ ...s, content: { ...s.content, type, link: 'example.com' } }));
      expect(getValidationError(ok)).toBeNull();
    }
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
    const s = settings(s => ({ ...s, content: { type: 'text', link: '', text: '  ', email: { to: '', subject: '', body: '' }, phone: '', ...inlineExtras } }));
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