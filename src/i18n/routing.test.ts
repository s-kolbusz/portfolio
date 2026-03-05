import { describe, expect, it } from 'vitest'

import { getPageHref } from './route-map'
import {
  getLocaleOrDefault,
  getMetadataAlternates,
  isRoutingLocale,
  isResumeRoute,
  isWorkRoute,
  matchesLocalizedPageRoute,
} from './routing'

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
    expect(getMetadataAlternates(getPageHref('work'), 'pl')).toEqual({
      canonical: '/pl/work',
      languages: {
        en: '/en/work',
        pl: '/pl/work',
      },
    })
  })

  it('matches localized page paths against route hrefs', () => {
    expect(matchesLocalizedPageRoute('/en/work/zakofy', getPageHref('work'))).toBe(true)
    expect(matchesLocalizedPageRoute('/pl/lab', getPageHref('lab'))).toBe(true)
    expect(matchesLocalizedPageRoute('/pl', getPageHref('home'))).toBe(true)
    expect(matchesLocalizedPageRoute('/en/resume', getPageHref('work'))).toBe(false)
  })

  it('detects resume and work routes', () => {
    expect(isResumeRoute('/en/resume')).toBe(true)
    expect(isResumeRoute('/en/cv')).toBe(false)
    expect(isWorkRoute('/pl/work')).toBe(true)
    expect(isWorkRoute('/pl/work/zakofy')).toBe(true)
    expect(isWorkRoute('/pl/projects')).toBe(false)
  })
})
