import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const TITLE = 'QR code builder';
const DESCRIPTION =
  'Design your QR code — types, frames, colors, logo and PNG/SVG export, all in your browser.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/builder-static',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return children;
}