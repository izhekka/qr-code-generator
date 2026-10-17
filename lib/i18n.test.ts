import { describe, expect, it } from 'vitest';
import { COPY, DEFAULT_LOCALE, isLocale, locales, systemLocale } from './i18n';

function leafPaths(node: unknown, prefix = ''): string[] {
  if (node === null || typeof node !== 'object') return [prefix];
  return Object.entries(node).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe('i18n dictionary', () => {
  it('declares exactly en and ru locales', () => {
    expect(locales).toEqual(['en', 'ru']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('ru and en have identical leaf keys (completeness)', () => {
    const en = leafPaths(COPY.en).sort();
    const ru = leafPaths(COPY.ru).sort();
    expect(ru).toEqual(en);
    expect(en.length).toBeGreaterThan(80);
  });

  it('no leaf is empty or whitespace-only', () => {
    for (const locale of locales) {
      for (const path of leafPaths(COPY[locale])) {
        const v = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], COPY[locale]);
        expect(typeof v === 'string' && v.trim().length > 0, path).toBe(true);
      }
    }
  });

  it('isLocale accepts only en and ru', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ru')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('maps the system language to ru, everything else falls back to en', () => {
    expect(systemLocale('ru-RU')).toBe('ru');
    expect(systemLocale('ru')).toBe('ru');
    expect(systemLocale('RU')).toBe('ru');
    expect(systemLocale('en-US')).toBe('en');
    expect(systemLocale('be')).toBe('en');
    expect(systemLocale('de-DE')).toBe('en');
    expect(systemLocale('')).toBe('en');
    expect(systemLocale(undefined)).toBe('en');
  });
});