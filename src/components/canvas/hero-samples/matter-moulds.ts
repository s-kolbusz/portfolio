/**
 * What gives the liquid a form: a drawing (a thing, or the letters of the
 * name) acts on the matter as two fields, and no particle is ever given a
 * place in it.
 *
 * - The wall: the signed distance to the drawing's edge and which way it
 *   lies. Matter just outside is drawn in; inside, it is left alone and
 *   spreads because it pushes itself apart.
 * - The thirst: the drawing pulls matter towards where it is still empty and
 *   stops pulling where it is full. It is the pull of the missing matter
 *   (capacity minus what is there, never less than nothing), found by
 *   relaxing a potential on a coarse grid a little every frame, so it reaches
 *   far and evens out the fill between the drawing's parts.
 *
 * Coordinates are in widths of the drawing's rectangle: u from 0 to 1 across
 * it, v from 0 to its height divided by its width.
 */

export interface Mould {
  /** Height of the rectangle over its width. */
  readonly aspect: number
  /** Share of the rectangle the drawing covers, 0–1. */
  readonly coverage: number
  /**
   * Read the wall at (u, v): fills `distance` (in widths; negative inside
   * the drawing) and `awayX`, `awayY` (unit vector pointing out of it).
   */
  wall: (u: number, v: number) => void
  distance: number
  awayX: number
  awayY: number
  /** Start counting the matter for this frame. */
  count: () => void
  /** One particle at (u, v) holding `share` of the drawing's capacity. */
  add: (u: number, v: number, share: number) => void
  /** Relax the thirst towards what was counted. */
  settle: (rounds: number) => void
  /**
   * Read the thirst at (u, v): fills `pull` (0 nothing missing, 1 the whole
   * drawing empty one width away), `towardsX`, `towardsY` (unit vector) and
   * `fill` (how full the drawing is right here; 1 is full).
   */
  thirst: (u: number, v: number) => void
  pull: number
  towardsX: number
  towardsY: number
  fill: number
  /** Share of the drawing's capacity that has matter on it, 0–1. */
  filled: () => number
  /** A random point inside the drawing, as [u, v]. */
  pointInside: () => [number, number]
}

/** Squared distance to the nearest zero of f along one line (Felzenszwalb, Huttenlocher). */
function nearest(
  f: Float32Array,
  d: Float32Array,
  length: number,
  hull: Int32Array,
  bounds: Float32Array
) {
  let k = 0
  hull[0] = 0
  bounds[0] = -Infinity
  bounds[1] = Infinity
  for (let q = 1; q < length; q++) {
    let s = 0
    for (;;) {
      const p = hull[k]!
      s = (f[q]! + q * q - (f[p]! + p * p)) / (2 * q - 2 * p)
      if (s > bounds[k]!) break
      k--
    }
    k++
    hull[k] = q
    bounds[k] = s
    bounds[k + 1] = Infinity
  }
  k = 0
  for (let q = 0; q < length; q++) {
    while (bounds[k + 1]! < q) k++
    const p = hull[k]!
    d[q] = (q - p) * (q - p) + f[p]!
  }
}

/** Distance (in cells) from every cell to the nearest cell where `inside` is set. */
function distances(inside: Uint8Array, cols: number, rows: number) {
  const FAR = 1e12
  const field = new Float32Array(cols * rows)
  const longest = Math.max(cols, rows)
  const f = new Float32Array(longest)
  const d = new Float32Array(longest)
  const hull = new Int32Array(longest)
  const bounds = new Float32Array(longest + 1)
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) f[y] = inside[y * cols + x] ? 0 : FAR
    nearest(f, d, rows, hull, bounds)
    for (let y = 0; y < rows; y++) field[y * cols + x] = d[y]!
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) f[x] = field[y * cols + x]!
    nearest(f, d, cols, hull, bounds)
    for (let x = 0; x < cols; x++) field[y * cols + x] = Math.sqrt(d[x]!)
  }
  return field
}

