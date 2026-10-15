import { describe, expect, it } from 'vitest';
import { buildPayload, isValidEmail, isValidUrl, normalizeUrl } from './payload';
import type { Content } from './types';

const content = (over: Partial<Content>): Content => ({
  type: 'link', link: '', text: '',
  email: { to: '', subject: '', body: '' }, phone: '', ...over,
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