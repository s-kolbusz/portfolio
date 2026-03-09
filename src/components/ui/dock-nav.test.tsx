import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { DockNav } from './dock-nav'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}))

// Mock hooks
vi.mock('@/hooks/use-active-section', () => ({
  useActiveSection: vi.fn(() => 'hero'),
}))

const mockPathname = vi.fn(() => '/en')
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}))

// Mock GSAP
vi.mock('@/lib/gsap', () => ({
  useGSAP: vi.fn(),
}))

// Mock indicator logic
vi.mock('./dock-nav/indicator', () => ({
  animateIndicator: vi.fn(),
  syncIndicatorPosition: vi.fn(),
  useWindowResize: vi.fn(),
}))

describe('DockNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname.mockReturnValue('/en')
  })

  it('renders navigation items', () => {
    render(<DockNav />)
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
    // Check for some known items (keys from translations mock)
    expect(screen.getAllByLabelText('hero')).toHaveLength(2) // Mobile and desktop
  })

  it('navigates to section on click if on home', () => {
    const scrollIntoView = vi.fn()
    window.document.getElementById = vi.fn().mockReturnValue({
      scrollIntoView,
    })

    render(<DockNav />)

    // Find desktop "about" button
    const aboutButtons = screen.getAllByLabelText('about')
    fireEvent.click(aboutButtons[0])

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('pushes to href if not on home', () => {
    mockPathname.mockReturnValue('/en/cv')

    render(<DockNav />)

    const aboutButtons = screen.getAllByLabelText('about')
    fireEvent.click(aboutButtons[0])

    expect(mockPush).toHaveBeenCalledWith('/#about')
  })

  it('pushes to page href for page items', () => {
    render(<DockNav />)

    const cvButtons = screen.getAllByLabelText('cv')
    fireEvent.click(cvButtons[0])

    expect(mockPush).toHaveBeenCalledWith('/cv')
  })

  it('hides on projects page', () => {
    mockPathname.mockReturnValue('/en/projects')

    const { container } = render(<DockNav />)
    expect(container).toBeEmptyDOMElement()
  })
})
