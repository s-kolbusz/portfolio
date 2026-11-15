/**
 * The things the matter sets into, drawn as exact parts on one grid
 * (100 × 100 units, 4-unit gutters, two corner radii, three tones of the
 * one green). Each part is a closed solid: details are either cut out of it
 * or laid on it in a deeper tone. The drawings are rasterised once into a
 * mask for the set state and, per part, the points its share of the matter
 * settles on.
 */

type Context = CanvasRenderingContext2D
type Draw = (ctx: Context) => void

export interface Thing {
  caption: string
  parts: Draw[]
}

/** Tones are stored in the mask's red channel: 255 the matter's green, lower is deeper. */
const BASE = '#ffffff'
const DEEP = '#8a8a8a'
const DEEPEST = '#3c3c3c'

function box(ctx: Context, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

function solid(ctx: Context, x: number, y: number, w: number, h: number, r: number, tone = BASE) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = tone
  box(ctx, x, y, w, h, r)
  ctx.fill()
}

/** A detail in a deeper tone, only where the part already is. */
function on(ctx: Context, tone: string, path: () => void) {
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = tone
  path()
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

function cut(ctx: Context, path: () => void) {
  ctx.globalCompositeOperation = 'destination-out'
  path()
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

function polygon(ctx: Context, points: Array<[number, number]>) {
  ctx.beginPath()
  points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

function disc(ctx: Context, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
}

/**
 * stronypodhale.pl as it is laid out: a bar with the mark, links and a
 * button; the opening panel with its headline and call; the framed page it
 * shows (the Tatra ridge); three offers; the footer.
 */
const site: Thing = {
  caption: 'stronypodhale.pl',
  parts: [
    (ctx) => {
      solid(ctx, 0, 2, 100, 10, 5)
      cut(ctx, () => disc(ctx, 6.5, 7, 2.1))
      for (const x of [44, 55, 66]) cut(ctx, () => box(ctx, x, 5.9, 8, 2.2, 1.1))
      on(ctx, DEEPEST, () => box(ctx, 79, 4.2, 17, 5.6, 2.8))
    },
    // Headline, two lines of copy, the call.
    (ctx) => {
      solid(ctx, 0, 16, 44, 46, 4)
      cut(ctx, () => box(ctx, 5, 22, 32, 5, 1.6))
      cut(ctx, () => box(ctx, 5, 29.5, 24, 5, 1.6))
      cut(ctx, () => box(ctx, 5, 39.5, 30, 1.9, 0.95))
      cut(ctx, () => box(ctx, 5, 43.6, 22, 1.9, 0.95))
      on(ctx, DEEPEST, () => box(ctx, 5, 50.5, 19, 6.4, 3.2))
    },
    // The page it shows: a frame, the sky cut away, two ridges, the sun.
    (ctx) => {
      solid(ctx, 48, 16, 52, 46, 4)
      on(ctx, DEEP, () => box(ctx, 48, 16, 52, 6.5, 0))
      cut(ctx, () => {
        ctx.beginPath()
        for (const x of [52.4, 55.6, 58.8]) {
          ctx.moveTo(x + 0.9, 19.3)
          ctx.arc(x, 19.3, 0.9, 0, Math.PI * 2)
        }
      })
      cut(ctx, () => box(ctx, 51.5, 25.5, 45, 33, 2))
      // Far ridge, then the near one, drawn back into the cut.
      ctx.save()
      box(ctx, 51.5, 25.5, 45, 33, 2)
      ctx.clip()
      ctx.fillStyle = BASE
      polygon(ctx, [
        [51.5, 50],
        [58, 42],
        [62, 45.5],
        [70, 34],
        [75.5, 41],
        [79, 37.5],
        [88, 47],
        [96.5, 41],
        [96.5, 58.5],
        [51.5, 58.5],
      ])
      ctx.fill()
      ctx.fillStyle = DEEP
      polygon(ctx, [
        [51.5, 58.5],
        [51.5, 54],
        [60, 49],
        [67, 53],
        [77, 45.5],
        [86, 53.5],
        [96.5, 49],
        [96.5, 58.5],
      ])
      ctx.fill()
      ctx.fillStyle = BASE
      disc(ctx, 88.5, 31.5, 2.6)
      ctx.fill()
      ctx.restore()
    },
    // Three offers.
    ...[0, 34.67, 69.33].map((x, index): Draw => (ctx) => {
      solid(ctx, x, 66, 30.67, 20, 4)
      on(ctx, index === 1 ? DEEPEST : DEEP, () => disc(ctx, x + 6.2, 72.4, 2.4))
      cut(ctx, () => box(ctx, x + 4, 77.6, 19, 1.9, 0.95))
      cut(ctx, () => box(ctx, x + 4, 81.4, 13, 1.9, 0.95))
    }),
    (ctx) => {
      solid(ctx, 0, 90, 100, 8, 4)
      cut(ctx, () => box(ctx, 5, 93.1, 16, 1.8, 0.9))
      cut(ctx, () => box(ctx, 80, 93.1, 15, 1.8, 0.9))
    },
  ],
}

/** A vessel's half-width at height t (0 top, 1 foot): neck, shoulder, belly, foot. */
function vessel(t: number) {
  const neck = 7.5
  const belly = 21
  const foot = 11
  // A lip that flares a little, then the neck.
  if (t < 0.16) return neck + 1.6 * (1 - t / 0.16) ** 2
  if (t < 0.62) {
    const u = (t - 0.16) / 0.46
    return neck + (belly - neck) * (0.5 - 0.5 * Math.cos(u * Math.PI))
  }
  const u = (t - 0.62) / 0.38
  return belly + (foot - belly) * (0.5 - 0.5 * Math.cos(u * Math.PI)) ** 1.15
}

/**
 * A print in progress: the frame, the spool feeding the head, the head
 * with its nozzle on the top layer, the vessel so far, the bed.
 */
const print: Thing = {
  caption: 'wydruk 3D',
  parts: [
    // Frame: two posts and the beam the head rides.
    (ctx) => {
      solid(ctx, 7, 2, 5.5, 85, 2.75, DEEP)
      solid(ctx, 87.5, 2, 5.5, 85, 2.75, DEEP)
      solid(ctx, 7, 13.2, 86, 5.5, 2.75, DEEP)
    },
    // Spool, with the filament running to the head.
    (ctx) => {
      ctx.fillStyle = BASE
      disc(ctx, 25, 33, 11)
      ctx.fill()
      on(ctx, DEEP, () => disc(ctx, 25, 33, 7.4))
      cut(ctx, () => disc(ctx, 25, 33, 3.2))
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = DEEPEST
      ctx.lineWidth = 1.7
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(32.6, 25)
      ctx.bezierCurveTo(40, 12, 50, 4.5, 60, 9.4)
      ctx.stroke()
    },
    // Head: carriage on the beam, nozzle down to the layer being laid.
    (ctx) => {
      solid(ctx, 49, 9, 22, 14, 3.5)
      cut(ctx, () => box(ctx, 53, 12.2, 6, 1.8, 0.9))
      cut(ctx, () => box(ctx, 61, 12.2, 6, 1.8, 0.9))
      ctx.fillStyle = DEEPEST
      polygon(ctx, [
        [55, 23],
        [65, 23],
        [61.4, 31.2],
        [58.6, 31.2],
      ])
      ctx.fill()
    },
    // The vessel so far: its contour, the layers as lines, the top one half laid.
    (ctx) => {
      const top = 33.5
      const bottom = 86
      ctx.fillStyle = BASE
      ctx.beginPath()
      const steps = 60
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const y = top + t * (bottom - top)
        const x = 60 - vessel(t)
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      for (let i = steps; i >= 0; i--) {
        const t = i / steps
        ctx.lineTo(60 + vessel(t), top + t * (bottom - top))
      }
      ctx.closePath()
      ctx.fill()
      // The layer in progress stops at the nozzle.
      const layers = 12
      const pitch = (bottom - top) / layers
      // The layer in progress stops at the nozzle; the one below is still fresh.
      cut(ctx, () => box(ctx, 60.6, top - 0.2, 14, pitch + 0.2, 0))
      on(ctx, DEEPEST, () => box(ctx, 30, top, 60, pitch, 0))
      for (let layer = 1; layer < layers; layer++) {
        const y = top + layer * pitch
        on(ctx, DEEP, () => box(ctx, 30, y - 0.5, 60, 1, 0))
      }
    },
    (ctx) => {
      solid(ctx, 0, 86, 100, 6, 3)
      on(ctx, DEEPEST, () => box(ctx, 0, 90.2, 100, 1.8, 0))
    },
  ],
}

export const THINGS: Thing[] = [site, print]

export interface RasterThing {
  /**
   * The drawing as texture data (RGBA, size × size): red = tone, green = a
   * softened copy of the outline (the liquid's contour is blended into it
   * as the matter sets), alpha = the exact drawing.
   */
  mask: { data: Uint8Array; size: number }
  /** Share of the square the drawing covers, 0–1. */
  coverage: number
  /** Per part: centroid (0–1) and the points (0–1, xy pairs) its matter settles on. */
  parts: Array<{ x: number; y: number; points: Float32Array }>
}

function soften(alpha: Float32Array, size: number, radius: number) {
  const pass = (source: Float32Array, target: Float32Array, stride: number, other: number) => {
    for (let line = 0; line < size; line++) {
      let sum = 0
      const at = (index: number) =>
        source[line * other + Math.min(size - 1, Math.max(0, index)) * stride]!
      for (let k = -radius; k <= radius; k++) sum += at(k)
      for (let index = 0; index < size; index++) {
        target[line * other + index * stride] = sum / (radius * 2 + 1)
        sum += at(index + radius + 1) - at(index - radius)
      }
    }
  }
  const scratch = new Float32Array(alpha.length)
  // Two box passes each way: close to a Gaussian.
  for (let round = 0; round < 2; round++) {
    pass(alpha, scratch, 1, size)
    pass(scratch, alpha, size, 1)
  }
  return alpha
}

/** Rasterise a thing and lay `count` settling points over it, evenly. */
export function rasterise(thing: Thing, count: number, size = 768): RasterThing {
  const whole = document.createElement('canvas')
  whole.width = size
  whole.height = size
  const wholeCtx = whole.getContext('2d', { willReadFrequently: true })!
  const scratch = document.createElement('canvas')
  scratch.width = size
  scratch.height = size
  const ctx = scratch.getContext('2d', { willReadFrequently: true })!
  const ids = new Uint8Array(size * size)

  thing.parts.forEach((draw, index) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, size, size)
    ctx.scale(size / 100, size / 100)
    draw(ctx)
    wholeCtx.drawImage(scratch, 0, 0)
    const pixels = ctx.getImageData(0, 0, size, size).data
    for (let pixel = 0; pixel < size * size; pixel++) {
      if (pixels[pixel * 4 + 3]! > 127) ids[pixel] = index + 1
    }
  })

  const pixels = wholeCtx.getImageData(0, 0, size, size).data
  const alpha = new Float32Array(size * size)
  for (let pixel = 0; pixel < alpha.length; pixel++) alpha[pixel] = pixels[pixel * 4 + 3]! / 255
  const soft = soften(alpha, size, Math.round(size / 190))
  const data = new Uint8Array(size * size * 4)
  for (let pixel = 0; pixel < size * size; pixel++) {
    data[pixel * 4] = pixels[pixel * 4]!
    data[pixel * 4 + 1] = Math.round(soft[pixel]! * 255)
    data[pixel * 4 + 3] = pixels[pixel * 4 + 3]!
  }

  let covered = 0
  for (let pixel = 0; pixel < ids.length; pixel++) if (ids[pixel]) covered++
  const coverage = covered / ids.length

  // A jittered grid whose pitch gives about `count` points inside the drawing.
  const collect = (pitch: number) => {
    const found: Array<{ x: number; y: number; part: number }> = []
    let row = 0
    for (let y = pitch / 2; y < size; y += pitch * 0.866, row++) {
      for (let x = row % 2 ? pitch : pitch / 2; x < size; x += pitch) {
        const jx = x + (Math.random() - 0.5) * pitch * 0.5
        const jy = y + (Math.random() - 0.5) * pitch * 0.5
        const part =
          ids[
            Math.min(size - 1, Math.max(0, Math.round(jy))) * size +
              Math.min(size - 1, Math.max(0, Math.round(jx)))
          ]
        if (part) found.push({ x: jx / size, y: jy / size, part: part - 1 })
      }
    }
    return found
  }
  let pitch = Math.sqrt((covered * 1.1547) / count)
  let found = collect(pitch)
  for (let attempt = 0; attempt < 6 && Math.abs(found.length - count) > count * 0.02; attempt++) {
    pitch *= Math.sqrt(found.length / count)
    found = collect(pitch)
  }
  while (found.length > count) found.splice(Math.floor(Math.random() * found.length), 1)
  while (found.length < count) found.push({ ...found[Math.floor(Math.random() * found.length)]! })

  const parts = thing.parts.map((_, index) => {
    const own = found.filter((point) => point.part === index)
    const points = new Float32Array(own.length * 2)
    let sumX = 0
    let sumY = 0
    own.forEach((point, at) => {
      points[at * 2] = point.x
      points[at * 2 + 1] = point.y
      sumX += point.x
      sumY += point.y
    })
    return { x: sumX / Math.max(1, own.length), y: sumY / Math.max(1, own.length), points }
  })
  return { mask: { data, size }, coverage, parts }
}
