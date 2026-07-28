import { render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { SmoothScroller } from './smooth-scroller'

// Mock useScrollStore
const setLenis = vi.fn()
vi.mock('@/lib/stores', () => ({
  useScrollStore: vi.fn((selector) => selector({ setLenis })),
}))

// Mock useMedia
const mockPrefersReducedMotion = vi.fn(() => false)
vi.mock('@/hooks/use-media', () => ({
  usePrefersReducedMotion: () => mockPrefersReducedMotion(),
}))

// Mock Lenis as a class
const mockLenisInstance = {
  on: vi.fn(),
  raf: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('lenis', () => {
  return {
    default: class {
      constructor() {
        return mockLenisInstance
      }
    },
  }
})

// Mock GSAP
vi.mock('gsap/ScrollTrigger', () => ({
  default: {
    update: vi.fn(),
  },
}))

vi.mock('@/lib/gsap-core', () => {
  const mockGsap = {
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
    registerPlugin: vi.fn(),
  }
  return {
    gsap: mockGsap,
    useGSAP: vi.fn((cb: () => void) => cb()),
  }
})

vi.mock('@/lib/gsap-scroll', () => ({
  ScrollTrigger: {
    update: vi.fn(),
  },
}))

describe('SmoothScroller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrefersReducedMotion.mockReturnValue(false)
  })

  it('initializes Lenis and stores it in the scroll store', () => {
    render(<SmoothScroller />)

    expect(setLenis).toHaveBeenCalledWith(mockLenisInstance)
    expect(mockLenisInstance.on).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(<SmoothScroller />)
    unmount()

    expect(setLenis).toHaveBeenCalledWith(null)
    expect(mockLenisInstance.destroy).toHaveBeenCalled()
  })

  it('does not initialize if reduced motion is preferred', () => {
    mockPrefersReducedMotion.mockReturnValue(true)

    render(<SmoothScroller />)

    expect(setLenis).not.toHaveBeenCalled()
  })

  it('scrolls same-page hash links itself under reduced motion', () => {
    mockPrefersReducedMotion.mockReturnValue(true)
    render(<SmoothScroller />)

    const target = document.createElement('section')
    target.id = 'contact'
    target.scrollIntoView = vi.fn()
    const link = document.createElement('a')
    link.href = `${location.origin}${location.pathname}#contact`
    document.body.append(target, link)

    link.click()

    expect(target.scrollIntoView).toHaveBeenCalled()

    target.remove()
    link.remove()
  })
})
