'use client'

import { type ComponentProps, forwardRef, useMemo } from 'react'

import { useLocale } from 'next-intl'
import NextLink from 'next/link'
import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation'

import { type Locale } from './routing'

/**
 * Navigation for the redesign while it lives at /v2/<locale> next to the old site (owner, 2026-11-26).
 * The redesign is only the home page, so the home and its #parts stay under /v2; every other page
 * (CV, projects, services) still exists only in the old design and is linked at its usual address.
 * Same surface as `@/i18n/navigation` (Link, usePathname, useRouter), so the swap later is an import.
 */
export const V2_BASE = '/v2'

export function v2Href(href: string, locale: string) {
  if (href === '/' || href.startsWith('/#')) {
    return `${V2_BASE}/${locale}${href.slice(1)}`
  }
  return `/${locale}${href}`
}

/** The pathname the old helpers would report: '/' for the v2 home, the old path everywhere else. */
export function stripV2(pathname: string) {
  const match = /^\/v2\/(?:en|pl)(\/.*)?$/.exec(pathname)
  if (match) return match[1] || '/'
  return pathname.replace(/^\/(?:en|pl)(?=\/|$)/, '') || '/'
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href' | 'locale'> & {
  href: string
  locale?: Locale
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, locale, ...rest },
  ref
) {
  const current = useLocale()
  return <NextLink ref={ref} href={v2Href(href, locale ?? current)} {...rest} />
})

export function usePathname() {
  return stripV2(useNextPathname())
}

export function useRouter() {
  const router = useNextRouter()
  const current = useLocale()
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: { locale?: Locale; scroll?: boolean }) =>
        router.push(v2Href(href, options?.locale ?? current), { scroll: options?.scroll }),
      replace: (href: string, options?: { locale?: Locale; scroll?: boolean }) =>
        router.replace(v2Href(href, options?.locale ?? current), { scroll: options?.scroll }),
    }),
    [router, current]
  )
}
