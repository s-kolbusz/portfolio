import { describe, expect, it } from 'vitest'

import {
  getCaseStudies,
  getCaseStudy,
  getFeaturedProjects,
  getProject,
  getProjects,
} from './get-projects'
import type { PortfolioEntryContent } from './projects'
import { projectsEn } from './projects-en'
import { STUDIO } from './studio'

describe('get-projects', () => {
  it('returns entries sorted by order for a locale', () => {
    const projects = getProjects('en')

    expect(projects).toHaveLength(5)
    expect(projects.map((project) => project.id)).toEqual([
      'zakofy',
      'your-krakow-travel',
      'wellezza',
      'billboard-zakopane',
      'ready2order',
    ])
  })

  it('returns locale-specific content', () => {
    const project = getProject('billboard-zakopane', 'pl')

    expect(project?.title).toBe('Billboard Zakopane')
    expect(project?.subtitle).toBe('Platforma B2B Reklamy Zewnętrznej')
  })

  it('returns a single entry by slug', () => {
    const project = getProject('zakofy', 'en')

    expect(project?.id).toBe('zakofy')
    expect(project?.title).toBe('Zakofy')
  })

  it('returns undefined for unknown slugs', () => {
    expect(getProject('missing-project', 'en')).toBeUndefined()
  })

  it('returns only featured entries', () => {
    const featuredProjects = getFeaturedProjects('en')

    expect(featuredProjects.length).toBeGreaterThan(0)
    expect(featuredProjects.every((project) => project.featured)).toBe(true)
  })

  it('keeps client work described on stronypodhale.pl out of the case studies', () => {
    const caseStudies = getCaseStudies('en')

    expect(caseStudies.map((project) => project.id)).toEqual(['ready2order'])
  })

  it('finds a case study by slug, but not client work that lives elsewhere', () => {
    expect(getCaseStudy('ready2order', 'pl')?.id).toBe('ready2order')
    expect(getCaseStudy('zakofy', 'pl')).toBeUndefined()
    // The card itself is still listed, with its own copy.
    expect(getProject('zakofy', 'pl')?.studioCaseUrl).toBe(STUDIO.cases.zakofy)
  })

  it('throws when localized content is missing for a portfolio entry', () => {
    const mutableProjectsEn = projectsEn as Record<string, PortfolioEntryContent>
    const removedId = 'zakofy'
    const originalContent = mutableProjectsEn[removedId]

    delete mutableProjectsEn[removedId]

    try {
      expect(() => getProjects('en')).toThrowError(
        `Missing localized portfolio content for entry "${removedId}" in locale "en".`
      )
    } finally {
      mutableProjectsEn[removedId] = originalContent
    }
  })
})
