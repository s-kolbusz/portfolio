import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { routing } from '@/i18n/routing'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMetadataAlternates(path: string, currentLocale: string) {
  const languages: Record<string, string> = {
    'x-default': `/en${path === '/' ? '' : path}`,
  }

  routing.locales.forEach((locale) => {
    languages[locale] = `/${locale}${path === '/' ? '' : path}`
  })

  return {
    canonical: languages[currentLocale] || languages['en'],
    languages,
  }
}
