import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/locale', () => ({
  getLocaleFromParams: async (params: Promise<{ locale: string }>) => {
    const { locale } = await params
    return locale
  },
}))

import { generateMetadata } from './layout'

describe('design layout metadata', () => {
  it('sets a canonical-matching Open Graph URL and noindex robots directives for pl', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'pl' }),
    })

    expect(metadata.alternates?.canonical).toBe('https://kolbusz.xyz/pl/design')
    expect(metadata.openGraph?.url).toBe('https://kolbusz.xyz/pl/design')
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    })
  })

  it('uses English title and description for en locale', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(metadata.title).toBe('Design System')
    expect(metadata.description).toContain('Internal design-system preview')
    expect(metadata.alternates?.canonical).toBe('https://kolbusz.xyz/en/design')
  })
})
