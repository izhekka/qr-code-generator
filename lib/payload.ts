import type { Content } from './types';

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

export function buildPayload(content: Content): string {
  switch (content.type) {
    case 'link':
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
  }
}