import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SkipToMain } from './skip-to-main'

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => `translated-${key}`)),
}))

describe('SkipToMain', () => {
  it('renders the skip link with correct href and translation', async () => {
    // Since it's an async component, we await it if calling directly or
    // wrap in a way RTL handles async components.
    // React 19 supports async components in testing better.
    const Component = await SkipToMain()
    render(Component)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#page-content-start')
    expect(link).toHaveTextContent('translated-skip_to_main')
    expect(link).toHaveClass('sr-only')
  })
})
