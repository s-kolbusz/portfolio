import { describe, expect, it } from 'vitest'

import { getLocaleOrDefault, getMetadataAlternates, isRoutingLocale } from './routing'

describe('routing helpers', () => {
  it('recognizes supported locales', () => {
    expect(isRoutingLocale('en')).toBe(true)
    expect(isRoutingLocale('pl')).toBe(true)
    expect(isRoutingLocale('de')).toBe(false)
  })

  it('defaults invalid locales to the configured default locale', () => {
    expect(getLocaleOrDefault('pl')).toBe('pl')
    expect(getLocaleOrDefault('de')).toBe('en')
    expect(getLocaleOrDefault()).toBe('en')
  })

  it('builds locale-aware metadata alternates from the shared routing config', () => {
    expect(getMetadataAlternates('/projects', 'pl')).toEqual({
      canonical: '/pl/projects',
      languages: {
        en: '/en/projects',
        pl: '/pl/projects',
      },
    })
  })
})
