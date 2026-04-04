import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { AnimatedNumber } from './animated-number'

// Mock useMedia
const mockPrefersReducedMotion = vi.fn(() => false)
vi.mock('@/hooks/use-media', () => ({
  usePrefersReducedMotion: () => mockPrefersReducedMotion(),
}))

// Mock GSAP
const mockTo = vi.fn()
vi.mock('@/lib/gsap-core', () => ({
  gsap: {
    to: (obj: unknown, props: { onUpdate?: () => void }) => {
      mockTo(obj, props)
      if (props.onUpdate) props.onUpdate()
    },
  },
  useGSAP: (cb: () => void) => {
    cb()
  },
}))

describe('AnimatedNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrefersReducedMotion.mockReturnValue(false)
  })

  it('renders initial value', () => {
    render(<AnimatedNumber value={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders with custom formatter', () => {
    render(<AnimatedNumber value={100} formatter={(v) => `$${v}`} />)
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('updates text content via GSAP on value change', () => {
    const { rerender } = render(<AnimatedNumber value={100} />)
    rerender(<AnimatedNumber value={200} />)

    expect(mockTo).toHaveBeenCalled()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('updates immediately if reduced motion is preferred', () => {
    mockPrefersReducedMotion.mockReturnValue(true)
    const { rerender } = render(<AnimatedNumber value={100} />)
    rerender(<AnimatedNumber value={200} />)

    expect(mockTo).not.toHaveBeenCalled()
    expect(screen.getByText('200')).toBeInTheDocument()
  })
})
