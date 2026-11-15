import type { RasterThing } from './things'

/**
 * The matter as a few thousand small drops with mass: every drop is pulled
 * towards where it belongs right now (in the blob, in a travelling drop, on
 * its spot in a drawing) by a damped spring, and stirred while it is liquid.
 * Nothing is interpolated between poses, so nothing jumps: a change of plan
 * only changes where drops are pulled, and they get there with their own
 * weight, late ones trailing behind.
 *
 * All chaos lives here. The drawings the drops settle into are exact.
 */

export interface StoryLayout {
  width: number
  height: number
  /** The square a thing is drawn in. */
  stage: { x: number; y: number; size: number }
}

export interface StoryFrame {
  positions: Float32Array
  states: Float32Array
  count: number
  /** Which thing is forming or set, and how much of it has set (0–1). */
  thing: number
  formed: number
  /** Whether the sheet that covered the frame on load has drained. */
  born: boolean
  /** A new thing has just been chosen: its drawing should be loaded. */
  changed: boolean
  /** Where the story is (for the still harness and tests; nothing is animated from it). */
  phase: 'birth' | 'blob' | 'forming' | 'hold' | 'melting'
}

type Mode = 'blob' | 'drop' | 'fill' | 'melt'

interface Group {
  mode: Mode
  start: number
  count: number
  /** Centre of the travelling drop, with its own inertia. */
  x: number
  y: number
  vx: number
  vy: number
  /** Where the drop is heading. */
  toX: number
  toY: number
  /** Its part's place in the drawing (0–1 of the stage). */
  homeX: number
  homeY: number
  clock: number
  /** When it leaves the blob / lets go of its shape (story time). */
  at: number
  radius: number
}

const GOLDEN = 2.39996323

/** How much wider than its share a liquid drop's spot is drawn. */
const WIDE = 1.45

/** How many drops the matter is scattered into on load. */
const BIRTH_DROPS = 13

const random = (from: number, to: number) => from + Math.random() * (to - from)

