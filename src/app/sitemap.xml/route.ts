import { routing } from '@/i18n/routing'
import { toAbsoluteSiteUrl } from '@/lib/site'

export async function GET() {
  const sitemaps = routing.locales.map((locale) => {
    return `  <sitemap>
    <loc>${toAbsoluteSiteUrl(`/${locale}/sitemap.xml`)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  })

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`

  return new Response(sitemapIndexXml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
