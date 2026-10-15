import Link from 'next/link';

import { CONTRIBUTE_URL } from '@/components/SiteFooter';

const FEATURES = [
  {
    title: 'Works forever',
    text: 'Static codes carry your content inside the code itself. No redirect service that can expire, no re-encoding after you print.',
  },
  {
    title: 'Private by design',
    text: 'Everything — content, design, logo — is processed in your browser. No accounts, no uploads, no scan tracking.',
  },
  {
    title: 'Print-ready exports',
    text: 'PNG up to 2048 px for screens, SVG for crisp printing at any size. JPEG and WEBP too.',
  },
  {
    title: 'More than black and white',
    text: 'Dot patterns, gradients, custom corners, your logo and sticker frames make a code people actually want to scan.',
  },
];

const USE_CASES = [
  'Business cards',
  'Flyers & posters',
  'Restaurant menus',
  'Product packaging',
  'Event tickets',
  'Shopfront windows',
];

const QR_TYPES = [
  { title: 'Link', text: 'Point scanners at any web page.' },
  { title: 'Text', text: 'Show a note, number or Wi-Fi password.' },
  { title: 'E-mail', text: 'Open a pre-filled e-mail draft.' },
  { title: 'Call', text: 'Dial a phone number with one tap.' },
];

const FAQ: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: 'What is a static QR code?',
    a: 'The data lives inside the code itself. It starts scanning instantly and never stops — but it cannot be edited after you print or share it.',
  },
  {
    q: 'Will it expire?',
    a: 'No. There is no service behind it: the code keeps working as long as your content does.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Nothing to sign up for, nothing to pay, and nothing is stored anywhere.',
  },
  {
    q: 'Can I track scans?',
    a: 'No — tracking requires a dynamic (redirect-based) code, and this site deliberately generates only static ones.',
  },
  {
    q: 'How small can I print it?',
    a: 'Keep it at least 2 × 2 cm and leave a quiet margin around the code. The more data inside, the denser the code — shorter links print cleaner.',
  },
  {
    q: 'How can I contribute?',
    a: (
      <>
        The generator is open source: report bugs, suggest ideas or improve the code directly on{' '}
        <a
          href={CONTRIBUTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#7b5cd6] hover:underline"
        >
          GitHub
        </a>
        . Every contribution helps.
      </>
    ),
  },
];

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
  return (
    <>
      <main>
        <section className="flex flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
          <h1 className="max-w-3xl bg-gradient-to-r from-[#23234f] via-[#4b3d99] to-[#7b5cd6] bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-6xl">
            No sign-ups. No payments. Just grab your working QR code.
          </h1>
          <p className="max-w-xl text-lg text-gray-500">
            Pick a type, design it, download it. The whole thing takes under a minute.
          </p>
          <Link
            href="/constructor"
            className="rounded-full bg-[#23234f] px-10 py-4 text-lg font-semibold text-white shadow transition hover:bg-[#7b5cd6]"
          >
            Create Static QR
          </Link>
        </section>

        <Section title="How it works" id="how-it-works">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={STEP_CLASS}>
              <span className={NUM_CLASS}>1</span>
              <p><strong>Choose the content.</strong> A link, plain text, an e-mail draft or a phone number.</p>
            </div>
            <div className={STEP_CLASS}>
              <span className={NUM_CLASS}>2</span>
              <p><strong>Design the code.</strong> Pattern, colors, corners, sticker frame and your logo.</p>
            </div>
            <div className={STEP_CLASS}>
              <span className={NUM_CLASS}>3</span>
              <p><strong>Download it.</strong> PNG, JPEG, SVG or WEBP — ready to print or embed.</p>
            </div>
          </div>
        </Section>

        <Section title="Why this generator" id="features">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 text-center shadow-sm sm:text-left">
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="text-gray-500">{f.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Where you can use it">
          <div className="flex flex-wrap justify-center gap-3 text-center sm:justify-start">
            {USE_CASES.map((u) => (
              <span key={u} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                {u}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Free QR code types" id="types">
          <div className="grid gap-4 sm:grid-cols-4">
            {QR_TYPES.map((t) => (
              <div key={t.title} className="rounded-2xl bg-white p-6 text-center shadow-sm sm:text-left">
                <h3 className="mb-1 font-bold">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center sm:text-left">
            <Link href="/constructor" className="font-semibold text-[#7b5cd6] hover:underline">
              Try it in the constructor →
            </Link>
          </div>
        </Section>

        <Section title="FAQ" id="faq">
          <div className="flex flex-col gap-3">
            {FAQ.map((f) => (
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
            <h2 className="mb-3 text-3xl font-bold">Ready in under a minute</h2>
            <p className="mb-8 text-gray-300">Design your code, download it, use it anywhere.</p>
            <Link
              href="/constructor"
              className="rounded-full bg-[#7b5cd6] px-10 py-4 text-lg font-semibold shadow transition hover:bg-[#9a7fde]"
            >
              Create Static QR
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}