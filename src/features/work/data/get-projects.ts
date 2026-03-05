import type { Locale } from '@/i18n/routing'

import { portfolioEntries } from './projects'
import type { PortfolioEntryId } from './projects'
import type { PortfolioEntryContent, PortfolioEntry } from './projects-en'
import { projectsEn } from './projects-en'
import { projectsPl } from './projects-pl'

// ---------------------------------------------------------------------------
// Merge base + locale content
// ---------------------------------------------------------------------------

const contentByLocale: Record<Locale, Record<PortfolioEntryId, PortfolioEntryContent>> = {
  en: projectsEn,
  pl: projectsPl,
}

function mergeEntryWithLocaleContent(
  locale: Locale,
  entry: (typeof portfolioEntries)[number]
): PortfolioEntry {
  const localizedContent = contentByLocale[locale][entry.id]

  if (!localizedContent) {
    throw new Error(
      `Missing localized portfolio content for entry "${entry.id}" in locale "${locale}".`
    )
  }

  return {
    ...entry,
    ...localizedContent,
  }
}

/**
 * Returns all portfolio entries merged with locale-specific content,
 * sorted by `order`.
 */
export function getProjects(locale: Locale): PortfolioEntry[] {
  const sortedEntries = [...portfolioEntries].sort((a, b) => a.order - b.order)
  return sortedEntries.map((entry) => mergeEntryWithLocaleContent(locale, entry))
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
