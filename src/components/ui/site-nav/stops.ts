// The stops of the home page, in scroll order. The bar's scale and the menu are both drawn from this list.
// `label` is a key in the `nav` messages, except stronypodhale.pl, which is a brand and is never translated.

export interface Stop {
  /** element id the stop starts at, or null for the water sheet inside the hero track */
  id: string
  href: string
  label: string
  brand?: boolean
  /**
   * where the part begins, in screens scrolled after its element's top reached the top of the screen;
   * by default −READING_LINE (its top passes the reading line). A section laid over the end of the one
   * before it starts when it actually covers the screen, not when its element does.
   */
  at?: number
  /** where a jump from the menu lands, in screens past the element's top (default 0) */
  land?: number
}

export const STOPS: Stop[] = [
  { id: 'hero', href: '/#hero', label: 'hero' },
  { id: 'work', href: '/#work', label: 'stronypodhale.pl', brand: true },
  { id: 'aspect-preview', href: '/#aspect-preview', label: 'aspect' },
  { id: 'ready2order', href: '/#ready2order', label: 'ready2order' },
  // act 4 is three parts (owner, 2026-11-22): the line with the page off the shelf, piczura.com, the prices
  { id: 'how-i-work', href: '/#how-i-work', label: 'how_i_work' },
  { id: 'piczura', href: '/#piczura', label: 'piczura.com', brand: true },
  // the close starts 150svh over piczura's last frame (how-i-work-end.css); its paper covers half the
  // screen a quarter of a screen after the close pins and all of it after half (S.cover in
  // how-i-work-end.tsx); a jump lands on the covered sheet
  { id: 'prices', href: '/#prices', label: 'prices', at: 0.25, land: 0.5 },
  { id: 'about', href: '/#about', label: 'about' },
  { id: 'projects', href: '/#projects', label: 'projects' },
  { id: 'services', href: '/#services', label: 'services' },
  { id: 'calculator', href: '/#calculator', label: 'calculator' },
  { id: 'contact', href: '/#contact', label: 'contact' },
]

/** a section becomes current when its top passes this share of the viewport */
export const READING_LINE = 0.4
/**
 * stronypodhale.pl starts where the hero liquid has darkened into the water sheet:
 * the stage's darkening is half done at 0.1 + 0.25 × 2.4 screens of scroll (see liquid-stage.ts)
 */
export const SHEET_DARK_AT = 0.7

export interface Position {
  index: number
  /** 0…1 through the current stop */
  progress: number
}

/**
 * Scroll positions (in px) where each stop starts, plus the end of the page.
 * `tops` are the document tops of the sections after the hero (aspect-preview…contact).
 */
export function stopBounds(tops: number[], viewport: number, maxScroll: number): number[] {
  const after = STOPS.slice(2)
  const starts = [
    0,
    SHEET_DARK_AT * viewport,
    ...tops.map((top, i) => top + (after[i]?.at ?? -READING_LINE) * viewport),
  ]
  const end = Math.max(maxScroll, starts[starts.length - 1] + 1)
  const bounds = [...starts, end]
  // keep the bounds increasing, whatever the layout does
  for (let i = 1; i < bounds.length; i++) bounds[i] = Math.max(bounds[i], bounds[i - 1] + 1)
  return bounds
}

export function locate(scroll: number, bounds: number[]): Position {
  const last = bounds.length - 2
  let index = 0
  while (index < last && scroll >= bounds[index + 1]) index++
  const span = bounds[index + 1] - bounds[index]
  const progress = Math.min(Math.max((scroll - bounds[index]) / span, 0), 1)
  return { index, progress }
}

/** each stop's share of the scale: its length on the page, with a floor so short stops stay visible */
export function stopShares(bounds: number[], floor = 0.06): number[] {
  const lengths = bounds.slice(1).map((end, i) => end - bounds[i])
  const total = lengths.reduce((sum, length) => sum + length, 0)
  const raw = lengths.map((length) => Math.max(length / total, floor))
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((share) => share / sum)
}
