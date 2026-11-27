import { isV2Page } from '@/i18n/v2-pages'

/**
 * The subpages of the redesign, in the order their doors lead (owner, 2026-11-26): About → How I work
 * with agents → ready2order → piczura.com. `key` names the page in the `subpages` messages (title, the
 * title's quiet tail, the door's line). A page not built yet still shows its door, which then does not open.
 */
export interface Subpage {
  key: 'about' | 'agents' | 'ready2order'
  href: string
}

export const SUBPAGES: Subpage[] = [
  { key: 'about', href: '/about' },
  { key: 'agents', href: '/agents' },
  { key: 'ready2order', href: '/ready2order' },
]

export function nextSubpage(key: Subpage['key']) {
  const at = SUBPAGES.findIndex((page) => page.key === key)
  const next = SUBPAGES[at + 1]
  return next ? { ...next, built: isV2Page(next.href) } : null
}
