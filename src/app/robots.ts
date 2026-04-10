import type { MetadataRoute } from 'next'

import { toAbsoluteSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/not-found', '/404', '/500'],
    },
    // Sitemap index at /sitemap.xml lists both locale sitemaps.
    // /sitemap.xml is handled by its own route handler and is unaffected by the / → /en redirect.
    sitemap: toAbsoluteSiteUrl('/sitemap.xml'),
  }
}
