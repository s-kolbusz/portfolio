/**
 * Measures the hero name for its choreography. The name itself stays real
 * DOM text throughout (coloured and zoomed with CSS), so it is exactly as
 * crisp as the rest of the page at any zoom; this only works out:
 * - when each letter starts to take up the blob's colour (nearest first),
 * - the fly-in target, deep inside the thickest stroke near the centre.
 * For the latter the glyphs are rasterised once with their computed font.
 */

export interface NameMeasure {
  /** Per letter (same order as the elements passed in): soak start 0 first … 1 last. */
  starts: number[]
  /** Inside the thickest stroke near the centre (stage px) and its width: the fly-in target. */
  zoom: { x: number; y: number; stroke: number }
  /** Bounds of the glyphs (stage px). */
  box: { left: number; top: number; width: number; height: number }
}

/** Deterministic 0–1 hash, so the name soaks the same way every visit. */
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

export function measureName(
  chars: ReadonlyArray<HTMLElement>,
  stageTop: number,
  /** Where the blob touches first (stage px): its centre. */
  contact: { x: number; y: number }
): NameMeasure | null {
  const all: Glyph[] = chars.map((char) => {
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
  const glyphs = all.filter((glyph) => glyph.text.trim() !== '' && glyph.width > 0)
  if (glyphs.length === 0) return null

  const left = Math.min(...glyphs.map((g) => g.left))
  const top = Math.min(...glyphs.map((g) => g.top))
  const width = Math.max(...glyphs.map((g) => g.left + g.width)) - left
  const height = Math.max(...glyphs.map((g) => g.top + g.height)) - top

  // A modest raster is enough to find the deepest point of a stroke.
  const scale = Math.min(1, 1200 / width)
  const w = Math.max(1, Math.ceil(width * scale))
  const h = Math.max(1, Math.ceil(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.scale(scale, scale)
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
  const mask = context.getImageData(0, 0, w, h)

  return {
    starts: letterStarts(all, contact),
    zoom: findZoomPoint(mask, left, top, scale),
    box: { left, top, width, height },
  }
}

/**
 * When each letter starts to soak, normalised 0–1: by its distance from
 * where the blob touches the name (the blob reaches along it), with a little
 * variation so neighbours do not move in lockstep. Blank ones get 1.
 */
function letterStarts(glyphs: ReadonlyArray<Glyph>, contact: { x: number; y: number }) {
  const distances = glyphs.map((glyph) =>
    Math.hypot(
      glyph.left + glyph.width / 2 - contact.x,
      (glyph.top + glyph.height / 2 - contact.y) * 1.6
    )
  )
  const real = distances.filter((_, index) => glyphs[index].text.trim() !== '')
  const nearest = Math.min(...real)
  const span = Math.max(1, Math.max(...real) - nearest)
  return distances.map((distance, index) =>
    glyphs[index].text.trim() === ''
      ? 1
      : Math.min(1, ((distance - nearest) / span) * 0.85 + hash(index * 17 + 3) * 0.15)
  )
}

/**
 * The fly-in target: the point deepest inside a stroke (largest inscribed
 * circle, via a chamfer distance transform), with a slight pull towards the
 * middle of the name. Returns it and the stroke's thickness there.
 */
function findZoomPoint(mask: ImageData, left: number, top: number, scale: number) {
  const { width: w, height: h, data } = mask
  const depth = new Float32Array(w * h)
  for (let p = 0; p < w * h; p++) depth[p] = data[p * 4 + 3] > 127 ? 1e6 : 0
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : depth[y * w + x])
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      if (depth[p] === 0) continue
      depth[p] = Math.min(
        depth[p],
        at(x - 1, y) + 1,
        at(x, y - 1) + 1,
        at(x - 1, y - 1) + 1.414,
        at(x + 1, y - 1) + 1.414
      )
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const p = y * w + x
      if (depth[p] === 0) continue
      depth[p] = Math.min(
        depth[p],
        at(x + 1, y) + 1,
        at(x, y + 1) + 1,
        at(x + 1, y + 1) + 1.414,
        at(x - 1, y + 1) + 1.414
      )
    }
  }
  let best = { x: w / 2, y: h / 2, depth: 1, score: -Infinity }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = depth[y * w + x]
      if (d === 0) continue
      const score = d - Math.hypot(x - w / 2, y - h / 2) * 0.02
      if (score > best.score) best = { x, y, depth: d, score }
    }
  }
  return { x: left + best.x / scale, y: top + best.y / scale, stroke: (best.depth * 2) / scale }
}
