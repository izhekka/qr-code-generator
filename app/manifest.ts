import type { MetadataRoute } from 'next';

import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE_TITLE,
    short_name: 'QR',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'fullscreen',
    background_color: '#f1f2f6',
    theme_color: '#23234f',
    icons: [
      { src: '/icons/sw-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/sw-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/sw-icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}