export function createMould(
  mask: { data: Uint8Array; width: number; height: number },
  options: {
    /** Cells of the wall's grid across the rectangle's width. */
    detail: number
    /** Cells of the thirst's grid across the rectangle's width. */
    coarse: number
    /**
     * How far the thirst reaches, in widths. Without it the whole drawing
     * pulls from any distance (and from afar towards its middle); with it,
     * each empty part pulls only on what is near it.
     */
    reach?: number
  }
): Mould {
  const aspect = mask.height / mask.width
  const cols = Math.max(8, Math.min(options.detail, mask.width))
  const rows = Math.max(8, Math.round(cols * aspect))

  // The drawing at the wall's resolution: a cell is inside if enough of it is covered.
  const sums = new Float32Array(cols * rows)
  const hits = new Uint16Array(cols * rows)
  for (let y = 0; y < mask.height; y++) {
    const cy = Math.min(rows - 1, Math.floor((y / mask.height) * rows))
    for (let x = 0; x < mask.width; x++) {
      const cx = Math.min(cols - 1, Math.floor((x / mask.width) * cols))
      sums[cy * cols + cx] = sums[cy * cols + cx]! + mask.data[(y * mask.width + x) * 4 + 3]!
      hits[cy * cols + cx] = hits[cy * cols + cx]! + 1
    }
  }
  const inside = new Uint8Array(cols * rows)
  const outside = new Uint8Array(cols * rows)
  const insideCells: number[] = []
  for (let at = 0; at < inside.length; at++) {
    const covered = sums[at]! / (255 * Math.max(1, hits[at]!))
    inside[at] = covered > 0.4 ? 1 : 0
    outside[at] = inside[at] ? 0 : 1
    if (inside[at]) insideCells.push(at)
  }
  const coverage = insideCells.length / inside.length
  const toInside = distances(inside, cols, rows)
  const toOutside = distances(outside, cols, rows)
  // Signed, in widths, zero on the edge between an inside and an outside cell.
  const signed = new Float32Array(cols * rows)
  for (let at = 0; at < signed.length; at++) {
    signed[at] = (inside[at] ? 0.5 - toOutside[at]! : toInside[at]! - 0.5) / cols
  }

  // The thirst's grid reaches beyond the rectangle (as far as the thirst itself
  // does), so matter on its way is drawn too.
  const margin = options.reach ? options.reach * 2.5 : 0.7 * Math.max(1, aspect)
  const cell = 1 / options.coarse
  const perCell = options.coarse
  const wide = Math.ceil((1 + margin * 2) * perCell) + 2
  const tall = Math.ceil((aspect + margin * 2) * perCell) + 2
  const capacity = new Float32Array(wide * tall)
  const held = new Float32Array(wide * tall)
  const potential = new Float32Array(wide * tall)
  const share = 1 / (4 + (options.reach ? (cell / options.reach) ** 2 : 0))

  const lay = (grid: Float32Array, u: number, v: number, share: number) => {
    const gx = (u + margin) * perCell
    const gy = (v + margin) * perCell
    if (gx < 0 || gy < 0 || gx >= wide - 1 || gy >= tall - 1) return
    const cx = Math.floor(gx)
    const cy = Math.floor(gy)
    const fx = gx - cx
    const fy = gy - cy
    const at = cy * wide + cx
    grid[at] = grid[at]! + share * (1 - fx) * (1 - fy)
    grid[at + 1] = grid[at + 1]! + share * fx * (1 - fy)
    grid[at + wide] = grid[at + wide]! + share * (1 - fx) * fy
    grid[at + wide + 1] = grid[at + wide + 1]! + share * fx * fy
  }
  for (const at of insideCells) {
    const u = ((at % cols) + 0.5) / cols
    const v = (Math.floor(at / cols) + 0.5) / cols
    lay(capacity, u, v, 1 / insideCells.length)
  }
  let capacitySum = 0
  for (let at = 0; at < capacity.length; at++) capacitySum += capacity[at]!

  const mould: Mould = {
    aspect,
    coverage,
    distance: 0,
    awayX: 0,
    awayY: 0,
    pull: 0,
    towardsX: 0,
    towardsY: 0,
    fill: 0,
    wall(u, v) {
      // Beyond the rectangle the nearest edge is read at the rim, plus the way there.
      const cu = Math.min(1, Math.max(0, u))
      const cv = Math.min(aspect, Math.max(0, v))
      const gx = Math.min(cols - 1.001, Math.max(0, cu * cols - 0.5))
      const gy = Math.min(rows - 1.001, Math.max(0, cv * cols - 0.5))
      const cx = Math.floor(gx)
      const cy = Math.floor(gy)
      const fx = gx - cx
      const fy = gy - cy
      const at = cy * cols + cx
      const a = signed[at]!
      const b = signed[at + 1]!
      const c = signed[at + cols]!
      const d = signed[at + cols + 1]!
      let distance = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
      let awayX = (b - a) * (1 - fy) + (d - c) * fy
      let awayY = (c - a) * (1 - fx) + (d - b) * fx
      const overX = u - cu
      const overY = v - cv
      if (overX !== 0 || overY !== 0) {
        const over = Math.hypot(overX, overY)
        const steep = Math.hypot(awayX, awayY) || 1
        distance = Math.max(distance, 0) + over
        awayX = awayX / steep + (overX / over) * 2
        awayY = awayY / steep + (overY / over) * 2
      }
      const length = Math.hypot(awayX, awayY)
      mould.distance = distance
      mould.awayX = length > 1e-6 ? awayX / length : 0
      mould.awayY = length > 1e-6 ? awayY / length : 0
    },
    count() {
      held.fill(0)
    },
    add(u, v, share) {
      lay(held, u, v, share)
    },
    settle(rounds) {
      // Successive over-relaxation, carried on from the last frame.
      for (let round = 0; round < rounds; round++) {
        for (let y = 1; y < tall - 1; y++) {
          const row = y * wide
          for (let x = 1; x < wide - 1; x++) {
            const at = row + x
            // Only what is missing pulls; a part that is over-full pushes nothing away.
            const missing = capacity[at]! - held[at]!
            const target =
              (potential[at - 1]! +
                potential[at + 1]! +
                potential[at - wide]! +
                potential[at + wide]! +
                (missing > 0 ? missing : 0)) *
              share
            potential[at] = potential[at]! + (target - potential[at]!) * 1.7
          }
        }
      }
    },
    thirst(u, v) {
      const gx = Math.min(wide - 2.001, Math.max(1, (u + margin) * perCell))
      const gy = Math.min(tall - 2.001, Math.max(1, (v + margin) * perCell))
      const cx = Math.floor(gx)
      const cy = Math.floor(gy)
      const fx = gx - cx
      const fy = gy - cy
      const at = cy * wide + cx
      const a = potential[at]!
      const b = potential[at + 1]!
      const c = potential[at + wide]!
      const d = potential[at + wide + 1]!
      const slopeX = (b - a) * (1 - fy) + (d - c) * fy
      const slopeY = (c - a) * (1 - fx) + (d - b) * fx
      const slope = Math.hypot(slopeX, slopeY)
      // The whole drawing empty, one width away, gives a slope of cell / 2π per cell.
      mould.pull = (slope * 6.2831853) / cell
      mould.towardsX = slope > 1e-12 ? slopeX / slope : 0
      mould.towardsY = slope > 1e-12 ? slopeY / slope : 0
      const room =
        (capacity[at]! * (1 - fx) + capacity[at + 1]! * fx) * (1 - fy) +
        (capacity[at + wide]! * (1 - fx) + capacity[at + wide + 1]! * fx) * fy
      const there =
        (held[at]! * (1 - fx) + held[at + 1]! * fx) * (1 - fy) +
        (held[at + wide]! * (1 - fx) + held[at + wide + 1]! * fx) * fy
      mould.fill = there / Math.max(room, 0.15 / (wide * tall))
    },
    filled() {
      let covered = 0
      for (let at = 0; at < capacity.length; at++) covered += Math.min(capacity[at]!, held[at]!)
      return covered / Math.max(capacitySum, 1e-9)
    },
    pointInside() {
      const at = insideCells[Math.floor(Math.random() * insideCells.length)] ?? 0
      return [((at % cols) + 0.5) / cols, (Math.floor(at / cols) + 0.5) / cols]
    },
  }
  return mould
}
