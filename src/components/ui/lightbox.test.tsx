import type { ReactNode } from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Lightbox } from './lightbox'

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}))

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock useScrollStore
vi.mock('@/lib/stores', () => ({
  useScrollStore: vi.fn((selector) => selector({ lenis: { stop: vi.fn(), start: vi.fn() } })),
}))

// Mock useGSAP
vi.mock('@/lib/gsap', () => ({
  gsap: {
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
    fromTo: vi.fn(),
  },
  useGSAP: vi.fn(),
}))

// Mock useFocusTrap
vi.mock('@/hooks/use-focus-trap', () => ({
  useFocusTrap: vi.fn(),
}))

describe('Lightbox', () => {
  const images = [
    { url: '/img1.jpg', alt: 'Image 1', width: 100, height: 100, type: 'image' as const },
    { url: '/img2.jpg', alt: 'Image 2', width: 100, height: 100, type: 'image' as const },
  ]

  it('renders the initial image', () => {
    render(<Lightbox images={images} initialIndex={0} onClose={vi.fn()} />)

    expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('navigates to the next image', () => {
    render(<Lightbox images={images} initialIndex={0} onClose={vi.fn()} />)

    const nextButton = screen.getByLabelText('next')
    fireEvent.click(nextButton)

    expect(screen.getByAltText('Image 2')).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('navigates to the previous image', () => {
    render(<Lightbox images={images} initialIndex={1} onClose={vi.fn()} />)

    const prevButton = screen.getByLabelText('previous')
    fireEvent.click(prevButton)

    expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} initialIndex={0} onClose={onClose} />)

    const closeButton = screen.getByLabelText('close')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the overlay', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} initialIndex={0} onClose={onClose} />)

    const overlay = screen.getByRole('dialog')
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking the image container', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} initialIndex={0} onClose={onClose} />)

    // The image itself or its container
    const image = screen.getByAltText('Image 1')
    fireEvent.click(image)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('handles keyboard navigation', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} initialIndex={0} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByAltText('Image 2')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Image 1')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
