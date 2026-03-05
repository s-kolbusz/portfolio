import { notFound } from 'next/navigation'

import { isRoutingLocale, type Locale } from './routing'

export function requireRoutingLocale(locale: string): Locale {
  if (!isRoutingLocale(locale)) {
    notFound()
  }

  return locale
}

export async function getLocaleFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  return requireRoutingLocale(locale)
}
