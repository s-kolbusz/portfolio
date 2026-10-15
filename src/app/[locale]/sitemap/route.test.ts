import { describe, expect, it } from 'vitest'

import { isStudioCase } from '@/data/entry-href'
import { getCaseStudies } from '@/data/get-projects'
import { portfolioEntries } from '@/data/projects'

import { GET } from './route'

// Home, projects, cv, services — /design is noindex and stays out.
const STATIC_ROUTE_COUNT = 4

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

    // Should contain case-study slugs with x-default
    expect(xml).toContain('href="https://kolbusz.xyz/en/projects/ready2order"')
    expect(xml).toContain('href="https://kolbusz.xyz/pl/projects/ready2order"')

    // One x-default per URL entry: the static routes plus every case study.
    const xDefaultMatches = xml.match(/hreflang="x-default"/g) ?? []
    expect(xDefaultMatches).toHaveLength(STATIC_ROUTE_COUNT + getCaseStudies('en').length)
  })

  it('leaves out client work that redirects to stronypodhale.pl', async () => {
    const xml = await getSitemapXml('en')

    const moved = portfolioEntries.filter(isStudioCase)
    expect(moved.length).toBeGreaterThan(0)

    for (const { id } of moved) {
      expect(xml).not.toContain(`/projects/${id}"`)
      expect(xml).not.toContain(`/projects/${id}<`)
    }
  })

  it('leaves out the noindex design preview', async () => {
    const xml = await getSitemapXml('en')

    expect(xml).not.toContain('/design')
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
