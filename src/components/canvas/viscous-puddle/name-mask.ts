/**
 * The hero name as a mask for the shader, so it can soak up the blob's colour.
 *
 * Each glyph is drawn with the element's own computed font at its measured
 * position, so the canvas copy lines up with the DOM text it replaces.
 * Channels: R = the glyphs, G = a blurred copy (stroke depth, for shading),
 * B·256 + A = when that letter starts to take up the colour (0 first … 1
 * last). Each letter soaks as a whole, ink turning to green; the ones
 * nearest the blob start first.
 */

export interface NameMask {
  /** RGBA pixels, see above. Upload without premultiplying alpha. */
  image: ImageData
  /** Stage-space box the mask covers, px. */
  left: number
  top: number
  width: number
  height: number
  /** Mask pixels per CSS px. */
  scale: number
  /** Inside the thickest stroke near the centre (stage px) and its width: the fly-in target. */
  zoom: { x: number; y: number; stroke: number }
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

export function renderNameMask(
  chars: ReadonlyArray<HTMLElement>,
  stageTop: number,
  pixelRatio: number,
  /** Where the blob touches first (stage px): its centre. */
  contact: { x: number; y: number }
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
  const softRadius = glyphHeight * 0.05
  const pad = softRadius * 3
  const left = Math.min(...glyphs.map((g) => g.left)) - pad
  const top = Math.min(...glyphs.map((g) => g.top)) - pad
  const right = Math.max(...glyphs.map((g) => g.left + g.width)) + pad
  const bottom = Math.max(...glyphs.map((g) => g.top + g.height)) + pad
  const width = right - left
  const height = bottom - top

  const scale = Math.min(pixelRatio, 1.5)
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

  // Letter boxes touch (advance widths), so only a hair of padding: enough
  // for anti-aliased edges, not enough to tint a neighbour.
  const arrival = letterStarts(glyphs, w, h, left, top, scale, 1.5, contact)

  const image = new ImageData(w, h)
  for (let i = 0, p = 0; i < image.data.length; i += 4, p++) {
    const time = Math.round(arrival[p] * 65535)
    image.data[i] = crisp.data[i + 3]
    image.data[i + 1] = soft.data[i + 3]
    image.data[i + 2] = time >> 8
    image.data[i + 3] = time & 255
  }

  return {
    image,
    left,
    top,
    width,
    height,
    scale,
    zoom: findZoomPoint(crisp, left, top, scale),
  }
}

/**
 * When each letter starts to soak, normalised 0–1: by its distance from
 * where the blob touches the name (the blob reaches along it), with a little
 * variation so neighbours do not move in lockstep. Written over each glyph's
 * box, barely padded so the anti-aliased edges share their letter's time.
 */
function letterStarts(
  glyphs: ReadonlyArray<Glyph>,
  width: number,
  height: number,
  left: number,
  top: number,
  scale: number,
  pad: number,
  contact: { x: number; y: number }
): Float32Array {
  const distances = glyphs.map((glyph) =>
    Math.hypot(
      glyph.left + glyph.width / 2 - contact.x,
      (glyph.top + glyph.height / 2 - contact.y) * 1.6
    )
  )
  const nearest = Math.min(...distances)
  const farthest = Math.max(...distances)
  const span = Math.max(1, farthest - nearest)
  const starts = distances.map((distance, index) =>
    Math.min(1, ((distance - nearest) / span) * 0.85 + hash(index * 17 + 3) * 0.15)
  )

  const field = new Float32Array(width * height).fill(1)
  // Nearer letters last, so where padded boxes overlap the earlier one wins.
  const order = glyphs.map((_, index) => index).sort((a, b) => starts[b] - starts[a])
  for (const index of order) {
    const glyph = glyphs[index]
    const x0 = Math.max(0, Math.floor((glyph.left - pad - left) * scale))
    const x1 = Math.min(width - 1, Math.ceil((glyph.left + glyph.width + pad - left) * scale))
    const y0 = Math.max(0, Math.floor((glyph.top - pad - top) * scale))
    const y1 = Math.min(height - 1, Math.ceil((glyph.top + glyph.height + pad - top) * scale))
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) field[y * width + x] = starts[index]
    }
  }
  return field
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
