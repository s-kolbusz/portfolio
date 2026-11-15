/**
 * The things the matter sets into, drawn as exact parts on one grid
 * (100 × 100 units, 6-unit margins, 4-unit gutters, two corner radii).
 * Each part is a closed solid; details are cut out of it. The drawings are
 * rasterised once: a crisp mask for the set state and, per part, the points
 * its share of the matter settles on.
 */

type Draw = (ctx: CanvasRenderingContext2D) => void

export interface Thing {
  caption: string
  parts: Draw[]
}

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
}

function solid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.globalCompositeOperation = 'source-over'
  box(ctx, x, y, w, h, r)
  ctx.fill()
}

function cut(ctx: CanvasRenderingContext2D, path: () => void) {
  ctx.globalCompositeOperation = 'destination-out'
  path()
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

const site: Thing = {
  caption: 'stronypodhale.pl',
  parts: [
    // Bar: three dots and an address.
    (ctx) => {
      solid(ctx, 6, 8, 88, 10, 5)
      cut(ctx, () => {
        ctx.beginPath()
        for (const x of [12.5, 18, 23.5]) {
          ctx.moveTo(x + 1.5, 13)
          ctx.arc(x, 13, 1.5, 0, Math.PI * 2)
        }
      })
      cut(ctx, () => box(ctx, 62, 11.2, 27, 3.6, 1.8))
    },
    // Picture: the ridge above Kościelisko, the sky cut away.
    (ctx) => {
      solid(ctx, 6, 22, 56, 42, 4)
      cut(ctx, () => {
        ctx.beginPath()
        ctx.moveTo(10, 26)
        ctx.lineTo(58, 26)
        ctx.lineTo(58, 44)
        ctx.lineTo(50, 37)
        ctx.lineTo(44, 43)
        ctx.lineTo(33, 31)
        ctx.lineTo(24, 42)
        ctx.lineTo(19, 38)
        ctx.lineTo(10, 49)
        ctx.closePath()
      })
    },
    // Copy.
    (ctx) => {
      solid(ctx, 66, 22, 28, 42, 4)
      const lengths = [20, 16, 20, 11, 18, 13]
      lengths.forEach((length, row) =>
        cut(ctx, () => box(ctx, 70, 27.4 + row * 5.6, length, 2.4, 1.2))
      )
    },
    // Call to action.
    (ctx) => solid(ctx, 6, 68, 34, 12, 6),
    // Server.
    (ctx) => {
      solid(ctx, 44, 68, 50, 12, 4)
      cut(ctx, () => box(ctx, 48.5, 72.2, 15, 3.6, 1.8))
      cut(ctx, () => box(ctx, 66.5, 72.2, 15, 3.6, 1.8))
      cut(ctx, () => {
        ctx.beginPath()
        ctx.arc(88, 74, 1.6, 0, Math.PI * 2)
      })
    },
    // Footer.
    (ctx) => solid(ctx, 6, 84, 88, 8, 4),
  ],
}

const print: Thing = {
  caption: 'wydruk 3D',
  parts: [
    // Spool.
    (ctx) => {
      ctx.beginPath()
      ctx.arc(20, 22, 13, 0, Math.PI * 2)
      ctx.fill()
      cut(ctx, () => {
        ctx.beginPath()
        ctx.arc(20, 22, 4.6, 0, Math.PI * 2)
      })
    },
    // Head: carriage and nozzle.
    (ctx) => {
      solid(ctx, 40, 8, 34, 12, 4)
      ctx.beginPath()
      ctx.moveTo(50, 22)
      ctx.lineTo(64, 22)
      ctx.lineTo(59, 31)
      ctx.lineTo(55, 31)
      ctx.closePath()
      ctx.fill()
    },
    // The print: a vessel, layer on layer.
    (ctx) => {
      const layers = 13
      for (let layer = 0; layer < layers; layer++) {
        const t = layer / (layers - 1)
        const half = 11 + 13 * Math.sin(Math.PI * (0.18 + t * 0.72)) ** 1.6
        solid(ctx, 57 - half, 35 + layer * 3.6, half * 2, 2.9, 1.45)
      }
    },
    // Bed.
    (ctx) => solid(ctx, 6, 84, 88, 8, 4),
  ],
}

export const THINGS: Thing[] = [site, print]

export interface RasterThing {
  /** White-on-clear drawing, the set state. */
  mask: HTMLCanvasElement
  /** Share of the square the drawing covers, 0–1. */
  coverage: number
  /** Per part: centroid (0–1) and the points (0–1, xy pairs) its matter settles on. */
  parts: Array<{ x: number; y: number; points: Float32Array }>
}

/** Rasterise a thing and lay `count` settling points over it, evenly. */
export function rasterise(thing: Thing, count: number, size = 768): RasterThing {
  const mask = document.createElement('canvas')
  mask.width = size
  mask.height = size
  const maskCtx = mask.getContext('2d')!
  const scratch = document.createElement('canvas')
  scratch.width = size
  scratch.height = size
  const ctx = scratch.getContext('2d', { willReadFrequently: true })!
  const ids = new Uint8Array(size * size)

  thing.parts.forEach((draw, index) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, size, size)
    ctx.scale(size / 100, size / 100)
    ctx.fillStyle = '#fff'
    draw(ctx)
    maskCtx.drawImage(scratch, 0, 0)
    const alpha = ctx.getImageData(0, 0, size, size).data
    for (let pixel = 0; pixel < size * size; pixel++) {
      if (alpha[pixel * 4 + 3]! > 127) ids[pixel] = index + 1
    }
  })

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
  return { mask, coverage, parts }
}
