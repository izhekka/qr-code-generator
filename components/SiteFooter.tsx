'use client';

import Link from 'next/link';
import { useLocale } from './i18n';

export const CONTRIBUTE_URL = 'https://github.com/izhekka/qr-code-generator';

export function SiteFooter() {
  const { copy } = useLocale();
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:text-left">
        <p>{copy.footer.tagline}</p>
        <p className="flex items-center gap-4">
          <Link href="/#faq" className="hover:text-[#23234f]">{copy.footer.faq}</Link>
          <a
            href={CONTRIBUTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#23234f]"
          >
            {copy.footer.contribute}
          </a>
        </p>
      </div>
    </footer>
  );
}