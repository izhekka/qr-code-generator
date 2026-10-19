import { describe, expect, it } from 'vitest';
import { buildPayload, isValidEmail, isValidUrl, normalizeUrl } from './payload';
import type { Content } from './types';

const content = (over: Partial<Content>): Content => ({
  type: 'link', link: '', text: '',
  email: { to: '', subject: '', body: '' }, phone: '',
  vcard: { firstName: '', lastName: '', org: '', title: '', phone: '', email: '', website: '', address: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  event: { title: '', start: '', end: '', allDay: false, location: '', description: '' },
  sms: { phone: '', message: '' },
  ...over,
});

describe('normalizeUrl', () => {
  it('adds https when the scheme is missing', () => {
    expect(normalizeUrl('example.com/page')).toBe('https://example.com/page');
  });
  it('keeps an existing scheme', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });
  it('trims whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });
});

describe('buildPayload', () => {
  it('encodes links', () => {
    expect(buildPayload(content({ type: 'link', link: 'example.com' }))).toBe('https://example.com');
  });
  it('encodes plain text verbatim', () => {
    expect(buildPayload(content({ type: 'text', text: 'hi there' }))).toBe('hi there');
  });
  it('encodes e-mail with subject and body', () => {
    const payload = buildPayload(content({ type: 'email', email: { to: 'a@b.com', subject: 'Hi', body: 'Yo' } }));
    expect(payload).toBe('mailto:a@b.com?subject=Hi&body=Yo');
  });
  it('encodes e-mail without subject/body as bare mailto', () => {
    expect(buildPayload(content({ type: 'email', email: { to: 'a@b.com', subject: '', body: '' } }))).toBe('mailto:a@b.com');
  });
  it('strips formatting from phone numbers', () => {
    expect(buildPayload(content({ type: 'call', phone: '+1 (555) 010-2030' }))).toBe('tel:+15550102030');
  });
});

describe('vCard payload', () => {
  it('emits VCARD 3.0 with only the filled fields', () => {
    const payload = buildPayload(content({
      type: 'vcard',
      vcard: { firstName: ' Ada ', lastName: 'Lovelace', org: 'Analytical Engines', title: 'Founder',
        phone: '+1 555 0100', email: 'ada@example.com', website: 'example.com', address: 'London' },
    }));
    expect(payload.split('\n')).toEqual([
      'BEGIN:VCARD', 'VERSION:3.0',
      'N:Lovelace;Ada', 'FN:Ada Lovelace',
      'ORG:Analytical Engines', 'TITLE:Founder',
      'TEL;TYPE=CELL:+1 555 0100', 'EMAIL:ada@example.com',
      'URL:https://example.com', 'ADR:;;London',
      'END:VCARD',
    ]);
  });

  it('stays well-formed without a name (empty state)', () => {
    const payload = buildPayload(content({ type: 'vcard' }));
    expect(payload).toBe('BEGIN:VCARD\nVERSION:3.0\nEND:VCARD');
  });
});

describe('Wi-Fi payload', () => {
  it('escapes the Wi-Fi syntax characters', () => {
    const payload = buildPayload(content({
      type: 'wifi',
      wifi: { ssid: 'home;net,one', password: 'p:a"s\\word', security: 'WPA', hidden: false },
    }));
    expect(payload).toBe('WIFI:T:WPA;S:home\\;net\\,one;P:p\\:a\\"s\\\\word;;');
  });

  it('omits the password for open networks and marks hidden ones', () => {
    const open = buildPayload(content({
      type: 'wifi', wifi: { ssid: 'cafe', password: 'x', security: 'nopass', hidden: false },
    }));
    expect(open).toBe('WIFI:T:nopass;S:cafe;;');
    const hidden = buildPayload(content({
      type: 'wifi', wifi: { ssid: 'home', password: 'pw', security: 'WEP', hidden: true },
    }));
    expect(hidden).toBe('WIFI:T:WEP;S:home;P:pw;H:true;;');
  });
});

describe('Event payload', () => {
  it('builds a floating-time VEVENT with ICS escaping', () => {
    const payload = buildPayload(content({
      type: 'event',
      event: { title: 'Launch, party', start: '2026-03-01T09:00', end: '2026-03-01T11:30',
        allDay: false, location: 'HQ', description: 'line\nbreak' },
    }));
    expect(payload.split('\n')).toEqual([
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Launch\\, party',
      'DTSTART:20260301T090000',
      'DTEND:20260301T113000',
      'LOCATION:HQ',
      'DESCRIPTION:line\\nbreak',
      'END:VEVENT', 'END:VCALENDAR',
    ]);
  });

  it('emits exclusive DATE ends; same day means the next day', () => {
    const single = buildPayload(content({
      type: 'event',
      event: { title: 'Offsite', start: '2026-03-01', end: '', allDay: true, location: '', description: '' },
    }));
    expect(single).toContain('DTSTART;VALUE=DATE:20260301');
    expect(single).toContain('DTEND;VALUE=DATE:20260302');

    const twoDays = buildPayload(content({
      type: 'event',
      event: { title: 'Offsite', start: '2026-03-01', end: '2026-03-03', allDay: true, location: '', description: '' },
    }));
    expect(twoDays).toContain('DTEND;VALUE=DATE:20260303'); // the picked end date is used as-is
  });

  it('sanitizes values shaped for the other mode when the all-day state disagrees', () => {
    // all-day checked while start/end still hold datetime-local values: the
    // date input shows them blank but no onChange fires, so state is stale
    const staleDatetime = buildPayload(content({
      type: 'event',
      event: { title: 'Offsite', start: '2026-03-01T09:00', end: '2026-03-01T11:00',
        allDay: true, location: '', description: '' },
    }));
    expect(staleDatetime).toContain('DTSTART;VALUE=DATE:20260301');
    expect(staleDatetime).toContain('DTEND;VALUE=DATE:20260302');

    // a plain date left in state when all-day is already off → midnight DATE-TIME
    const staleDate = buildPayload(content({
      type: 'event',
      event: { title: 'Offsite', start: '2026-03-01', end: '', allDay: false,
        location: '', description: '' },
    }));
    expect(staleDate).toContain('DTSTART:20260301T000000');
  });
});

describe('SMS payload', () => {
  it('normalizes the phone like the call type and keeps the message verbatim', () => {
    expect(buildPayload(content({
      type: 'sms', sms: { phone: '+1 (555) 010-1000', message: 'Table for 2?' },
    }))).toBe('SMSTO:+15550101000:Table for 2?');
    expect(buildPayload(content({ type: 'sms', sms: { phone: '555', message: '' } }))).toBe('SMSTO:555:');
  });
});

describe('URL presets', () => {
  it('encodes social/pdf/appstore exactly like the link type', () => {
    for (const type of ['social', 'pdf', 'appstore'] as const) {
      expect(buildPayload(content({ type, link: 'example.com/menu' }))).toBe('https://example.com/menu');
      expect(buildPayload(content({ type, link: 'https://a.co/p.pdf' }))).toBe('https://a.co/p.pdf');
    }
  });
});

describe('isValidUrl', () => {
  it('accepts bare domains by adding https', () => {
    expect(isValidUrl('example.com')).toBe(true);
    expect(isValidUrl('example.com/page?x=1')).toBe(true);
  });
  it('accepts explicit http/https', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://sub.example.co.uk')).toBe(true);
  });
  it('rejects input the URL parser cannot turn into a host', () => {
    expect(isValidUrl('not a link')).toBe(false);
    expect(isValidUrl('exa mple.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
  it('rejects hostnames without a dot', () => {
    expect(isValidUrl('!')).toBe(false);
    expect(isValidUrl('http://localhost')).toBe(false);
  });
  it('rejects non-web schemes', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('htp://x')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts normal addresses', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
  });
  it('rejects junk', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});