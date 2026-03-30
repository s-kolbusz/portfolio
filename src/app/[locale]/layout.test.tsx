import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { getMessages, setRequestLocale } = vi.hoisted(() => ({
  getMessages: vi.fn(async () => ({})),
  setRequestLocale: vi.fn(),
}))

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) => locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('next-intl/server', () => ({
  getMessages,
  setRequestLocale,
}))

vi.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('next/font/google', () => ({
  Fraunces: () => ({ variable: 'font-serif' }),
  JetBrains_Mono: () => ({ variable: 'font-mono' }),
}))

vi.mock('next/font/local', () => ({
  default: () => ({ variable: 'font-sans' }),
}))

vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
}))

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}))

vi.mock('@/components/seo/json-ld', () => ({
  JsonLd: () => null,
}))

vi.mock('@/components/ui/client-overlays', () => ({
  ClientOverlays: () => null,
}))

vi.mock('@/components/ui/skip-to-main', () => ({
  SkipToMain: () => null,
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, locale, children }: { href: string; locale?: string; children: ReactNode }) => (
    <a href={href} data-link-locale={locale ?? ''}>
      {children}
    </a>
  ),
}))

import LocaleLayout from './layout'

describe('LocaleLayout', () => {
  it('renders locale-aware html and hidden navigation links', async () => {
    const element = await LocaleLayout({
      children: <div>Content</div>,
      params: Promise.resolve({ locale: 'pl' }),
    })

    expect(element.props.lang).toBe('pl')
    render(element.props.children.props.children)

    expect(setRequestLocale).toHaveBeenCalledWith('pl')
    expect(getMessages).toHaveBeenCalledWith({ locale: 'pl' })
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('data-link-locale', 'pl')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-link-locale', 'pl')
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('data-link-locale', 'pl')
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('data-link-locale', 'pl')
  })
})
