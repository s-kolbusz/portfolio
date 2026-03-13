import type { MetadataRoute } from 'next'

import { toAbsoluteSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/not-found', '/404', '/500'],
    },
    sitemap: toAbsoluteSiteUrl('/sitemap.xml'),
  }
}
