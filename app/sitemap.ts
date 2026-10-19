import type { MetadataRoute } from 'next';

import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/builder-static`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...GUIDES.map((g) => {
      // Annotated so the 'monthly' literal keeps its union type.
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/guides/${g.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      };
      return entry;
    }),
  ];
}