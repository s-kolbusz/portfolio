import { describe, expect, it } from 'vitest'

import { isHomeRoute, isCvRoute, isProjectsRoute } from './route-predicates'

describe('route-predicates', () => {
  describe('isHomeRoute', () => {
    it('returns true for root paths', () => {
      expect(isHomeRoute('/')).toBe(true)
      expect(isHomeRoute('/en')).toBe(true)
      expect(isHomeRoute('/pl')).toBe(true)
    })

    it('returns true for root paths with trailing slashes', () => {
      expect(isHomeRoute('/en/')).toBe(true)
      expect(isHomeRoute('/pl/')).toBe(true)
    })

    it('returns false for other paths', () => {
      expect(isHomeRoute('/projects')).toBe(false)
      expect(isHomeRoute('/cv')).toBe(false)
    })
  })

  describe('isCvRoute', () => {
    it('returns true for CV paths', () => {
      expect(isCvRoute('/cv')).toBe(true)
      expect(isCvRoute('/en/cv')).toBe(true)
      expect(isCvRoute('/pl/cv/')).toBe(true)
    })

    it('returns false for other paths', () => {
      expect(isCvRoute('/')).toBe(false)
      expect(isCvRoute('/projects')).toBe(false)
    })
  })

  describe('isProjectsRoute', () => {
    it('returns true for project paths', () => {
      expect(isProjectsRoute('/projects')).toBe(true)
      expect(isProjectsRoute('/en/projects')).toBe(true)
      expect(isProjectsRoute('/pl/projects/my-app')).toBe(true)
    })

    it('returns false for other paths', () => {
      expect(isProjectsRoute('/')).toBe(false)
      expect(isProjectsRoute('/cv')).toBe(false)
    })
  })
})
