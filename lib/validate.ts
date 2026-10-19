import { buildPayload, isValidEmail, isValidUrl } from './payload';
import { maxPayloadLength } from './qrConfig';
import type { Settings } from './types';

// Stable message keys: components translate them via copy.validation so the
// pure layer stays locale-free. English strings live in lib/i18n.ts verbatim.
export type ValidationErrorKey =
  | 'enterUrl' | 'invalidUrl' | 'enterText' | 'invalidEmail' | 'enterPhone' | 'tooLong'
  | 'enterName' | 'enterSsid' | 'enterPassword'
  | 'enterTitle' | 'enterStart' | 'endBeforeStart';

export function getValidationError(settings: Settings): ValidationErrorKey | null {
  const c = settings.content;
  switch (c.type) {
    case 'link':
    case 'social':
    case 'pdf':
    case 'appstore':
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
    case 'vcard': {
      const v = c.vcard;
      if (!v.firstName.trim() && !v.lastName.trim()) return 'enterName';
      if (v.email.trim() && !isValidEmail(v.email)) return 'invalidEmail';
      if (v.website.trim() && !isValidUrl(v.website)) return 'invalidUrl';
      break;
    }
    case 'wifi': {
      const w = c.wifi;
      if (!w.ssid.trim()) return 'enterSsid';
      if (w.security !== 'nopass' && !w.password.trim()) return 'enterPassword';
      break;
    }
    case 'event': {
      const ev = c.event;
      if (!ev.title.trim()) return 'enterTitle';
      if (!ev.start) return 'enterStart';
      if (ev.end && ev.end < ev.start) return 'endBeforeStart';
      break;
    }
    case 'sms':
      if (!c.sms.phone.trim()) return 'enterPhone';
      break;
  }
  if (!isEncodable(settings)) return 'tooLong';
  return null;
}

/** True when the payload fits the engine's Model 2 capacity at the effective EC level. */
export function isEncodable(settings: Settings): boolean {
  return buildPayload(settings.content).length <= maxPayloadLength(settings);
}