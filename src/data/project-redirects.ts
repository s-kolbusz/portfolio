import { routing } from '../i18n/routing'
import { portfolioEntries } from './projects'

/**
 * 301s from the case-study pages of client work that moved to stronypodhale.pl
 * (SEB-20): both locales, straight to the page that now describes the project.
 * The old URLs are indexed, so a redirect hands their signal to the studio's
 * domain instead of wasting it on a 404.
 *
 * Read by next.config.ts, which is why this file uses relative imports only.
 */
export function externalProjectRedirects() {
  return portfolioEntries.flatMap((entry) =>
    'externalUrl' in entry && entry.externalUrl
      ? routing.locales.map((locale) => ({
          source: `/${locale}/projects/${entry.id}`,
          destination: entry.externalUrl,
          statusCode: 301 as const,
        }))
      : []
  )
}
