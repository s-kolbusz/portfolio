import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/locale', () => ({
  getLocaleFromParams: async (params: Promise<{ locale: string }>) => {
    const { locale } = await params
    return locale
  },
}))

import { generateMetadata } from './layout'

describe('design layout metadata', () => {
  it('sets a canonical-matching Open Graph URL and noindex robots directives', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'pl' }),
    })

    expect(metadata.alternates?.canonical).toBe('https://www.kolbusz.xyz/pl/design')
    expect(metadata.openGraph?.url).toBe('https://www.kolbusz.xyz/pl/design')
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    })
  })
})
