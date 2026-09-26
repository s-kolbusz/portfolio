/**
 * The hero name as a mask for the shader, so the name can melt as matter.
 *
 * Each glyph is drawn with the element's own computed font at its measured
 * position, so the first melting frame lines up with the DOM text it
 * replaces. Two channels: R = the crisp glyphs, G = a blurred copy the
 * shader blends towards as the letters soften like warm wax.
 *
 * Drips start where the type is lowest: the bottom of each glyph (bowls,
 * feet, tails), found by scanning the mask itself.
 */

export interface DripOrigin {
  /** Stage-space position of the drip's root, px. */
  x: number
  y: number
  /** Stroke thickness at the root, px (sizes neck and head). */
  stroke: number
  /** Longest run, as a multiple of the glyph height. */
  reach: number
  /** Share of the melt before this drip starts to run (0–1). */
  delay: number
}

export interface NameMask {
  /** RGBA pixels: R crisp mask, G softened mask. */
  image: ImageData
  /** Stage-space box the mask covers, px. */
  left: number
  top: number
  width: number
  height: number
  /** Blur radius of the soft channel, px. */
  softRadius: number
  drips: DripOrigin[]
}

/** Deterministic 0–1 hash, so the name melts the same way every visit. */
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

interface Glyph {
  text: string
  font: string
  left: number
  top: number
  width: number
  height: number
}

export function renderNameMask(
  chars: ReadonlyArray<HTMLElement>,
  stageTop: number,
  pixelRatio: number
): NameMask | null {
  const glyphs: Glyph[] = chars
    .map((char) => {
      const rect = char.getBoundingClientRect()
      return {
        text: char.textContent ?? '',
        font: getComputedStyle(char).font,
        left: rect.left,
        top: rect.top - stageTop,
        width: rect.width,
        height: rect.height,
      }
    })
    .filter((glyph) => glyph.text.trim() !== '' && glyph.width > 0)
  if (glyphs.length === 0) return null

  const glyphHeight = Math.max(...glyphs.map((glyph) => glyph.height))
  const softRadius = glyphHeight * 0.06
  const pad = softRadius * 3
  const left = Math.min(...glyphs.map((g) => g.left)) - pad
  const top = Math.min(...glyphs.map((g) => g.top)) - pad
  const right = Math.max(...glyphs.map((g) => g.left + g.width)) + pad
  const bottom = Math.max(...glyphs.map((g) => g.top + g.height)) + pad
  const width = right - left
  const height = bottom - top

  const scale = Math.min(pixelRatio, 2)
  const w = Math.ceil(width * scale)
  const h = Math.ceil(height * scale)

  const draw = (filter: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    context.scale(scale, scale)
    context.filter = filter
    context.fillStyle = '#fff'
    context.textBaseline = 'alphabetic'
    for (const glyph of glyphs) {
      context.font = glyph.font
      const metrics = context.measureText(glyph.text)
      const ascent = metrics.fontBoundingBoxAscent
      const descent = metrics.fontBoundingBoxDescent
      // CSS places the glyph's content box in the middle of its line box.
      const baseline = glyph.top + (glyph.height - (ascent + descent)) / 2 + ascent
      context.fillText(glyph.text, glyph.left - left, baseline - top)
    }
    return context.getImageData(0, 0, w, h)
  }

  const crisp = draw('none')
  const soft = draw(`blur(${softRadius.toFixed(2)}px)`)
  if (!crisp || !soft) return null

  const image = new ImageData(w, h)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = crisp.data[i + 3]
    image.data[i + 1] = soft.data[i + 3]
    image.data[i + 2] = 0
    image.data[i + 3] = 255
  }

  return {
    image,
    left,
    top,
    width,
    height,
    softRadius,
    drips: findDripOrigins(crisp, glyphs, left, top, scale),
  }
}

/**
 * Per glyph, the runs of ink in the lowest band of its shape become drip
 * roots: one for most letters, two for wide ones. Each gets its own reach
 * and delay so the name does not melt in lockstep.
 */
function findDripOrigins(
  mask: ImageData,
  glyphs: ReadonlyArray<Glyph>,
  left: number,
  top: number,
  scale: number
): DripOrigin[] {
  const { width: w, height: h, data } = mask
  const ink = (x: number, y: number) => data[(y * w + x) * 4 + 3] > 127
  const origins: DripOrigin[] = []

  glyphs.forEach((glyph, index) => {
    const x0 = Math.max(0, Math.floor((glyph.left - left) * scale))
    const x1 = Math.min(w - 1, Math.ceil((glyph.left + glyph.width - left) * scale))
    const y0 = Math.max(0, Math.floor((glyph.top - top) * scale))
    const y1 = Math.min(h - 1, Math.ceil((glyph.top + glyph.height - top) * scale))

    // Lowest ink per column inside this glyph's box.
    const lowest: number[] = []
    for (let x = x0; x <= x1; x++) {
      let found = -1
      for (let y = y1; y >= y0; y--) {
        if (ink(x, y)) {
          found = y
          break
        }
      }
      lowest.push(found)
    }
    const floor = Math.max(...lowest)
    if (floor < 0) return

    // Columns reaching the bottom band, grouped into contiguous runs.
    const band = glyph.height * scale * 0.06
    const runs: Array<{ from: number; to: number }> = []
    lowest.forEach((y, i) => {
      if (y >= floor - band) {
        const last = runs.at(-1)
        if (last && last.to === i - 1) last.to = i
        else runs.push({ from: i, to: i })
      }
    })
    runs.sort((a, b) => b.to - b.from - (a.to - a.from))

    // At most one drip per letter, and some letters none: wax runs where it
    // pools, not in a row.
    const seed = index * 3
    if (hash(seed + 5) < 0.3) return
    const run = runs[Math.floor(hash(seed + 9) * Math.min(runs.length, 2))]
    const column = Math.round((run.from + run.to) / 2)
    const stroke = Math.max(run.to - run.from + 1, glyph.height * scale * 0.05) / scale
    const length = hash(seed)
    origins.push({
      x: left + (x0 + column) / scale,
      y: top + lowest[column] / scale,
      stroke: Math.min(stroke, glyph.height * 0.14) * (0.8 + 0.5 * length),
      // Mostly short runs, a few long ones.
      reach: 0.35 + length * length * 2.9,
      delay: hash(seed + 17) * 0.45,
    })
  })

  return origins
}
