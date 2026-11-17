// The stops of the home page, in scroll order. The bar's scale and the menu are both drawn from this list.
// `label` is a key in the `nav` messages, except stronypodhale.pl, which is a brand and is never translated.

export interface Stop {
  /** element id the stop starts at, or null for the water sheet inside the hero track */
  id: string
  href: string
  label: string
  brand?: boolean
}

export const STOPS: Stop[] = [
  { id: 'hero', href: '/#hero', label: 'hero' },
  { id: 'work', href: '/#work', label: 'stronypodhale.pl', brand: true },
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
 * `tops` are the document tops of the sections after the hero (about…contact).
 */
export function stopBounds(tops: number[], viewport: number, maxScroll: number): number[] {
  const starts = [0, SHEET_DARK_AT * viewport, ...tops.map((top) => top - READING_LINE * viewport)]
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
