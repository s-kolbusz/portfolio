import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { SettingsDock } from './settings-dock'

// Mock useTheme
const setTheme = vi.fn()
const mockUseTheme = vi.fn(() => ({
  setTheme,
  resolvedTheme: 'light',
}))

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
  useTranslations: vi.fn(() => (key: string) => key),
}))

// Mock navigation
const replace = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(() => '/test'),
  useRouter: vi.fn(() => ({
    replace,
  })),
}))

describe('SettingsDock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({
      setTheme,
      resolvedTheme: 'light',
    })
  })

  it('toggles the theme from light to dark', () => {
    render(<SettingsDock />)

    const themeButton = screen.getByLabelText('toggle_theme')
    fireEvent.click(themeButton)

    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles the theme from dark to light', () => {
    mockUseTheme.mockReturnValue({
      setTheme,
      resolvedTheme: 'dark',
    })

    render(<SettingsDock />)

    const themeButton = screen.getByLabelText('toggle_theme')
    fireEvent.click(themeButton)

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('switches the language when language button is clicked', () => {
    render(<SettingsDock />)

    const langButton = screen.getByLabelText('switch_language')
    expect(langButton).toHaveTextContent('EN')

    fireEvent.click(langButton)

    expect(replace).toHaveBeenCalledWith('/test', { locale: 'pl' })
  })
})
