import { describe, expect, it } from 'vitest'

import { getImageToRender } from './state'

describe('project-hover-preview state', () => {
  it('uses active image when available', () => {
    expect(getImageToRender('active.jpg', 'last.jpg')).toBe('active.jpg')
  })

  it('falls back to last image when active image is null', () => {
    expect(getImageToRender(null, 'last.jpg')).toBe('last.jpg')
  })

  it('returns null when both active and last image are absent', () => {
    expect(getImageToRender(null, null)).toBeNull()
  })
})
