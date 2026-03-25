import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Polyfill for Radix UI / jsdom pointer events
if (typeof window !== 'undefined') {
  if (!window.Element.prototype.hasPointerCapture) {
    window.Element.prototype.hasPointerCapture = vi.fn(() => false)
  }
  if (!window.Element.prototype.setPointerCapture) {
    window.Element.prototype.setPointerCapture = vi.fn()
  }
  if (!window.Element.prototype.releasePointerCapture) {
    window.Element.prototype.releasePointerCapture = vi.fn()
  }

  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = vi.fn()
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  }
}

afterEach(() => {
  cleanup()
})

// Mock next-intl globally so tests using useTranslations don't fail without the provider context
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
  useLocale: vi.fn(() => 'en'),
}))
