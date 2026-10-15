import Link from 'next/link';

const NAV = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'QR types', href: '/#types' },
  { label: 'FAQ', href: '/#faq' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f1f2f6]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23234f] text-sm text-white">QR</span>
          Generator
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-gray-600 sm:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-[#23234f]">
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href="/constructor"
          className="rounded-full bg-[#23234f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#7b5cd6]"
        >
          Create Static QR
        </Link>
      </div>
    </header>
  );
}