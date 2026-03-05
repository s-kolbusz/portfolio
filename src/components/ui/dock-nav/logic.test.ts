import { describe, expect, it } from 'vitest'

import {
  NAV_ITEMS,
  getActiveItemIndex,
  getDesktopIndicatorOffset,
  getHoverScale,
  getMobileIndicatorOffset,
  isCvRoute,
  isHomeRoute,
  isProjectsRoute,
} from './logic'

describe('dock-nav logic', () => {
  it('detects home routes', () => {
    expect(isHomeRoute('/')).toBe(true)
    expect(isHomeRoute('/en')).toBe(true)
    expect(isHomeRoute('/en/')).toBe(true)
    expect(isHomeRoute('/pl')).toBe(true)
    expect(isHomeRoute('/cv')).toBe(false)
  })

  it('detects cv and projects pages', () => {
    expect(isCvRoute('/en/cv')).toBe(true)
    expect(isCvRoute('/en/cv/')).toBe(true)
    expect(isCvRoute('/projects')).toBe(false)
    expect(isProjectsRoute('/en/projects')).toBe(true)
    expect(isProjectsRoute('/en/projects/')).toBe(true)
    expect(isProjectsRoute('/')).toBe(false)
  })

  it('selects hero item by default on home when no active section', () => {
    const index = getActiveItemIndex({ pathname: '/', activeSection: null })
    expect(index).toBe(0)
  })

  it('selects section item on home when section is active', () => {
    const index = getActiveItemIndex({ pathname: '/en', activeSection: 'services' })
    const servicesIndex = NAV_ITEMS.findIndex((item) => item.id === 'services')
    expect(index).toBe(servicesIndex)
  })

  it('selects cv item on cv pages', () => {
    const index = getActiveItemIndex({ pathname: '/pl/cv', activeSection: null })
    const cvIndex = NAV_ITEMS.findIndex((item) => item.id === 'cv')
    expect(index).toBe(cvIndex)
  })

  it('returns no active item for non-home and non-cv routes', () => {
    const index = getActiveItemIndex({ pathname: '/en/projects/foo', activeSection: 'hero' })
    expect(index).toBe(-1)
  })

  it('computes desktop indicator offset with page separator accounted for', () => {
    const cvIndex = NAV_ITEMS.findIndex((item) => item.id === 'cv')
    expect(getDesktopIndicatorOffset(cvIndex)).toBe(409)
  })

  it('computes mobile indicator offset with page separator accounted for', () => {
    const cvIndex = NAV_ITEMS.findIndex((item) => item.id === 'cv')
    expect(getMobileIndicatorOffset(cvIndex)).toBe(325)
  })

  it('computes hover scale based on index distance', () => {
    expect(getHoverScale(2, null)).toBe(1)
    expect(getHoverScale(2, 2)).toBe(1.2)
    expect(getHoverScale(2, 1)).toBe(1.1)
    expect(getHoverScale(2, 0)).toBe(1.05)
    expect(getHoverScale(2, 5)).toBe(1)
  })
})
