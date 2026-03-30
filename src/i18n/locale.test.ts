import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) => locales.includes(locale),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

import { getLocaleOrDefault, isRoutingLocale, requireRoutingLocale } from './locale'

describe('isRoutingLocale', () => {
  it('returns true for a supported locale', () => {
    expect(isRoutingLocale('en')).toBe(true)
    expect(isRoutingLocale('pl')).toBe(true)
  })

  it('returns false for an unsupported locale', () => {
    expect(isRoutingLocale('de')).toBe(false)
    expect(isRoutingLocale('')).toBe(false)
  })
})

describe('getLocaleOrDefault', () => {
  it('returns the locale when it is a supported routing locale', () => {
    expect(getLocaleOrDefault('en')).toBe('en')
    expect(getLocaleOrDefault('pl')).toBe('pl')
  })

  it('returns the default locale when the locale is unsupported', () => {
    expect(getLocaleOrDefault('de')).toBe('en')
  })

  it('returns the default locale when the locale is null', () => {
    expect(getLocaleOrDefault(null)).toBe('en')
  })

  it('returns the default locale when the locale is undefined', () => {
    expect(getLocaleOrDefault(undefined)).toBe('en')
  })
})

describe('requireRoutingLocale', () => {
  it('returns the locale when it is a supported routing locale', () => {
    expect(requireRoutingLocale('en')).toBe('en')
    expect(requireRoutingLocale('pl')).toBe('pl')
  })

  it('calls notFound() when the locale is not supported', () => {
    expect(() => requireRoutingLocale('de')).toThrow('NEXT_NOT_FOUND')
  })
})
