import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getWorkDetailHref } from '@/i18n/route-map'

const routerPush = vi.fn()
const routerReplace = vi.fn()
const setTheme = vi.fn()

let mockPathname = '/en'
let mockLocale: 'en' | 'pl' = 'en'
let mockActiveSection = 'hero'

const navLabels = {
  hero: 'Home',
  about: 'About',
  projects: 'Work',
  services: 'Services',
  calculator: '3D Print',
  contact: 'Contact',
  resume: 'CV',
} as const

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) => locales.includes(locale),
  useLocale: () => mockLocale,
  useTranslations: () => (key: string) => navLabels[key as keyof typeof navLabels] ?? key,
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme,
  }),
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
  }),
}))

vi.mock('@/features/navigation/hooks/useActiveSection', () => ({
  useActiveSection: () => mockActiveSection,
}))

vi.mock('@/lib/gsap', () => ({
  gsap: {
    to: vi.fn(),
  },
  useGSAP: () => undefined,
}))

vi.mock('./dock-nav-indicator', () => ({
  animateIndicator: vi.fn(),
  syncIndicatorPosition: vi.fn(),
  useWindowResize: vi.fn(),
}))

import { DockNav } from './DockNav'
import { SettingsDock } from './SettingsDock'

describe('navigation integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = '/en'
    mockLocale = 'en'
    mockActiveSection = 'hero'
  })

  it('switches locale while preserving the current route path', () => {
    mockPathname = getWorkDetailHref('zakofy')
    mockLocale = 'en'

    render(<SettingsDock />)

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))

    expect(routerReplace).toHaveBeenCalledWith(getWorkDetailHref('zakofy'), { locale: 'pl' })
  })

  it('scrolls to in-page sections when a section item is clicked on home route', () => {
    mockPathname = '/en'

    const servicesSection = document.createElement('section')
    servicesSection.id = 'services'
    const scrollIntoView = vi.fn()
    Object.defineProperty(servicesSection, 'scrollIntoView', {
      value: scrollIntoView,
      writable: true,
    })
    document.body.appendChild(servicesSection)

    render(<DockNav />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Services' })[0])

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('does not render dock navigation outside the homepage', () => {
    mockPathname = '/en/resume'

    render(<DockNav />)

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Services' })).not.toBeInTheDocument()
  })
})
