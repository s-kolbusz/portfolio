import { getProjects } from '@/data/get-projects'
import { routing, type Locale } from '@/i18n/routing'
import { toAbsoluteSiteUrl } from '@/lib/site'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const currentLocale = locale as Locale
  const locales = routing.locales

  const projects = getProjects(currentLocale)
  const uniqueProjectIds = Array.from(new Set(projects.map((p) => p.id)))

  const staticRoutes = ['', '/projects', '/cv', '/services']
  const sitemapEntries = []

  // Add static routes
  for (const route of staticRoutes) {
    const path = `/${currentLocale}${route}`
    const url = toAbsoluteSiteUrl(path)

    // x-default points to the "en" (default) variant for each route
    const defaultHref = toAbsoluteSiteUrl(`/en${route}`)
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`,
      ...locales.map(
        (l) =>
          `<xhtml:link rel="alternate" hreflang="${l}" href="${toAbsoluteSiteUrl(`/${l}${route}`)}" />`
      ),
    ].join('\n    ')

    sitemapEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    ${alternates}
  </url>`)
  }

  // Add project routes
  for (const id of uniqueProjectIds) {
    const path = `/${currentLocale}/projects/${id}`
    const url = toAbsoluteSiteUrl(path)

    // x-default points to the "en" (default) variant
    const defaultProjectHref = toAbsoluteSiteUrl(`/en/projects/${id}`)
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="x-default" href="${defaultProjectHref}" />`,
      ...locales.map(
        (l) =>
          `<xhtml:link rel="alternate" hreflang="${l}" href="${toAbsoluteSiteUrl(`/${l}/projects/${id}`)}" />`
      ),
    ].join('\n    ')

    sitemapEntries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    ${alternates}
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>`

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
