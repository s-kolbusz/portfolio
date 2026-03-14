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
          "canonical": "https://www.kolbusz.xyz/en",
          "languages": {
            "en": "https://www.kolbusz.xyz/en",
            "pl": "https://www.kolbusz.xyz/pl",
          },
        },
        "description": "Senior Frontend Developer in Zakopane specializing in high-performance Next.js apps and refined digital experiences for global SaaS and local businesses.",
        "title": {
          "absolute": "Sebastian Kolbusz | Senior Frontend Specialist & Web Architect",
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
          },
        },
        "description": "Senior Frontend Developer in Zakopane specializing in high-performance Next.js apps and refined digital experiences for global SaaS and local businesses.",
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
          "canonical": "https://www.kolbusz.xyz/en/projects",
          "languages": {
            "en": "https://www.kolbusz.xyz/en/projects",
            "pl": "https://www.kolbusz.xyz/pl/projects",
          },
        },
        "description": "A collection of high-performance web applications and professional digital appearances.",
        "title": "Selected Work",
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
          },
        },
        "description": "Custom Tatra Mountain Offer Platform",
        "openGraph": {
          "description": "Providing a modern digital appearance for mountain tourism with a custom-built offer presentation system.",
          "images": [
            "/images/projects/zakofy.avif",
          ],
          "title": "Zakofy",
        },
        "other": {
          "article:section": "Offer Presentation",
        },
        "title": "Zakofy",
      }
    `)
  })
})
