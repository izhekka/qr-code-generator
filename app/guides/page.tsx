import type { Metadata } from 'next';
import Link from 'next/link';

import { GUIDES } from '@/lib/guides';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'QR code guides',
  description:
    'Practical guides for every QR type this generator supports — link, Wi-Fi, vCard, event, SMS and the social networks people print on posters.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'QR code guides',
    description: 'Practical guides for every QR type this generator supports.',
    type: 'website',
    siteName: 'QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR code guides',
    description: 'Practical guides for every QR type this generator supports.',
  },
};

export default function GuidesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'QR code guides',
            url: `${SITE_URL}/guides`,
            itemListElement: GUIDES.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/guides/${g.slug}`,
            })),
          }),
        }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">QR code guides</h1>
        <p className="mb-10 text-lg text-gray-500">
          One guide per QR type — what it is for, how to make it, and what to watch out for.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow"
            >
              <h2 className="mb-1 font-bold">{g.title}</h2>
              <p className="text-sm text-gray-500">{g.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-[#23234f] p-10 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Free QR code generator</h2>
          <p className="mb-6 text-gray-300">{SITE_DESCRIPTION}</p>
          <Link
            href="/builder-static"
            className="rounded-full bg-[#7b5cd6] px-8 py-3 font-semibold shadow transition hover:bg-[#9a7fde]"
          >
            Open the QR builder
          </Link>
        </div>
      </main>
    </>
  );
}