import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { LocaleProvider } from '@/components/i18n';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR — free static QR code generator',
  description: 'No sign-ups. No payments. Free static QR codes, generated entirely in your browser.',
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
        </LocaleProvider>
      </body>
    </html>
  );
}