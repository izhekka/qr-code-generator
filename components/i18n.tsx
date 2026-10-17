'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { COPY, DEFAULT_LOCALE, isLocale, systemLocale } from '@/lib/i18n';
import type { Copy, Locale } from '@/lib/i18n';

const STORAGE_KEY = 'qr-locale';

type LocaleState = { locale: Locale; copy: Copy; setLocale(next: Locale): void };

const noop = () => {};
const LocaleContext = createContext<LocaleState>({ locale: DEFAULT_LOCALE, copy: COPY[DEFAULT_LOCALE], setLocale: noop });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // First render is always 'en' so it matches the prerendered HTML; the stored
  // choice wins over the system language, which applies on first visit only.
  // Unreadable storage degrades to English instead of crashing (private
  // windows, cleared data).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
      setLocaleState(systemLocale(window.navigator.language));
    } catch {
      // storage unavailable -> stay on default
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable -> locale still applies for this visit
    }
  }, []);

  const value: LocaleState = { locale, copy: COPY[locale], setLocale };
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}