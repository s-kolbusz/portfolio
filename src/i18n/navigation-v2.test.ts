import { describe, expect, it } from 'vitest'

import { stripV2, v2Href } from './navigation-v2'
import { isV2Page } from './v2-pages'

describe('v2 navigation', () => {
  it('keeps the home, its parts and the built subpages under /v2', () => {
    expect(v2Href('/', 'pl')).toBe('/v2/pl')
    expect(v2Href('/#contact', 'en')).toBe('/v2/en#contact')
    expect(v2Href('/about', 'pl')).toBe('/v2/pl/about')
  })

  it('sends pages not yet redesigned to the old site', () => {
    expect(v2Href('/cv', 'pl')).toBe('/pl/cv')
    expect(isV2Page('/projects')).toBe(false)
  })

  it('reports the path without the /v2 prefix', () => {
    expect(stripV2('/v2/pl/about')).toBe('/about')
    expect(stripV2('/v2/en')).toBe('/')
  })
})
