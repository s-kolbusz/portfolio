import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { routing, type Locale } from '@/i18n/routing'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
