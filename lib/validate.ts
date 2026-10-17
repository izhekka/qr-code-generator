import { buildPayload, isValidEmail, isValidUrl } from './payload';
import type { Settings } from './types';

// Stable message keys: components translate them via copy.validation so the
// pure layer stays locale-free. English strings live in lib/i18n.ts verbatim.
export type ValidationErrorKey =
  | 'enterUrl' | 'invalidUrl' | 'enterText' | 'invalidEmail' | 'enterPhone' | 'tooLong';

export function getValidationError(settings: Settings): ValidationErrorKey | null {
  const c = settings.content;
  switch (c.type) {
    case 'link':
      if (!c.link.trim()) return 'enterUrl';
      if (!isValidUrl(c.link)) return 'invalidUrl';
      break;
    case 'text':
      if (!c.text.trim()) return 'enterText';
      break;
    case 'email':
      if (!isValidEmail(c.email.to)) return 'invalidEmail';
      break;
    case 'call':
      if (!c.phone.trim()) return 'enterPhone';
      break;
  }
  if (buildPayload(c).length > 2500) return 'tooLong';
  return null;
}