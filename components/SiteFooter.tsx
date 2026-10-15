import Link from 'next/link';

export const CONTRIBUTE_URL = 'https://github.com/izhekka/qr-code-generator';

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:text-left">
        <p>Free QR codes that never expire.</p>
        <p className="flex items-center gap-4">
          <Link href="/#faq" className="hover:text-[#23234f]">FAQ</Link>
          <a
            href={CONTRIBUTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#23234f]"
          >
            Contribute
          </a>
        </p>
      </div>
    </footer>
  );
}