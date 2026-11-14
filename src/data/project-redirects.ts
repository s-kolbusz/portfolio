import { routing } from '../i18n/routing'
import { isStudioCase } from './entry-href'
import { portfolioEntries } from './projects'

export type ProjectRedirect = {
  source: string
  destination: string
  statusCode: 301
}

/**
 * 301s from the case-study pages of client work that moved to stronypodhale.pl
 * (SEB-20): both locales, plus the bare /projects/<id> that next-intl would
 * otherwise bounce through a 307 to the default locale first — one hop, straight
 * to the page that now describes the project. The old URLs are indexed, so a
 * redirect hands their signal to the studio's domain instead of wasting it on a
 * 404.
 *
 * Read by next.config.ts, which cannot resolve the @/ alias. Everything this file
 * imports, and everything those import, stays alias-free;
 * project-redirects.test.ts checks it.
 */
export function externalProjectRedirects(): ProjectRedirect[] {
  const prefixes = ['', ...routing.locales.map((locale) => `/${locale}`)]

  return portfolioEntries.filter(isStudioCase).flatMap((entry) =>
    prefixes.map((prefix) => ({
      source: `${prefix}/projects/${entry.id}`,
      destination: entry.studioCaseUrl,
      statusCode: 301 as const,
    }))
  )
}
