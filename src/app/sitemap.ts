import type { MetadataRoute } from 'next'

import { getProjects } from '@/data/get-projects'
import { routing } from '@/i18n/routing'
import { toAbsoluteSiteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales
  const projects = locales.flatMap((locale) => getProjects(locale))
  const uniqueProjectIds = Array.from(new Set(projects.map((p) => p.id)))

  // Static routes
  const staticRoutes = ['', '/projects', '/cv']

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static routes for each locale
  staticRoutes.forEach((route) => {
    locales.forEach((locale) => {
      const path = `/${locale}${route}`
      const url = toAbsoluteSiteUrl(path)

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'monthly' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, toAbsoluteSiteUrl(`/${l}${route}`)])
          ),
        },
      })
    })
  })

  // Add project detail routes
  uniqueProjectIds.forEach((id) => {
    locales.forEach((locale) => {
      const path = `/${locale}/projects/${id}`
      const url = toAbsoluteSiteUrl(path)

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, toAbsoluteSiteUrl(`/${l}/projects/${id}`)])
          ),
        },
      })
    })
  })

  return sitemapEntries
}
