import type { PortfolioEntryBase } from './projects'

/** What any card needs to know to link somewhere: the entry and where its case lives. */
export type LinkableEntry = Pick<PortfolioEntryBase, 'id' | 'studioCaseUrl'>

type StudioCase<T extends LinkableEntry> = T & { studioCaseUrl: string }

/**
 * True when the entry is client work described on stronypodhale.pl rather than a
 * case study here. A type guard, so callers get `studioCaseUrl` as a string.
 *
 * Loaded by next.config.ts through project-redirects.ts: relative imports only.
 */
export function isStudioCase<T extends LinkableEntry>(entry: T): entry is StudioCase<T> {
  return Boolean(entry.studioCaseUrl)
}

/**
 * Where a card for this entry leads: its case study on this site, or the page on
 * stronypodhale.pl that describes the client work.
 *
 * Kept apart from get-projects.ts so client components can import it without
 * pulling every locale's case-study copy into their bundle.
 */
export function getEntryHref(entry: LinkableEntry): string {
  return isStudioCase(entry) ? entry.studioCaseUrl : `/projects/${entry.id}`
}
