import { buildPayload, isValidEmail, isValidUrl } from './payload';
import type { Settings } from './types';

export function getValidationError(settings: Settings): string | null {
  const c = settings.content;
  switch (c.type) {
    case 'link':
      if (!c.link.trim()) return 'Enter a URL to generate your QR code.';
      if (!isValidUrl(c.link)) return 'Enter a valid link, like example.com.';
      break;
    case 'text':
      if (!c.text.trim()) return 'Enter some text to encode.';
      break;
    case 'email':
      if (!isValidEmail(c.email.to)) return 'Enter a valid e-mail address.';
      break;
    case 'call':
      if (!c.phone.trim()) return 'Enter a phone number.';
      break;
  }
  if (buildPayload(c).length > 2500) return 'Content is too long for a QR code.';
  return null;
}