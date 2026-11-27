/** subpages that exist in the new design under /v2; a page joins this list when it is built */
export const V2_PAGES = ['/about'] as const

export function isV2Page(href: string) {
  const path = href.split('#')[0]
  return (V2_PAGES as readonly string[]).includes(path)
}
