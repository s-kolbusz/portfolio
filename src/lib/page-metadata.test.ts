import { describe, expect, it } from 'vitest'

import { getProject } from '@/features/work/data/get-projects'
import enMessages from '@/i18n/messages/en.json'
import { getPageHref } from '@/i18n/route-map'

import {
  buildHomePageMetadata,
  buildLocalizedPageMetadata,
  buildWorkDetailPageMetadata,
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
          "canonical": "/en",
          "languages": {
            "en": "/en",
            "pl": "/pl",
          },
        },
        "description": "Senior Frontend Engineer specializing in high-performance SaaS products, Next.js, and immersive web experiences. Based in Zakopane, Poland.",
        "title": {
          "absolute": "Sebastian Kolbusz | Freelance Frontend Engineer & SaaS Developer",
        },
      }
    `)
  })

  it('builds resume metadata without duplicating the global title suffix', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'en',
      title: enMessages.cv.title,
      description: enMessages.Metadata.description,
      path: getPageHref('resume'),
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/en/resume",
          "languages": {
            "en": "/en/resume",
            "pl": "/pl/resume",
          },
        },
        "description": "Senior Frontend Engineer specializing in high-performance SaaS products, Next.js, and immersive web experiences. Based in Zakopane, Poland.",
        "title": "Curriculum Vitae",
      }
    `)
  })

  it('builds work index metadata without duplicating the global title suffix', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'en',
      title: enMessages.projectsBook.title,
      description: enMessages.projectsBook.subtitle,
      path: getPageHref('work'),
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/en/work",
          "languages": {
            "en": "/en/work",
            "pl": "/pl/work",
          },
        },
        "description": "A curated collection of high-performance e-commerce platforms, landing pages, and SaaS engineering.",
        "title": "Portfolio",
      }
    `)
  })

  it('builds lab metadata with canonical alternates', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'en',
      title: 'Lab',
      description: 'Design system studies, interface experiments, and front-end prototypes.',
      path: getPageHref('lab'),
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/en/lab",
          "languages": {
            "en": "/en/lab",
            "pl": "/pl/lab",
          },
        },
        "description": "Design system studies, interface experiments, and front-end prototypes.",
        "title": "Lab",
      }
    `)
  })

  it('builds work detail metadata with canonical alternates', () => {
    const project = getProject('zakofy', 'en')
    if (!project) {
      throw new Error('Expected fixture project to exist')
    }

    const metadata = buildWorkDetailPageMetadata({
      locale: 'en',
      slug: project.id,
      project,
      categoryLabel: enMessages.projectsBook.categories[project.category],
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/en/work/zakofy",
          "languages": {
            "en": "/en/work/zakofy",
            "pl": "/pl/work/zakofy",
          },
        },
        "description": "Premium Tatra Mountain Booking Engine",
        "openGraph": {
          "description": "Transforming mountain tourism into a high-end digital experience with a conversion-optimized booking engine.",
          "images": [
            "/images/projects/zakofy.avif",
          ],
          "title": "Zakofy",
        },
        "other": {
          "article:section": "E-Commerce",
        },
        "title": "Zakofy",
      }
    `)
  })
})
