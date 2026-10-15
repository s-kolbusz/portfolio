import type { PortfolioEntryBase } from './projects'

type LinkableEntry = Pick<PortfolioEntryBase, 'id' | 'externalUrl'>

/**
 * Where a card for this entry leads: its case study on this site, or the page on
 * stronypodhale.pl that describes the client work (`externalUrl`).
 *
 * Kept apart from get-projects.ts so client components can import it without
 * pulling every locale's case-study copy into their bundle.
 */
export function getEntryHref(entry: LinkableEntry): string {
  return entry.externalUrl ?? `/projects/${entry.id}`
}

/** True when the entry is described on stronypodhale.pl rather than here. */
export function isExternalEntry(entry: LinkableEntry): boolean {
  return Boolean(entry.externalUrl)
}