export function createStory(options: {
  count: number
  ballCount: number
  things: RasterThing[]
  layout: StoryLayout
}) {
  const { count, ballCount, things } = options
  let layout = options.layout
  const total = count + ballCount

  const positions = new Float32Array(total * 2)
  const velocities = new Float32Array(total * 2)
  /** Per drop: spot size (px), settled (0–1), weight. */
  const states = new Float32Array(total * 3)
  /** Place in the blob (unit disc) and in its travelling drop (unit disc). */
  const inBlob = new Float32Array(total * 2)
  const inDrop = new Float32Array(total * 2)
  /** Spot in the drawing (0–1 of the stage). */
  const spots = new Float32Array(total * 2)
  const groupOf = new Int16Array(total)
  const delays = new Float32Array(total)
  const seeds = new Float32Array(total)

  // Spacing of drops in each state; the spot each one draws follows it, so
  // the matter keeps the same density whether spread wide or packed tight.
  const spacing = { sheet: 1, blob: 1, drop: 1, fill: 1 }
  let blobRadius = 1

  const measure = () => {
    const { width, height, stage } = layout
    spacing.sheet = Math.sqrt((width * height) / count)
    blobRadius = stage.size * 0.43
    spacing.blob = blobRadius * Math.sqrt(Math.PI / count)
    spacing.drop = spacing.blob * 0.86
  }
  measure()

  const blob = {
    x: layout.stage.x + layout.stage.size / 2,
    y: layout.stage.y + layout.stage.size / 2,
  }
  const ball: Group = {
    mode: 'drop',
    start: count,
    count: ballCount,
    x: blob.x,
    y: blob.y,
    vx: 0,
    vy: 0,
    toX: blob.x,
    toY: blob.y,
    homeX: 0.5,
    homeY: 0.5,
    clock: 0,
    at: 0,
    radius: 1,
  }

  // On load the matter is scattered over the frame as drops of different
  // sizes. They set off one after another and condense into the blob.
  let groups: Group[] = []
  {
    const { width, height } = layout
    const shares = Array.from({ length: BIRTH_DROPS }, () => 0.25 + Math.random() ** 2 * 2.4)
    const whole = shares.reduce((sum, share) => sum + share, 0)
    const centres: Array<{ x: number; y: number; r: number }> = []
    let cursor = 0
    shares.forEach((share, index) => {
      const size =
        index === BIRTH_DROPS - 1
          ? count - cursor
          : Math.max(8, Math.round((share / whole) * count))
      const radius = spacing.drop * Math.sqrt(size / Math.PI)
      let x = 0
      let y = 0
      for (let attempt = 0; attempt < 40; attempt++) {
        x = random(0.04, 0.96) * width
        y = random(0.04, 0.96) * height
        const clear =
          Math.hypot(x - blob.x, y - blob.y) > Math.min(width, height) * 0.32 &&
          centres.every((other) => Math.hypot(x - other.x, y - other.y) > (radius + other.r) * 1.25)
        if (clear) break
      }
      centres.push({ x, y, r: radius })
      groups.push({
        mode: 'melt',
        start: cursor,
        count: size,
        x,
        y,
        vx: 0,
        vy: 0,
        toX: blob.x,
        toY: blob.y,
        homeX: 0.5,
        homeY: 0.5,
        // Negative: it waits its turn before it sets off (see `drive`).
        clock: 0.45 - random(0, 0.42),
        at: 0,
        radius,
      })
      for (let j = 0; j < size && cursor + j < count; j++) {
        const i = cursor + j
        groupOf[i] = index
        const r = Math.sqrt((j + 0.5) / size)
        inDrop[i * 2] = r * Math.cos(j * GOLDEN)
        inDrop[i * 2 + 1] = r * Math.sin(j * GOLDEN)
        positions[i * 2] = x + inDrop[i * 2]! * radius
        positions[i * 2 + 1] = y + inDrop[i * 2 + 1]! * radius
        // Never "held on a spot": there is no drawing yet.
        delays[i] = -10
      }
      cursor += size
    })
  }
  for (let i = 0; i < total; i++) {
    seeds[i] = Math.random()
    const radius = Math.sqrt((i + 0.5) / total)
    inBlob[i * 2] = radius * Math.cos(i * GOLDEN)
    inBlob[i * 2 + 1] = radius * Math.sin(i * GOLDEN)
    states[i * 3] = spacing.drop * 1.6 * WIDE
    states[i * 3 + 2] = 1 / (WIDE * WIDE)
    if (i >= count) {
      positions[i * 2] = blob.x
      positions[i * 2 + 1] = blob.y
    }
  }
  for (let j = 0; j < ballCount; j++) {
    const i = count + j
    const radius = Math.sqrt((j + 0.5) / ballCount)
    inDrop[i * 2] = radius * Math.cos(j * GOLDEN)
    inDrop[i * 2 + 1] = radius * Math.sin(j * GOLDEN)
  }

  // The first act is the same as every return to the blob: drops heading home.
  let phase: 'birth' | 'blob' | 'forming' | 'hold' | 'melting' = 'melting'
  let clock = 0
  let nextAt = 0
  // Advanced to the first thing when the scattered drops have gathered.
  let thing = things.length - 1
  let formed = 0
  let changed = false

  /** Hand each part its wedge of the blob, so drops leave towards where they are going. */
  const assign = () => {
    const raster = things[thing]!
    const { stage } = layout
    spacing.fill = stage.size * Math.sqrt(raster.coverage / count)

    const byAngle = Array.from({ length: count }, (_, i) => i).sort((a, b) => {
      const angleA = Math.atan2(positions[a * 2 + 1]! - blob.y, positions[a * 2]! - blob.x)
      const angleB = Math.atan2(positions[b * 2 + 1]! - blob.y, positions[b * 2]! - blob.x)
      return angleA - angleB
    })
    // A part is not carried by one drop: the larger ones arrive as two or
    // three drops of different sizes, each bound for its own stretch of the
    // part. Many unequal drops converging is what makes the thing condense.
    const chunks: Array<{ x: number; y: number; points: Float32Array }> = []
    for (const part of raster.parts) {
      const size = part.points.length / 2
      const pieces = size > count * 0.2 ? 3 : size > count * 0.07 ? 2 : 1
      if (pieces === 1) {
        chunks.push(part)
        continue
      }
      let minX = 1
      let maxX = 0
      let minY = 1
      let maxY = 0
      for (let j = 0; j < size; j++) {
        minX = Math.min(minX, part.points[j * 2]!)
        maxX = Math.max(maxX, part.points[j * 2]!)
        minY = Math.min(minY, part.points[j * 2 + 1]!)
        maxY = Math.max(maxY, part.points[j * 2 + 1]!)
      }
      const axis = maxX - minX > maxY - minY ? 0 : 1
      const sorted = Array.from({ length: size }, (_, j) => j).sort(
        (first, second) => part.points[first * 2 + axis]! - part.points[second * 2 + axis]!
      )
      // Unequal shares.
      const cuts = pieces === 2 ? [random(0.28, 0.72)] : [random(0.18, 0.38), random(0.55, 0.8)]
      let from = 0
      for (let piece = 0; piece < pieces; piece++) {
        const to = piece === pieces - 1 ? size : Math.round(size * cuts[piece]!)
        const points = new Float32Array((to - from) * 2)
        let sumX = 0
        let sumY = 0
        for (let j = from; j < to; j++) {
          const source = sorted[j]!
          points[(j - from) * 2] = part.points[source * 2]!
          points[(j - from) * 2 + 1] = part.points[source * 2 + 1]!
          sumX += part.points[source * 2]!
          sumY += part.points[source * 2 + 1]!
        }
        chunks.push({ x: sumX / (to - from), y: sumY / (to - from), points })
        from = to
      }
    }
    const parts = chunks
      .map((part, index) => ({ part, index, angle: Math.atan2(part.y - 0.5, part.x - 0.5) }))
      .sort((a, b) => a.angle - b.angle)

    groups = []
    let cursor = 0
    const order = parts.map((_, place) => place).sort(() => Math.random() - 0.5)
    let at = clock + random(0.15, 0.4)
    const leaveAt: number[] = []
    for (const place of order) {
      leaveAt[place] = at
      // Uneven on purpose: some leave together, some after a pause.
      at += Math.random() < 0.4 ? random(0.04, 0.12) : random(0.2, 0.42)
    }
    parts.forEach(({ part }, place) => {
      const size = part.points.length / 2
      const group: Group = {
        mode: 'blob',
        start: cursor,
        count: size,
        x: blob.x,
        y: blob.y,
        vx: 0,
        vy: 0,
        toX: stage.x + part.x * stage.size,
        toY: stage.y + part.y * stage.size,
        homeX: part.x,
        homeY: part.y,
        clock: 0,
        at: leaveAt[place]!,
        radius: spacing.drop * Math.sqrt(size / Math.PI),
      }
      for (let j = 0; j < size; j++) {
        const i = byAngle[(cursor + j) % count]!
        groupOf[i] = groups.length
        spots[i * 2] = part.points[j * 2]!
        spots[i * 2 + 1] = part.points[j * 2 + 1]!
        // Shuffled within the drop, so the pour has no visible order.
        const radius = Math.sqrt((j + 0.5) / size)
        inDrop[i * 2] = radius * Math.cos(j * GOLDEN)
        inDrop[i * 2 + 1] = radius * Math.sin(j * GOLDEN)
      }
      cursor += size
      groups.push(group)
    })
    changed = true
  }

  const centreOf = (group: Group) => {
    let x = 0
    let y = 0
    let n = 0
    for (let i = 0; i < count; i++) {
      if (groups[groupOf[i]!] !== group) continue
      x += positions[i * 2]!
      y += positions[i * 2 + 1]!
      n++
    }
    return n ? { x: x / n, y: y / n } : { x: blob.x, y: blob.y }
  }

  const step = (
    delta: number,
    pointer: { x: number; y: number; active: boolean },
    tapped: boolean
  ): StoryFrame => {
    const dt = Math.min(delta, 1 / 30)
    clock += dt
    const { stage } = layout
    const stageX = stage.x + stage.size / 2
    const stageY = stage.y + stage.size / 2
    const born = clock > 1

    // The blob is never still: it drifts about the middle of the stage.
    const settledBlob = phase === 'forming' || phase === 'hold' ? 0.25 : 1
    const driftX =
      (Math.sin(clock * 0.23) * 0.09 + Math.sin(clock * 0.41 + 2.1) * 0.05) *
      stage.size *
      settledBlob
    const driftY =
      (Math.cos(clock * 0.19 + 0.7) * 0.07 + Math.sin(clock * 0.37 + 4) * 0.04) *
      stage.size *
      settledBlob
    blob.x += (stageX + driftX - blob.x) * (1 - Math.exp(-dt / 0.9))
    blob.y += (stageY + driftY - blob.y) * (1 - Math.exp(-dt / 0.9))

    // --- What happens next (only decides where matter is pulled) ---
    if (phase === 'blob' && (clock >= nextAt || tapped)) {
      assign()
      phase = 'forming'
    }
    if (phase === 'forming') {
      let settled = 0
      for (const group of groups) {
        group.clock += dt
        if (group.mode === 'blob' && clock >= group.at) {
          const centre = centreOf(group)
          group.mode = 'drop'
          group.x = centre.x
          group.y = centre.y
          // It keeps a little of the blob's outward push.
          group.vx = (centre.x - blob.x) * 1.4
          group.vy = (centre.y - blob.y) * 1.4
          group.clock = 0
        } else if (group.mode === 'drop') {
          group.toX = stage.x + group.homeX * stage.size
          group.toY = stage.y + group.homeY * stage.size
          const distance = Math.hypot(group.toX - group.x, group.toY - group.y)
          const speed = Math.hypot(group.vx, group.vy)
          if ((distance < stage.size * 0.05 && speed < stage.size * 0.5) || group.clock > 1.7) {
            group.mode = 'fill'
            group.clock = 0
            // It pours from where the drop is, the nearest spots first.
            const pour = stage.size * random(0.5, 0.72)
            for (let i = 0; i < count; i++) {
              if (groups[groupOf[i]!] !== group) continue
              const sx = stage.x + spots[i * 2]! * stage.size
              const sy = stage.y + spots[i * 2 + 1]! * stage.size
              delays[i] = Math.hypot(sx - group.x, sy - group.y) / pour + seeds[i]! * 0.08
            }
          }
        }
      }
      for (let i = 0; i < count; i++) settled += states[i * 3 + 1]!
      formed = settled / count
      if (formed > 0.985 && groups.every((group) => group.mode === 'fill')) {
        phase = 'hold'
        nextAt = clock + random(2.2, 2.9)
      }
    }
    if (phase === 'hold' && (clock >= nextAt || tapped)) {
      phase = 'melting'
      const order = groups.map((_, place) => place).sort(() => Math.random() - 0.5)
      let at = clock
      for (const place of order) {
        const group = groups[place]!
        group.at = at
        at += Math.random() < 0.35 ? random(0.04, 0.1) : random(0.2, 0.42)
      }
    }
    if (phase === 'melting') {
      let settled = 0
      for (let i = 0; i < count; i++) settled += states[i * 3 + 1]!
      formed = settled / count
      for (const group of groups) {
        group.clock += dt
        if (group.mode === 'fill' && clock >= group.at) {
          const centre = centreOf(group)
          group.mode = 'melt'
          group.x = centre.x
          group.y = centre.y
          group.vx = 0
          group.vy = 0
          group.clock = 0
          let reach = 1
          for (let i = 0; i < count; i++) {
            if (groups[groupOf[i]!] !== group) continue
            reach = Math.max(
              reach,
              Math.hypot(positions[i * 2]! - centre.x, positions[i * 2 + 1]! - centre.y)
            )
          }
          // The edges let go first.
          for (let i = 0; i < count; i++) {
            if (groups[groupOf[i]!] !== group) continue
            const edge =
              Math.hypot(positions[i * 2]! - centre.x, positions[i * 2 + 1]! - centre.y) / reach
            delays[i] = (1 - edge) * 0.32 + seeds[i]! * 0.06
          }
        } else if (group.mode === 'melt') {
          // Once it has gathered into a drop it heads home.
          group.toX = blob.x
          group.toY = blob.y
          if (
            group.clock > 0.75 &&
            Math.hypot(blob.x - group.x, blob.y - group.y) < blobRadius * 0.55
          ) {
            group.mode = 'blob'
          }
        }
      }
      if (groups.every((group) => group.mode === 'blob')) {
        phase = 'blob'
        thing = (thing + 1) % things.length
        nextAt = clock + random(0.7, 1.3)
      }
    }

    // --- Travelling drops have their own weight ---
    const drive = (group: Group, stiffness: number, damping: number) => {
      const wobbleX = Math.sin(clock * 1.3 + group.start) * stage.size * 0.6
      const wobbleY = Math.cos(clock * 1.1 + group.start * 0.7) * stage.size * 0.6
      group.vx += ((group.toX - group.x) * stiffness - group.vx * damping + wobbleX) * dt
      group.vy += ((group.toY - group.y) * stiffness - group.vy * damping + wobbleY) * dt
      group.x += group.vx * dt
      group.y += group.vy * dt
    }
    for (const group of groups) {
      if (group.mode === 'drop') drive(group, 15, 5.2)
      else if (group.mode === 'melt' && group.clock > 0.45) drive(group, 9, 4.4)
    }

    // The one drop that stays liquid: it follows the pointer, and without
    // one it rests at the corner of the thing, or in the blob.
    ball.radius = spacing.drop * Math.sqrt(ballCount / Math.PI)
    ball.toX = pointer.active ? pointer.x : blob.x
    ball.toY = pointer.active ? pointer.y : blob.y
    {
      const stiffness = pointer.active ? 60 : 12
      const damping = pointer.active ? 13 : 5
      ball.vx += ((ball.toX - ball.x) * stiffness - ball.vx * damping) * dt
      ball.vy += ((ball.toY - ball.y) * stiffness - ball.vy * damping) * dt
      ball.x += ball.vx * dt
      ball.y += ball.vy * dt
    }

    // --- Every drop ---
    const reach = stage.size * 0.15
    for (let i = 0; i < total; i++) {
      const ix = i * 2
      const iy = ix + 1
      const seed = seeds[i]!
      let x = positions[ix]!
      let y = positions[iy]!
      let targetX = x
      let targetY = y
      let stiffness = 0
      let ratio = 0.6
      let size = spacing.drop
      let liquid = 1
      let settling = false

      const isBall = i >= count
      const group = isBall ? ball : groups[groupOf[i]!]
      const mode: Mode = isBall ? 'drop' : group ? group.mode : 'blob'

      if (mode === 'blob') {
        // A lobed, slowly turning body: the edge is never a circle.
        const bx = inBlob[ix]!
        const by = inBlob[iy]!
        const radius = Math.hypot(bx, by)
        // It turns as one body (shearing it would comb the drops into streaks).
        const angle = Math.atan2(by, bx) + clock * 0.11
        const lobes =
          1 +
          0.13 * Math.sin(angle * 3 + clock * 0.62) +
          0.08 * Math.sin(angle * 5 - clock * 0.83 + 1.3) +
          0.05 * Math.sin(angle * 2 + clock * 0.31 + 4)
        const r = radius * blobRadius * lobes
        targetX = blob.x + Math.cos(angle) * r
        targetY = blob.y + Math.sin(angle) * r
        stiffness = 26 * (0.75 + 0.5 * seed)
        ratio = 0.7
        size = spacing.blob
      } else if (mode === 'drop' || mode === 'fill' || mode === 'melt') {
        const g = group!
        const poured = mode === 'fill' && g.clock >= delays[i]!
        const held = mode === 'melt' && g.clock < delays[i]!
        if (poured || held) {
          targetX = stage.x + spots[ix]! * stage.size
          targetY = stage.y + spots[iy]! * stage.size
          stiffness = 46 * (0.75 + 0.5 * seed)
          ratio = 0.9
          size = spacing.fill
          liquid = 0.15
          settling = poured
        } else {
          // Packed into its drop, which stretches along the way it moves.
          const speed = Math.hypot(g.vx, g.vy)
          const stretch = Math.min(0.55, speed / (stage.size * 2.2))
          const dirX = speed > 1 ? g.vx / speed : 1
          const dirY = speed > 1 ? g.vy / speed : 0
          const ox = inDrop[ix]! * g.radius
          const oy = inDrop[iy]! * g.radius
          const along = ox * dirX + oy * dirY
          targetX = g.x + ox + dirX * along * stretch - dirX * g.radius * stretch * 0.6
          targetY = g.y + oy + dirY * along * stretch - dirY * g.radius * stretch * 0.6
          stiffness = (isBall ? 80 : 56) * (0.75 + 0.5 * seed)
          ratio = isBall ? 0.78 : 0.74
          size = spacing.drop
        }
      }

      // Settled or not: it sets once it has come to rest on its spot.
      let settledNow = states[i * 3 + 1]!
      if (settling) {
        const off = Math.hypot(targetX - x, targetY - y)
        const speed = Math.hypot(velocities[ix]!, velocities[iy]!)
        if (off < spacing.fill * 1.6 && speed < stage.size * 0.22) settledNow += dt / 0.6
        else settledNow -= dt / 0.5
      } else settledNow -= dt / 0.22

      let ax = (targetX - x) * stiffness
      let ay = (targetY - y) * stiffness
      const damping = 2 * Math.sqrt(Math.max(stiffness, 0.01)) * ratio
      ax -= velocities[ix]! * damping
      ay -= velocities[iy]! * damping

      if (stiffness > 0 && liquid > 0) {
        // Liquid is stirred: a slow field of currents, different everywhere.
        // Neighbours share the current, so the body moves as one and does not clump.
        const stir = stage.size * 0.07 * liquid
        ax += Math.sin(y * 0.012 + clock * 0.7) * stir
        ay += Math.cos(x * 0.011 - clock * 0.6) * stir
      }

      // The pointer parts whatever it passes, and wets what has set.
      if (pointer.active && !isBall && stiffness > 0) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const distance = Math.hypot(dx, dy)
        if (distance < reach) {
          const force = (1 - distance / reach) ** 2 * stage.size * 26
          ax += (dx / (distance || 1)) * force
          ay += (dy / (distance || 1)) * force
          settledNow -= dt * 5
        }
      }

      velocities[ix] = velocities[ix]! + ax * dt
      velocities[iy] = velocities[iy]! + ay * dt
      x += velocities[ix]! * dt
      y += velocities[iy]! * dt
      positions[ix] = x
      positions[iy] = y
      // Without a pointer the loose drop is not drawn at all: nothing stray in the frame.
      // Liquid is drawn with wide, light spots (a smooth body); on its way into a
      // drawing the spots tighten, so the fill keeps the drawing's detail.
      const wide = liquid > 0.5 ? WIDE : 1
      const spot = isBall && !pointer.active ? 0 : size * 1.6 * wide
      const ease = 1 - Math.exp(-dt / 0.28)
      states[i * 3] = states[i * 3]! + (spot - states[i * 3]!) * ease
      states[i * 3 + 1] = Math.min(1, Math.max(0, settledNow))
      // Weight follows the spot actually drawn, so the amount of matter stays the same.
      const drawn = Math.max(states[i * 3]! / Math.max(size * 1.6, 1e-3), 0.2)
      states[i * 3 + 2] = isBall && !pointer.active ? 0 : 1 / (drawn * drawn)
    }

    const frame: StoryFrame = {
      positions,
      states,
      count: total,
      thing,
      formed,
      born,
      changed,
      phase,
    }
    changed = false
    return frame
  }

  return {
    step,
    resize(next: StoryLayout) {
      layout = next
      measure()
      for (const group of groups) group.radius = spacing.drop * Math.sqrt(group.count / Math.PI)
      spacing.fill = next.stage.size * Math.sqrt(things[thing]!.coverage / count)
    },
  }
}
