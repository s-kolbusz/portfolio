import { describe, expect, it } from 'vitest'

import { isItemOutsideViewport } from './scroll'

describe('project-item scroll visibility', () => {
  it('detects element below viewport', () => {
    expect(isItemOutsideViewport({ top: 200, bottom: 1200 }, 900, 100)).toBe(true)
  })

  it('detects element above threshold', () => {
    expect(isItemOutsideViewport({ top: 40, bottom: 300 }, 900, 100)).toBe(true)
  })

  it('returns false when element is in a good viewport window', () => {
    expect(isItemOutsideViewport({ top: 140, bottom: 800 }, 900, 100)).toBe(false)
  })
})
