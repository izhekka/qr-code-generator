import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { LocaleProvider } from '@/components/i18n';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/seo';
import './globals.css';

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s — QR',
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    siteName: 'QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: 'QR',
    statusBarStyle: 'default',
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f1f2f6] text-[#23234f] antialiased">
        <LocaleProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <Analytics />
          <ServiceWorkerRegistrar />
        </LocaleProvider>
      </body>
    </html>
  );
}