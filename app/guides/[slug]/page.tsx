import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'website',
      siteName: 'QR',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image: [`${SITE_URL}/opengraph-image`],
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
    author: { '@type': 'Organization', name: 'QR' },
  };

  return (
    <main>
      <article className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{guide.title}</h1>
      <p className="mb-10 text-lg text-gray-500">{guide.intro}</p>
      {guide.sections.map((s) => (
        <section key={s.heading} className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">{s.heading}</h2>
          {(s.paragraphs ?? []).map((p) => (
            <p key={p} className="mb-3 text-gray-500">{p}</p>
          ))}
          {s.steps && (
            <ol className="list-decimal space-y-2 pl-6 text-gray-500">
              {s.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </section>
      ))}
      {guide.faq && (
        <section className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">FAQ</h2>
          <div className="flex flex-col gap-3">
            {guide.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
                <p className="mt-3 text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <div className="rounded-3xl bg-[#23234f] p-10 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">Ready to create it?</h2>
        <p className="mb-6 text-gray-300">Build this QR code in the browser — styled frames, your colors, PNG and SVG.</p>
        <Link
          href="/builder-static"
          className="rounded-full bg-[#7b5cd6] px-8 py-3 font-semibold shadow transition hover:bg-[#9a7fde]"
        >
          Open the QR builder
        </Link>
      </div>
      </article>
    </main>
  );
}