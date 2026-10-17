'use client';

import Link from 'next/link';
import { useLocale } from './i18n';
import { locales } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const NAV = [
  { key: 'howItWorks', href: '/#how-it-works' },
  { key: 'features', href: '/#features' },
  { key: 'qrTypes', href: '/#types' },
  { key: 'faq', href: '/#faq' },
] as const;

// Quiet text toggle, not a second pill: the CTA is the only filled control
// in the header, the language switch reads as secondary info at the edge.
function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-center shrink-0 text-sm" role="group" aria-label="Language">
      {locales.map((l: Locale, i: number) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="pointer-events-none text-gray-300">|</span>}
          <button
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={`px-1 transition hover:text-[#23234f] ${
              locale === l ? 'font-semibold text-[#23234f]' : 'text-gray-400'
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { copy } = useLocale();
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f1f2f6]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23234f] text-sm text-white">QR</span>
          {copy.header.brand}
        </Link>
        {/* Russian labels are longer than English: hide the nav below lg and
            keep the language switch + CTA visible on mobile. */}
        <nav className="hidden gap-6 text-sm font-medium text-gray-600 lg:flex">
          {NAV.map(({ key, href }) => (
            <a key={href} href={href} className="hover:text-[#23234f]">
              {copy.header.nav[key]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <Link
            href="/builder-static"
            className="rounded-full bg-[#23234f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#7b5cd6]"
          >
            {copy.header.createCta}
          </Link>
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}