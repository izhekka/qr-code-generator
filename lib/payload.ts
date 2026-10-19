import type { Content, EventContent, SmsContent, VCardContent, WifiContent } from './types';

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Checks the value as it would be encoded, letting the browser's URL parser
// reject anything it could never reach — spaces, bare punctuation — while
// keeping the scheme to http(s) so QR payloads stay real web links.
export function isValidUrl(input: string): boolean {
  const normalized = normalizeUrl(input);
  if (!normalized) return false;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return url.hostname.includes('.');
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** vCard 3.0 contact card: one line per filled field, \n separators. */
function buildVCard(v: VCardContent): string {
  const first = v.firstName.trim();
  const last = v.lastName.trim();
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (first || last) {
    lines.push(`N:${last};${first}`, `FN:${[first, last].filter(Boolean).join(' ')}`);
  }
  if (v.org.trim()) lines.push(`ORG:${v.org.trim()}`);
  if (v.title.trim()) lines.push(`TITLE:${v.title.trim()}`);
  if (v.phone.trim()) lines.push(`TEL;TYPE=CELL:${v.phone.trim()}`);
  if (v.email.trim()) lines.push(`EMAIL:${v.email.trim()}`);
  if (v.website.trim()) lines.push(`URL:${normalizeUrl(v.website)}`);
  if (v.address.trim()) lines.push(`ADR:;;${v.address.trim()}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/** Wi-Fi payload escaping: backslash, semicolon, comma, colon and double quote. */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** WIFI:T:…;S:…;P:…[;H:true];; — nopass omits the password. */
function buildWifi(w: WifiContent): string {
  const parts = [`T:${w.security}`, `S:${escapeWifi(w.ssid.trim())}`];
  if (w.security !== 'nopass') parts.push(`P:${escapeWifi(w.password)}`);
  if (w.hidden) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

/** ICS text escaping: backslash, semicolon, comma, newline. */
function icsEscape(text: string): string {
  return text.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
}

/** '2026-03-01T09:00' (datetime-local) → floating ICS '20260301T090000'. */
function icsFloating(value: string): string {
  const digits = value.replace(/\D/g, '');
  // padEnd keeps value shapes from "the other mode" valid: a plain date left
  // in state becomes midnight ('20260301T000000'), not the broken 'T00';
  // slice(8, 12) also truncates seconds-bearing values to MM
  return `${digits.slice(0, 8)}T${digits.slice(8, 12).padEnd(4, '0')}00`;
}

function icsDate(date: string): string {
  return date.replace(/\D/g, '');
}

/** +1 day on an ICS DATE, via UTC math so timezone offsets cannot shift it. */
function nextIcsDate(date: string): string {
  const ics = icsDate(date);
  const t = new Date(Date.UTC(+ics.slice(0, 4), +ics.slice(4, 6) - 1, +ics.slice(6, 8)));
  t.setUTCDate(t.getUTCDate() + 1);
  return `${t.getUTCFullYear()}${String(t.getUTCMonth() + 1).padStart(2, '0')}${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** VCALENDAR with floating local times; a DATE DTEND is exclusive (RFC 5545). */
function buildEvent(e: EventContent): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT'];
  if (e.title.trim()) lines.push(`SUMMARY:${icsEscape(e.title.trim())}`);
  if (e.start) {
    if (e.allDay) {
      // the all-day inputs are type=date: a stale datetime-local value stays
      // in state un-changed (no onChange fires), so always take the first 8
      // digits — '2026-03-01T09:00' must not become a 10-digit ICS DATE
      const startDay = icsDate(e.start).slice(0, 8);
      const endDay = icsDate(e.end).slice(0, 8);
      lines.push(`DTSTART;VALUE=DATE:${startDay}`);
      lines.push(`DTEND;VALUE=DATE:${!e.end || endDay === startDay ? nextIcsDate(startDay) : endDay}`);
    } else {
      lines.push(`DTSTART:${icsFloating(e.start)}`);
      if (e.end) lines.push(`DTEND:${icsFloating(e.end)}`);
    }
  }
  if (e.location.trim()) lines.push(`LOCATION:${icsEscape(e.location.trim())}`);
  if (e.description.trim()) lines.push(`DESCRIPTION:${icsEscape(e.description.trim())}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

/** SMSTO is the de-facto cross-platform QR SMS format (sms:…?body= is flaky on iOS). */
function buildSms(s: SmsContent): string {
  return `SMSTO:${s.phone.replace(/[^+\d]/g, '')}:${s.message}`;
}

export function buildPayload(content: Content): string {
  switch (content.type) {
    case 'link':
    case 'social':
    case 'pdf':
    case 'appstore':
      return normalizeUrl(content.link);
    case 'text':
      return content.text;
    case 'email': {
      const parts: string[] = [];
      if (content.email.subject) parts.push(`subject=${encodeURIComponent(content.email.subject)}`);
      if (content.email.body) parts.push(`body=${encodeURIComponent(content.email.body)}`);
      return `mailto:${content.email.to.trim()}${parts.length ? `?${parts.join('&')}` : ''}`;
    }
    case 'call':
      return `tel:${content.phone.replace(/[^+\d]/g, '')}`;
    case 'vcard':
      return buildVCard(content.vcard);
    case 'wifi':
      return buildWifi(content.wifi);
    case 'event':
      return buildEvent(content.event);
    case 'sms':
      return buildSms(content.sms);
  }
}