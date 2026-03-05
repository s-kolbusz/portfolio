import { hasLocale } from 'next-intl'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
})

export type Locale = (typeof routing.locales)[number]

const LOCALE_ROOT_PATHS = new Set(routing.locales.map((locale) => `/${locale}`))

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

function getPathSegments(pathname: string) {
  return normalizePathname(pathname).split('/').filter(Boolean)
}

function hasLocalizedRoutePrefix(pathname: string, segment: string) {
  const [locale, firstSegment] = getPathSegments(pathname)
  return Boolean(locale && firstSegment && isRoutingLocale(locale) && firstSegment === segment)
}

export function isRoutingLocale(locale: string): locale is Locale {
  return hasLocale(routing.locales, locale)
}

export function getLocaleOrDefault(locale?: string | null): Locale {
  if (locale && isRoutingLocale(locale)) {
    return locale
  }

  return routing.defaultLocale
}

export function isHomeRoute(pathname: string) {
  const normalized = normalizePathname(pathname)
  return normalized === '/' || LOCALE_ROOT_PATHS.has(normalized)
}

export function isCvRoute(pathname: string) {
  return hasLocalizedRoutePrefix(pathname, 'cv')
}

export function isProjectsRoute(pathname: string) {
  return hasLocalizedRoutePrefix(pathname, 'projects')
}

export function getMetadataAlternates(path: string, currentLocale: Locale) {
  const languages: Record<string, string> = {}

  routing.locales.forEach((locale) => {
    languages[locale] = `/${locale}${path === '/' ? '' : path}`
  })

  return {
    canonical: languages[currentLocale],
    languages,
  }
}
