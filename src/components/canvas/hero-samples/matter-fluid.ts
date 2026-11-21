/**
 * A small 2D liquid made of particles that act on each other, and on nothing
 * else: no particle has a place it belongs to.
 *
 * - Crowded particles push apart (pressure), so a body keeps its volume.
 * - Stretched ones hold together (the same pressure, negative), so a drop
 *   stays whole, pulls itself round, necks and breaks, and two drops that
 *   touch run into one.
 * - Each drags on its neighbours (viscosity), so the body moves as one mass.
 *
 * Pressure is double density relaxation (Clavet, Beaudoin, Poulin 2005):
 * move every particle by its velocity, then shift pairs apart or together
 * until the density is right, and read the new velocity off the shift.
 * Neighbours are found on a uniform grid. Lengths are relative to each
 * particle's own rest spacing, so matter can be packed tighter or looser
 * (the story changes the spacing when matter sits inside a drawing).
 *
 * Surface tension is a pull towards where there is more matter nearby: the
 * matter is laid on a coarse grid as "full or not", blurred, and every
 * particle is drawn up the slope of that blur. Inside a body the slope is
 * zero; on its surface it points inwards, harder on a bump than in a hollow,
 * so bumps retract, hollows fill, and two bodies that come near reach for
 * each other.
 */

/** Reach of a particle's influence, in rest spacings. */
const REACH = 2.5
/** Cell of the surface-tension grid, in rest spacings, and how far the blur reaches (cells). */
const COARSE = 1.25
const BLUR = 2
/**
 * Density (the kernel sum over neighbours) of a body at rest whose particles
 * sit one rest spacing apart. `fullness` is measured against it.
 */
const FULL = 2.46

/** The liquid's character. Mutable so the local test rig can sweep it. */
export const LIQUID = {
  /** How hard it resists being squeezed or stretched (1/s²). */
  stiffness: 800,
  /** How hard two particles resist touching (1/s²). */
  near: 800,
  /**
   * The density it wants. Above the density it rests at, so the body is
   * always under tension: that tension is the surface tension.
   */
  rest: 2.3,
  /**
   * How hard two particles resist closing in on each other (1/s). It soaks
   * up squeezing, so a body that is pressed does not ring like a bell.
   */
  bulk: 60,
  /** Surface tension: how hard matter is drawn towards matter nearby (rest spacings/s²). */
  tension: 2000,
  /** Fastest a particle may go, in rest spacings per second. */
  limit: 420,
}

export interface Fluid {
  readonly count: number
  /** xy pairs, px. */
  readonly positions: Float32Array
  readonly velocities: Float32Array
  /** xy pairs, px/s²: what pulls on each particle. Set by the caller. */
  readonly accelerations: Float32Array
  /** Rest spacing of each particle, px. */
  readonly sizes: Float32Array
  /** Drag against the still air or the mould (1/s). */
  readonly drag: Float32Array
  /** How strongly each particle takes on its neighbours' motion (1/s). */
  readonly viscosity: Float32Array
  /** 1 inside a body at rest, about a half on its surface, 0 alone. */
  readonly fullness: Float32Array
  /** How much each particle answers to surface tension (1 liquid, 0 held in a mould). */
  readonly loose: Float32Array
  /**
   * Work out the surface tension for the matter as it lies now, within the
   * given rectangle (px). `spacing` is the liquid's usual rest spacing. Once
   * per frame is enough.
   */
  cohere: (bounds: { x: number; y: number; width: number; height: number }, spacing: number) => void
  /** Advance by dt seconds. */
  step: (dt: number) => void
  /** Pairs in reach of each other in the last step (for measuring). */
  pairs: () => number
}

