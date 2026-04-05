import { describe, expect, it } from 'vitest'

import { getProject } from '@/data/get-projects'
import enMessages from '@/i18n/messages/en.json'

import {
  buildCvPageMetadata,
  buildHomePageMetadata,
  buildProjectDetailPageMetadata,
  buildProjectsPageMetadata,
  buildServicesPageMetadata,
  buildStaticPageMetadata,
  MIN_DESCRIPTION_LENGTH,
} from './page-metadata'

describe('page metadata', () => {
  it('builds home metadata', () => {
    const metadata = buildHomePageMetadata({
      locale: 'en',
      title: enMessages.Metadata.title,
      description: enMessages.Metadata.description,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "https://www.kolbusz.xyz/en",
          "languages": {
            "en": "https://www.kolbusz.xyz/en",
            "pl": "https://www.kolbusz.xyz/pl",
            "x-default": "https://www.kolbusz.xyz/en",
          },
        },
        "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
        "openGraph": {
          "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
          "images": [
            {
              "alt": "Sebastian Kolbusz - High-performance web engineering",
              "height": 630,
              "url": "https://www.kolbusz.xyz/og-image",
              "width": 1200,
            },
          ],
          "locale": "en_US",
          "siteName": "Sebastian Kolbusz Portfolio",
          "title": "Sebastian Kolbusz | Senior Frontend Engineer",
          "type": "website",
          "url": "https://www.kolbusz.xyz/en",
        },
        "title": {
          "absolute": "Sebastian Kolbusz | Senior Frontend Engineer",
        },
        "twitter": {
          "card": "summary_large_image",
          "creator": "@s_kolbusz",
          "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
          "images": [
            "https://www.kolbusz.xyz/og-image",
          ],
          "title": "Sebastian Kolbusz | Senior Frontend Engineer",
        },
      }
    `)
  })

  it('builds cv metadata without duplicating the global title suffix', () => {
    const metadata = buildCvPageMetadata({
      locale: 'en',
      title: enMessages.cv.title,
      description: enMessages.Metadata.description,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "https://www.kolbusz.xyz/en/cv",
          "languages": {
            "en": "https://www.kolbusz.xyz/en/cv",
            "pl": "https://www.kolbusz.xyz/pl/cv",
            "x-default": "https://www.kolbusz.xyz/en/cv",
          },
        },
        "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
        "openGraph": {
          "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
          "images": [
            {
              "alt": "Sebastian Kolbusz - High-performance web engineering",
              "height": 630,
              "url": "https://www.kolbusz.xyz/og-image",
              "width": 1200,
            },
          ],
          "locale": "en_US",
          "siteName": "Sebastian Kolbusz Portfolio",
          "title": "Curriculum Vitae",
          "type": "website",
          "url": "https://www.kolbusz.xyz/en/cv",
        },
        "title": "Curriculum Vitae",
        "twitter": {
          "card": "summary_large_image",
          "creator": "@s_kolbusz",
          "description": "Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.",
          "images": [
            "https://www.kolbusz.xyz/og-image",
          ],
          "title": "Curriculum Vitae",
        },
      }
    `)
  })

  it('builds projects index metadata without duplicating the global title suffix', () => {
    const metadata = buildProjectsPageMetadata({
      locale: 'en',
      title: enMessages.projectsBook.title,
      description: enMessages.projectsBook.subtitle,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "https://www.kolbusz.xyz/en/projects",
          "languages": {
            "en": "https://www.kolbusz.xyz/en/projects",
            "pl": "https://www.kolbusz.xyz/pl/projects",
            "x-default": "https://www.kolbusz.xyz/en/projects",
          },
        },
        "description": "Selected case studies covering high-performance websites, SaaS interfaces, and digital platforms built with clarity, speed, and measurable outcomes.",
        "openGraph": {
          "description": "Selected case studies covering high-performance websites, SaaS interfaces, and digital platforms built with clarity, speed, and measurable outcomes.",
          "images": [
            {
              "alt": "Sebastian Kolbusz - High-performance web engineering",
              "height": 630,
              "url": "https://www.kolbusz.xyz/og-image",
              "width": 1200,
            },
          ],
          "locale": "en_US",
          "siteName": "Sebastian Kolbusz Portfolio",
          "title": "Selected Work",
          "type": "website",
          "url": "https://www.kolbusz.xyz/en/projects",
        },
        "title": "Selected Work",
        "twitter": {
          "card": "summary_large_image",
          "creator": "@s_kolbusz",
          "description": "Selected case studies covering high-performance websites, SaaS interfaces, and digital platforms built with clarity, speed, and measurable outcomes.",
          "images": [
            "https://www.kolbusz.xyz/og-image",
          ],
          "title": "Selected Work",
        },
      }
    `)
  })

  it('builds project detail metadata with canonical alternates', () => {
    const project = getProject('zakofy', 'en')
    if (!project) {
      throw new Error('Expected fixture project to exist')
    }

    const metadata = buildProjectDetailPageMetadata({
      locale: 'en',
      slug: project.id,
      project,
      categoryLabel: enMessages.projectsBook.categories[project.category],
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "https://www.kolbusz.xyz/en/projects/zakofy",
          "languages": {
            "en": "https://www.kolbusz.xyz/en/projects/zakofy",
            "pl": "https://www.kolbusz.xyz/pl/projects/zakofy",
            "x-default": "https://www.kolbusz.xyz/en/projects/zakofy",
          },
        },
        "description": "Custom Tatra Mountain Offer Platform. Providing a modern digital appearance for mountain tourism with a custom-built offer presentation system.",
        "openGraph": {
          "description": "Custom Tatra Mountain Offer Platform. Providing a modern digital appearance for mountain tourism with a custom-built offer presentation system.",
          "images": [
            {
              "url": "https://www.kolbusz.xyz/images/projects/zakofy.avif",
            },
          ],
          "locale": "en_US",
          "siteName": "Sebastian Kolbusz Portfolio",
          "title": "Zakofy",
          "type": "article",
          "url": "https://www.kolbusz.xyz/en/projects/zakofy",
        },
        "other": {
          "article:section": "Offer Presentation",
        },
        "title": "Zakofy",
        "twitter": {
          "card": "summary_large_image",
          "creator": "@s_kolbusz",
          "description": "Custom Tatra Mountain Offer Platform. Providing a modern digital appearance for mountain tourism with a custom-built offer presentation system.",
          "images": [
            "https://www.kolbusz.xyz/images/projects/zakofy.avif",
          ],
          "title": "Zakofy",
        },
      }
    `)
  })

  it('builds services metadata with a canonical-matching social url', () => {
    const metadata = buildServicesPageMetadata({
      locale: 'pl',
      title: 'Tworzenie stron internetowych',
      description:
        'Projektowanie i rozwój wydajnych stron internetowych, landing page oraz aplikacji dla firm.',
    })

    expect(metadata.openGraph).toMatchObject({
      url: 'https://www.kolbusz.xyz/pl/services',
      title: 'Tworzenie stron internetowych',
    })
    expect(metadata.twitter).toMatchObject({
      title: 'Tworzenie stron internetowych',
      description:
        'Projektowanie i rozwój wydajnych stron internetowych, landing page oraz aplikacji dla firm.',
    })
  })

  it('builds metadata for auxiliary pages with explicit canonical URLs', () => {
    const metadata = buildStaticPageMetadata({
      locale: 'en',
      title: 'Design System',
      description: 'Internal design-system preview for the Sebastian Kolbusz portfolio.',
      path: '/design',
    })

    expect(metadata.alternates?.canonical).toBe('https://www.kolbusz.xyz/en/design')
    expect(metadata.openGraph?.url).toBe('https://www.kolbusz.xyz/en/design')
  })

  it('builds project detail metadata with a search-result-ready description', () => {
    const project = getProject('zakofy', 'en')
    if (!project) {
      throw new Error('Expected fixture project to exist')
    }

    const metadata = buildProjectDetailPageMetadata({
      locale: 'en',
      slug: project.id,
      project,
      categoryLabel: enMessages.projectsBook.categories[project.category],
    })

    expect(metadata.description).toBeDefined()
    expect(metadata.description!.length).toBeGreaterThanOrEqual(110)
    expect(metadata.description!.length).toBeLessThanOrEqual(160)
    expect(metadata.twitter).toMatchObject({
      title: 'Zakofy',
      description: metadata.description,
    })
  })
  it('all locale static pages have descriptions within the 110-160 char SEO window', () => {
    const checks = [
      buildHomePageMetadata({
        locale: 'en',
        title: enMessages.Metadata.title,
        description: enMessages.Metadata.description,
      }),
      buildCvPageMetadata({
        locale: 'en',
        title: enMessages.cv.title,
        description: enMessages.Metadata.description,
      }),
      buildProjectsPageMetadata({
        locale: 'en',
        title: enMessages.projectsBook.title,
        description: enMessages.projectsBook.subtitle,
      }),
      buildServicesPageMetadata({
        locale: 'en',
        title: enMessages.services_page.meta_title,
        description: enMessages.services_page.meta_description,
      }),
    ]

    for (const metadata of checks) {
      const desc = metadata.description!
      expect(desc.length, `Description too short: "${desc}"`).toBeGreaterThanOrEqual(
        MIN_DESCRIPTION_LENGTH
      )
      expect(desc.length, `Description too long: "${desc}"`).toBeLessThanOrEqual(160)
    }
  })

  it('normalises description consistently across metadata, openGraph and twitter fields', () => {
    const longDescription = 'A'.repeat(180)
    const metadata = buildHomePageMetadata({
      locale: 'en',
      title: 'Test',
      description: longDescription,
    })

    expect(metadata.description!.length).toBeLessThanOrEqual(160)
    expect(metadata.description!.endsWith('\u2026')).toBe(true)
    // OG and Twitter should receive the same truncated description
    expect(metadata.openGraph?.description).toBe(metadata.description)
    expect(metadata.twitter?.description).toBe(metadata.description)
  })
})
