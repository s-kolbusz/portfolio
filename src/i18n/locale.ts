import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'

import { routing, type Locale } from './routing'

export function isRoutingLocale(locale: string): locale is Locale {
  return hasLocale(routing.locales, locale)
}

export function getLocaleOrDefault(locale?: string | null): Locale {
  if (locale && isRoutingLocale(locale)) {
    return locale
  }

  return routing.defaultLocale
}

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
