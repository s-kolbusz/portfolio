import { describe, expect, it } from 'vitest'

import { getPageHref } from '@/i18n/route-map'
import { isHomeRoute, isResumeRoute, isWorkRoute } from '@/i18n/routing'

import {
  NAV_ITEMS,
  getActiveItemIndex,
  getDesktopIndicatorOffset,
  getHoverScale,
  getMobileIndicatorOffset,
} from './dock-nav-logic'

describe('dock-nav logic', () => {
  it('detects home routes', () => {
    expect(isHomeRoute('/')).toBe(true)
    expect(isHomeRoute('/en')).toBe(true)
    expect(isHomeRoute('/en/')).toBe(true)
    expect(isHomeRoute('/pl')).toBe(true)
    expect(isHomeRoute(getPageHref('resume'))).toBe(false)
  })

  it('detects resume and work pages', () => {
    expect(isResumeRoute('/en/resume')).toBe(true)
    expect(isResumeRoute('/en/resume/')).toBe(true)
    expect(isResumeRoute('/resume')).toBe(false)
    expect(isWorkRoute('/en/work')).toBe(true)
    expect(isWorkRoute('/en/work/')).toBe(true)
    expect(isWorkRoute('/en/work/zakofy')).toBe(true)
    expect(isWorkRoute('/')).toBe(false)
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

  it('selects resume item on resume pages', () => {
    const index = getActiveItemIndex({ pathname: '/pl/resume', activeSection: null })
    const resumeIndex = NAV_ITEMS.findIndex((item) => item.id === 'resume')
    expect(index).toBe(resumeIndex)
  })

  it('does not select homepage items on non-home routes without dedicated dock entries', () => {
    expect(getActiveItemIndex({ pathname: '/en/work/foo', activeSection: 'hero' })).toBe(-1)
    expect(getActiveItemIndex({ pathname: '/en/lab', activeSection: null })).toBe(-1)
  })

  it('computes desktop indicator offset with page separator accounted for', () => {
    const resumeIndex = NAV_ITEMS.findIndex((item) => item.id === 'resume')
    expect(getDesktopIndicatorOffset(resumeIndex)).toBe(409)
  })

  it('computes mobile indicator offset with page separator accounted for', () => {
    const resumeIndex = NAV_ITEMS.findIndex((item) => item.id === 'resume')
    expect(getMobileIndicatorOffset(resumeIndex)).toBe(325)
  })

  it('computes hover scale based on index distance', () => {
    expect(getHoverScale(2, null)).toBe(1)
    expect(getHoverScale(2, 2)).toBe(1.2)
    expect(getHoverScale(2, 1)).toBe(1.1)
    expect(getHoverScale(2, 0)).toBe(1.05)
    expect(getHoverScale(2, 5)).toBe(1)
  })
})
