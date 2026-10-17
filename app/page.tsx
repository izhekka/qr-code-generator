'use client';

import Link from 'next/link';

import { useLocale } from '@/components/i18n';
import { CONTRIBUTE_URL } from '@/components/SiteFooter';

const STEP_CLASS = 'flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm';
const NUM_CLASS = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#23234f] font-bold text-white';

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-16 text-center sm:text-left">
      <h2 className="mb-8 text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const { copy } = useLocale();

  return (
    <>
      <main>
        <section className="flex flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
          <h1 className="max-w-3xl bg-gradient-to-r from-[#23234f] via-[#4b3d99] to-[#7b5cd6] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-6xl">
            {copy.hero.title}
          </h1>
          <p className="max-w-xl text-lg text-gray-500">{copy.hero.subtitle}</p>
          <Link
            href="/builder-static"
            className="rounded-full bg-[#23234f] px-10 py-4 text-lg font-semibold text-white shadow transition hover:bg-[#7b5cd6]"
          >
            {copy.hero.createCta}
          </Link>
        </section>

        <Section title={copy.howItWorks.title} id="how-it-works">
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.howItWorks.steps.map((s, i) => (
              <div key={s.lead} className={STEP_CLASS}>
                <span className={NUM_CLASS}>{i + 1}</span>
                <p><strong>{s.lead}</strong>{s.rest}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title={copy.features.title} id="features">
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.features.items.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 text-center shadow-sm sm:text-left">
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="text-gray-500">{f.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title={copy.useCases.title}>
          <div className="flex flex-wrap justify-center gap-3 text-center sm:justify-start">
            {copy.useCases.items.map((u) => (
              <span key={u} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                {u}
              </span>
            ))}
          </div>
        </Section>

        <Section title={copy.qrTypes.title} id="types">
          <div className="grid gap-4 sm:grid-cols-4">
            {copy.qrTypes.items.map((t) => (
              <div key={t.title} className="rounded-2xl bg-white p-6 text-center shadow-sm sm:text-left">
                <h3 className="mb-1 font-bold">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center sm:text-left">
            <Link href="/builder-static" className="font-semibold text-[#7b5cd6] hover:underline">
              {copy.qrTypes.tryCta}
            </Link>
          </div>
        </Section>

        <Section title={copy.faq.title} id="faq">
          <div className="flex flex-col gap-3">
            {[...copy.faq.items, {
              q: copy.faq.contribute.q,
              a: (
                <>
                  {copy.faq.contribute.pre}
                  <a
                    href={CONTRIBUTE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#7b5cd6] hover:underline"
                  >
                    {copy.faq.contribute.linkText}
                  </a>
                  {copy.faq.contribute.post}
                </>
              ),
            }].map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <span className="mr-2 text-[#7b5cd6] group-open:rotate-45 inline-block transition">+</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-3xl rounded-3xl bg-[#23234f] p-12 text-center text-white">
            <h2 className="mb-3 text-3xl font-bold">{copy.cta.title}</h2>
            <p className="mb-8 text-gray-300">{copy.cta.subtitle}</p>
            <Link
              href="/builder-static"
              className="rounded-full bg-[#7b5cd6] px-10 py-4 text-lg font-semibold shadow transition hover:bg-[#9a7fde]"
            >
              {copy.cta.createCta}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}