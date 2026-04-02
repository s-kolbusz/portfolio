import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
  // Disable automatic link header hreflang — HTML <link rel="alternate"> tags in page metadata
  // and sitemap xhtml:link entries serve as the single source of truth.
  // Having both produces conflicting x-default values (middleware: /, metadata: /en).
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]
