import { describe, expect, it } from 'vitest'

import { toAbsoluteSiteUrl, SITE_ORIGIN } from './site'

describe('site', () => {
  describe('toAbsoluteSiteUrl', () => {
    it('returns the absolute URL for a path with a leading slash', () => {
      expect(toAbsoluteSiteUrl('/projects')).toBe(`${SITE_ORIGIN}/projects`)
    })

    it('returns the absolute URL for a path without a leading slash', () => {
      expect(toAbsoluteSiteUrl('projects')).toBe(`${SITE_ORIGIN}/projects`)
    })

    it('handles the root path correctly', () => {
      expect(toAbsoluteSiteUrl('/')).toBe(`${SITE_ORIGIN}/`)
    })
  })
})
