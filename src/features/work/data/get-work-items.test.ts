import { describe, expect, it } from 'vitest'

import { getFeaturedWorkItems, getWorkItem, getWorkItems } from './get-work-items'
import type { WorkItemContent } from './work-items'
import { workItemsEn } from './work-items-en'

describe('get-work-items', () => {
  it('returns entries sorted by order for a locale', () => {
    const projects = getWorkItems('en')

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
    const project = getWorkItem('billboard-zakopane', 'pl')

    expect(project?.title).toBe('Billboard Zakopane')
    expect(project?.subtitle).toBe('Platforma B2B Reklamy Zewnętrznej')
  })

  it('returns a single entry by slug', () => {
    const project = getWorkItem('zakofy', 'en')

    expect(project?.id).toBe('zakofy')
    expect(project?.title).toBe('Zakofy')
  })

  it('returns undefined for unknown slugs', () => {
    expect(getWorkItem('missing-project', 'en')).toBeUndefined()
  })

  it('returns only featured entries', () => {
    const featuredProjects = getFeaturedWorkItems('en')

    expect(featuredProjects.length).toBeGreaterThan(0)
    expect(featuredProjects.every((project) => project.featured)).toBe(true)
  })

  it('throws when localized content is missing for a work item', () => {
    const mutableWorkItemsEn = workItemsEn as Record<string, WorkItemContent>
    const removedId = 'zakofy'
    const originalContent = mutableWorkItemsEn[removedId]

    delete mutableWorkItemsEn[removedId]

    try {
      expect(() => getWorkItems('en')).toThrowError(
        `Missing localized work item content for "${removedId}" in locale "en".`
      )
    } finally {
      mutableWorkItemsEn[removedId] = originalContent
    }
  })
})
