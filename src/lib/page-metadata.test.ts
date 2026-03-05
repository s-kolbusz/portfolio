import { describe, expect, it } from 'vitest'

import { getProject } from '@/data/get-projects'
import enMessages from '@/i18n/messages/en.json'

import {
  buildCvPageMetadata,
  buildHomePageMetadata,
  buildProjectDetailPageMetadata,
  buildProjectsPageMetadata,
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

  it('builds cv metadata without duplicating the global title suffix', () => {
    const metadata = buildCvPageMetadata({
      locale: 'en',
      title: enMessages.cv.title,
      description: enMessages.Metadata.description,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "canonical": "/en/cv",
          "languages": {
            "en": "/en/cv",
            "pl": "/pl/cv",
          },
        },
        "description": "Senior Frontend Engineer specializing in high-performance SaaS products, Next.js, and immersive web experiences. Based in Zakopane, Poland.",
        "title": "Curriculum Vitae",
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
          "canonical": "/en/projects",
          "languages": {
            "en": "/en/projects",
            "pl": "/pl/projects",
          },
        },
        "description": "A curated collection of high-performance e-commerce platforms, landing pages, and SaaS engineering.",
        "title": "Portfolio",
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
          "canonical": "/en/projects/zakofy",
          "languages": {
            "en": "/en/projects/zakofy",
            "pl": "/pl/projects/zakofy",
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
