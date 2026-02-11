import type { Locale } from '@/i18n/routing'

import { portfolioEntries } from './projects'
import type { PortfolioEntryContent, PortfolioEntry } from './projects-en'
import { projectsEn } from './projects-en'
import { projectsPl } from './projects-pl'

// ---------------------------------------------------------------------------
// Merge base + locale content
// ---------------------------------------------------------------------------

const contentByLocale: Record<string, Record<string, PortfolioEntryContent>> = {
  en: projectsEn,
  pl: projectsPl,
}

/**
 * Returns all portfolio entries merged with locale-specific content,
 * sorted by `order`.
 */
export function getProjects(locale: Locale): PortfolioEntry[] {
  const content = contentByLocale[locale] ?? projectsEn

  return portfolioEntries
    .map((entry) => ({
      ...entry,
      ...content[entry.id],
    }))
    .sort((a, b) => a.order - b.order)
}

/**
 * Finds a single portfolio entry by slug.
 */
export function getProject(slug: string, locale: Locale): PortfolioEntry | undefined {
  return getProjects(locale).find((p) => p.id === slug)
}

/**
 * Returns only featured entries (used by the homepage Projects section).
 */
export function getFeaturedProjects(locale: Locale): PortfolioEntry[] {
  return getProjects(locale).filter((p) => p.featured)
}
