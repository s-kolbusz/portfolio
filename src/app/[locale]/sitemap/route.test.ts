import { describe, expect, it } from 'vitest'

import { GET } from './route'

async function getSitemapXml(locale: string) {
  const response = await GET(new Request(`https://kolbusz.xyz/${locale}/sitemap.xml`), {
    params: Promise.resolve({ locale }),
  })
  return response.text()
}

describe('locale sitemap route', () => {
  it('returns valid XML with content-type text/xml', async () => {
    const response = await GET(new Request('https://kolbusz.xyz/en/sitemap.xml'), {
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/xml')
  })

  it('includes x-default hreflang pointing to en variant for static routes', async () => {
    const xml = await getSitemapXml('en')

    // x-default should appear for home, projects, cv, services
    expect(xml).toContain('hreflang="x-default"')
    expect(xml).toContain('href="https://kolbusz.xyz/en"')
    expect(xml).toContain('href="https://kolbusz.xyz/en/projects"')
    expect(xml).toContain('href="https://kolbusz.xyz/en/cv"')
    expect(xml).toContain('href="https://kolbusz.xyz/en/services"')
  })

  it('includes both locale hreflang tags (en and pl) for each static route', async () => {
    const xml = await getSitemapXml('en')

    expect(xml).toContain('hreflang="en"')
    expect(xml).toContain('hreflang="pl"')
    expect(xml).toContain('href="https://kolbusz.xyz/pl/projects"')
  })

  it('includes x-default for project detail routes', async () => {
    const xml = await getSitemapXml('en')

    // Should contain project slugs with x-default
    expect(xml).toContain('href="https://kolbusz.xyz/en/projects/zakofy"')
    expect(xml).toContain('href="https://kolbusz.xyz/pl/projects/zakofy"')

    // Count x-default occurrences (one per URL entry: 4 static + 5 projects = 9)
    const xDefaultMatches = xml.match(/hreflang="x-default"/g)
    expect(xDefaultMatches).not.toBeNull()
    // should have x-default for every url entry
    expect((xDefaultMatches ?? []).length).toBeGreaterThanOrEqual(9)
  })

  it('x-default always points to the en variant even when served for pl locale', async () => {
    const xml = await getSitemapXml('pl')

    // When pl sitemap is requested, x-default still points to /en paths
    expect(xml).toContain('hreflang="x-default" href="https://kolbusz.xyz/en/projects"')
    expect(xml).toContain('hreflang="x-default" href="https://kolbusz.xyz/en"')
  })

  it('includes all static routes in the sitemap', async () => {
    const xml = await getSitemapXml('en')

    expect(xml).toContain('<loc>https://kolbusz.xyz/en</loc>')
    expect(xml).toContain('<loc>https://kolbusz.xyz/en/projects</loc>')
    expect(xml).toContain('<loc>https://kolbusz.xyz/en/cv</loc>')
    expect(xml).toContain('<loc>https://kolbusz.xyz/en/services</loc>')
  })
})
