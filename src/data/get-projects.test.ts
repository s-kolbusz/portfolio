import { describe, expect, it } from 'vitest'

import { getFeaturedProjects, getProject, getProjects } from './get-projects'
import type { PortfolioEntryContent } from './projects'
import { projectsEn } from './projects-en'

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
