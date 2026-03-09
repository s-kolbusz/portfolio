import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  useMedia,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersReducedMotion,
} from './use-media'

describe('useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useMedia('(min-width: 1024px)'))
    expect(result.current).toBe(true)
  })

  it('returns false when media query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useMedia('(min-width: 1024px)'))
    expect(result.current).toBe(false)
  })

  it('responds to media query changes', async () => {
    let changeCallback: () => void = () => {}
    let matches = false

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: vi.fn((event, cb) => {
        if (event === 'change') changeCallback = cb
      }),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useMedia('(min-width: 1024px)'))
    expect(result.current).toBe(false)

    // Simulate change
    await act(async () => {
      matches = true
      changeCallback()
    })

    expect(result.current).toBe(true)
  })

  describe('viewport hooks', () => {
    it('useIsMobile returns true for small screens', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('max-width: 767px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it('useIsTablet returns true for medium screens', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('min-width: 768px') && query.includes('max-width: 1023px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      const { result } = renderHook(() => useIsTablet())
      expect(result.current).toBe(true)
    })

    it('useIsDesktop returns true for large screens', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('min-width: 1024px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      const { result } = renderHook(() => useIsDesktop())
      expect(result.current).toBe(true)
    })

    it('usePrefersReducedMotion returns true when requested', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
      const { result } = renderHook(() => usePrefersReducedMotion())
      expect(result.current).toBe(true)
    })
  })
})
