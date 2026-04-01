import type { MetadataRoute } from 'next'

import { toAbsoluteSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/not-found', '/404', '/500'],
    },
    // Locale-specific sitemaps served via /:locale/sitemap rewrites in next.config.ts
    sitemap: [toAbsoluteSiteUrl('/en/sitemap.xml'), toAbsoluteSiteUrl('/pl/sitemap.xml')],
  }
}