export function createFluid(count: number): Fluid {
  const positions = new Float32Array(count * 2)
  const previous = new Float32Array(count * 2)
  const velocities = new Float32Array(count * 2)
  const accelerations = new Float32Array(count * 2)
  const sizes = new Float32Array(count).fill(1)
  const drag = new Float32Array(count)
  const viscosity = new Float32Array(count)
  const fullness = new Float32Array(count)
  const loose = new Float32Array(count).fill(1)
  /** The pull of surface tension on each particle, px/s². */
  const tension = new Float32Array(count * 2)

  const density = new Float32Array(count)
  const nearDensity = new Float32Array(count)
  const sharedX = new Float32Array(count)
  const sharedY = new Float32Array(count)
  const sharedWeight = new Float32Array(count)

  // Pairs within reach: who, how close (1 at touching, 0 at the edge of
  // reach), which way, and the reach itself.
  let pairCapacity = count * 16
  let pairA = new Uint16Array(pairCapacity)
  let pairB = new Uint16Array(pairCapacity)
  let pairClose = new Float32Array(pairCapacity)
  let pairX = new Float32Array(pairCapacity)
  let pairY = new Float32Array(pairCapacity)
  let pairReach = new Float32Array(pairCapacity)
  let pairCount = 0

  const growPairs = () => {
    pairCapacity = Math.ceil(pairCapacity * 1.5)
    const grow = <T extends Float32Array | Uint16Array>(from: T): T => {
      const to = new (from.constructor as new (length: number) => T)(pairCapacity)
      to.set(from)
      return to
    }
    pairA = grow(pairA)
    pairB = grow(pairB)
    pairClose = grow(pairClose)
    pairX = grow(pairX)
    pairY = grow(pairY)
    pairReach = grow(pairReach)
  }

  const order = new Uint16Array(count)
  const cellOf = new Int32Array(count)
  let cellStart = new Int32Array(1024)
  /** Most cells along one side; beyond it, far particles share the edge cells. */
  const MOST = 384

  const findPairs = () => {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let largest = 0
    for (let i = 0; i < count; i++) {
      const x = positions[i * 2]!
      const y = positions[i * 2 + 1]!
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (sizes[i]! > largest) largest = sizes[i]!
    }
    const cell = Math.max(REACH * largest, 1e-3)
    const perPx = 1 / cell
    const cols = Math.min(MOST, Math.floor((maxX - minX) * perPx) + 1)
    const rows = Math.min(MOST, Math.floor((maxY - minY) * perPx) + 1)
    const cells = cols * rows
    if (cellStart.length < cells + 1) cellStart = new Int32Array(cells + 1025)
    cellStart.fill(0, 0, cells + 1)

    for (let i = 0; i < count; i++) {
      const cx = Math.min(cols - 1, Math.floor((positions[i * 2]! - minX) * perPx))
      const cy = Math.min(rows - 1, Math.floor((positions[i * 2 + 1]! - minY) * perPx))
      const at = cy * cols + cx
      cellOf[i] = at
      cellStart[at] = cellStart[at]! + 1
    }
    // Counts become ends, then (filling backwards) starts.
    let sum = 0
    for (let at = 0; at < cells; at++) {
      sum += cellStart[at]!
      cellStart[at] = sum
    }
    cellStart[cells] = sum
    for (let i = 0; i < count; i++) {
      const at = cellOf[i]!
      const slot = cellStart[at]! - 1
      cellStart[at] = slot
      order[slot] = i
    }

    pairCount = 0
    const half = REACH * 0.5
    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const at = cy * cols + cx
        const from = cellStart[at]!
        const to = cellStart[at + 1]!
        if (from === to) continue
        for (let a = from; a < to; a++) {
          const i = order[a]!
          const x = positions[i * 2]!
          const y = positions[i * 2 + 1]!
          const size = sizes[i]!
          // The rest of this cell, then the four cells ahead (each pair once).
          for (let ahead = 0; ahead < 5; ahead++) {
            let start = a + 1
            let end = to
            if (ahead > 0) {
              const nx = ahead === 1 ? cx + 1 : cx + ahead - 3
              const ny = ahead === 1 ? cy : cy + 1
              if (nx < 0 || nx >= cols || ny >= rows) continue
              const other = ny * cols + nx
              start = cellStart[other]!
              end = cellStart[other + 1]!
            }
            for (let b = start; b < end; b++) {
              const j = order[b]!
              const dx = positions[j * 2]! - x
              const dy = positions[j * 2 + 1]! - y
              const reach = half * (size + sizes[j]!)
              const squared = dx * dx + dy * dy
              if (squared >= reach * reach) continue
              if (pairCount === pairCapacity) growPairs()
              let distance = Math.sqrt(squared)
              let ux = 0
              let uy = 0
              if (distance > 1e-4) {
                ux = dx / distance
                uy = dy / distance
              } else {
                // On top of each other: part them in a direction of their own.
                const turn = (i * 12.9898 + j * 78.233) % 6.2831853
                ux = Math.cos(turn)
                uy = Math.sin(turn)
                distance = 0
              }
              pairA[pairCount] = i
              pairB[pairCount] = j
              pairClose[pairCount] = 1 - distance / reach
              pairX[pairCount] = ux
              pairY[pairCount] = uy
              pairReach[pairCount] = reach
              pairCount++
            }
          }
        }
      }
    }
  }

  let coarse = new Float32Array(1)
  let scratch = new Float32Array(1)

  const cohere: Fluid['cohere'] = (bounds, spacing) => {
    const cell = COARSE * spacing
    const perCell = 1 / cell
    const cols = Math.max(4, Math.ceil(bounds.width * perCell) + 1)
    const rows = Math.max(4, Math.ceil(bounds.height * perCell) + 1)
    const cells = cols * rows
    if (coarse.length < cells) {
      coarse = new Float32Array(cells)
      scratch = new Float32Array(cells)
    }
    coarse.fill(0, 0, cells)

    // Lay each particle's share of area on the grid.
    for (let i = 0; i < count; i++) {
      const gx = (positions[i * 2]! - bounds.x) * perCell
      const gy = (positions[i * 2 + 1]! - bounds.y) * perCell
      if (gx < 0 || gy < 0 || gx >= cols - 1 || gy >= rows - 1) continue
      const cx = Math.floor(gx)
      const cy = Math.floor(gy)
      const fx = gx - cx
      const fy = gy - cy
      // Matter held in a mould is not something loose liquid clings to.
      const area = (sizes[i]! * perCell) ** 2 * loose[i]!
      const at = cy * cols + cx
      coarse[at] = coarse[at]! + area * (1 - fx) * (1 - fy)
      coarse[at + 1] = coarse[at + 1]! + area * fx * (1 - fy)
      coarse[at + cols] = coarse[at + cols]! + area * (1 - fx) * fy
      coarse[at + cols + 1] = coarse[at + cols + 1]! + area * fx * fy
    }
    // Full is full: crowding inside a body pulls on nothing.
    for (let at = 0; at < cells; at++) if (coarse[at]! > 1) coarse[at] = 1

    // Three box blurs each way: close to a Gaussian.
    const window = 1 / (BLUR * 2 + 1)
    for (let round = 0; round < 3; round++) {
      for (let y = 0; y < rows; y++) {
        const row = y * cols
        let sum = 0
        for (let k = 0; k <= BLUR; k++) sum += coarse[row + Math.min(cols - 1, k)]!
        for (let x = 0; x < cols; x++) {
          scratch[row + x] = sum * window
          const add = x + BLUR + 1
          const drop = x - BLUR
          sum += (add < cols ? coarse[row + add]! : 0) - (drop >= 0 ? coarse[row + drop]! : 0)
        }
      }
      for (let x = 0; x < cols; x++) {
        let sum = 0
        for (let k = 0; k <= BLUR; k++) sum += scratch[Math.min(rows - 1, k) * cols + x]!
        for (let y = 0; y < rows; y++) {
          coarse[y * cols + x] = sum * window
          const add = y + BLUR + 1
          const drop = y - BLUR
          sum +=
            (add < rows ? scratch[add * cols + x]! : 0) -
            (drop >= 0 ? scratch[drop * cols + x]! : 0)
        }
      }
    }

    // Each particle is drawn up the slope.
    const pull = LIQUID.tension * spacing * 0.5
    for (let i = 0; i < count; i++) {
      const gx = (positions[i * 2]! - bounds.x) * perCell
      const gy = (positions[i * 2 + 1]! - bounds.y) * perCell
      if (gx < 1 || gy < 1 || gx >= cols - 2 || gy >= rows - 2 || loose[i]! <= 0) {
        tension[i * 2] = 0
        tension[i * 2 + 1] = 0
        continue
      }
      const cx = Math.floor(gx)
      const cy = Math.floor(gy)
      const fx = gx - cx
      const fy = gy - cy
      const at = cy * cols + cx
      // Slope across the cell the particle is in, blended from its corners.
      const left = coarse[at]! * (1 - fy) + coarse[at + cols]! * fy
      const right = coarse[at + 1]! * (1 - fy) + coarse[at + cols + 1]! * fy
      const top = coarse[at]! * (1 - fx) + coarse[at + 1]! * fx
      const bottom = coarse[at + cols]! * (1 - fx) + coarse[at + cols + 1]! * fx
      const strength = pull * loose[i]! * (BLUR * 2 + 1)
      tension[i * 2] = (right - left) * strength
      tension[i * 2 + 1] = (bottom - top) * strength
    }
  }

  const step = (dt: number) => {
    if (dt <= 0) return
    // What pulls on it, what holds it back, and where that would take it.
    for (let i = 0; i < count; i++) {
      const ix = i * 2
      const iy = ix + 1
      const slow = 1 / (1 + drag[i]! * dt)
      let vx = (velocities[ix]! + (accelerations[ix]! + tension[ix]!) * dt) * slow
      let vy = (velocities[iy]! + (accelerations[iy]! + tension[iy]!) * dt) * slow
      const limit = LIQUID.limit * sizes[i]!
      const speed = vx * vx + vy * vy
      if (speed > limit * limit) {
        const scale = limit / Math.sqrt(speed)
        vx *= scale
        vy *= scale
      }
      previous[ix] = positions[ix]!
      previous[iy] = positions[iy]!
      positions[ix] = positions[ix]! + vx * dt
      positions[iy] = positions[iy]! + vy * dt
    }

    findPairs()

    density.fill(0)
    nearDensity.fill(0)
    for (let pair = 0; pair < pairCount; pair++) {
      const close = pairClose[pair]!
      const a = pairA[pair]!
      const b = pairB[pair]!
      const squared = close * close
      const cubed = squared * close
      density[a] = density[a]! + squared
      density[b] = density[b]! + squared
      nearDensity[a] = nearDensity[a]! + cubed
      nearDensity[b] = nearDensity[b]! + cubed
    }

    // Shift each pair apart (crowded) or together (stretched).
    const { stiffness, near, rest } = LIQUID
    const squaredDt = dt * dt
    for (let pair = 0; pair < pairCount; pair++) {
      const close = pairClose[pair]!
      const a = pairA[pair]!
      const b = pairB[pair]!
      const pressure = stiffness * (density[a]! + density[b]! - 2 * rest)
      const touching = near * (nearDensity[a]! + nearDensity[b]!)
      // Half the pair's mean pressure, shared by the two of them.
      const shift = squaredDt * pairReach[pair]! * (pressure + touching * close) * close * 0.25
      const sx = shift * pairX[pair]!
      const sy = shift * pairY[pair]!
      positions[a * 2] = positions[a * 2]! - sx
      positions[a * 2 + 1] = positions[a * 2 + 1]! - sy
      positions[b * 2] = positions[b * 2]! + sx
      positions[b * 2 + 1] = positions[b * 2 + 1]! + sy
    }

    const perDt = 1 / dt
    for (let i = 0; i < count * 2; i++) {
      const moved = (positions[i]! - previous[i]!) * perDt
      // A broken number must not spread through the body.
      velocities[i] = Number.isFinite(moved) ? moved : 0
      if (!Number.isFinite(positions[i]!)) positions[i] = previous[i]!
    }

    // Particles closing in on each other are braked (never pushed back).
    const brake = LIQUID.bulk * dt
    for (let pair = 0; pair < pairCount; pair++) {
      const a = pairA[pair]!
      const b = pairB[pair]!
      const ux = pairX[pair]!
      const uy = pairY[pair]!
      const closing =
        (velocities[b * 2]! - velocities[a * 2]!) * ux +
        (velocities[b * 2 + 1]! - velocities[a * 2 + 1]!) * uy
      // (Matter that is being led somewhere, by a mould or the pointer, passes through freely.)
      if (closing >= 0 || loose[a]! * loose[b]! <= 0) continue
      const taken = -closing * Math.min(0.5, brake * pairClose[pair]!) * 0.5
      velocities[a * 2] = velocities[a * 2]! - taken * ux
      velocities[a * 2 + 1] = velocities[a * 2 + 1]! - taken * uy
      velocities[b * 2] = velocities[b * 2]! + taken * ux
      velocities[b * 2 + 1] = velocities[b * 2 + 1]! + taken * uy
    }

    // Each takes on a share of its neighbours' motion.
    sharedX.fill(0)
    sharedY.fill(0)
    sharedWeight.fill(0)
    for (let pair = 0; pair < pairCount; pair++) {
      const close = pairClose[pair]!
      const a = pairA[pair]!
      const b = pairB[pair]!
      const dvx = (velocities[b * 2]! - velocities[a * 2]!) * close
      const dvy = (velocities[b * 2 + 1]! - velocities[a * 2 + 1]!) * close
      sharedX[a] = sharedX[a]! + dvx
      sharedY[a] = sharedY[a]! + dvy
      sharedX[b] = sharedX[b]! - dvx
      sharedY[b] = sharedY[b]! - dvy
      sharedWeight[a] = sharedWeight[a]! + close
      sharedWeight[b] = sharedWeight[b]! + close
    }
    for (let i = 0; i < count; i++) {
      const weight = sharedWeight[i]!
      fullness[i] = density[i]! / FULL
      if (weight <= 0) continue
      const share = (1 - Math.exp(-viscosity[i]! * dt * weight)) / weight
      velocities[i * 2] = velocities[i * 2]! + sharedX[i]! * share
      velocities[i * 2 + 1] = velocities[i * 2 + 1]! + sharedY[i]! * share
    }
  }

  return {
    count,
    positions,
    velocities,
    accelerations,
    sizes,
    drag,
    viscosity,
    fullness,
    loose,
    cohere,
    step,
    pairs: () => pairCount,
  }
}
