import type { RasterThing } from './things'

/**
 * The matter as a few thousand small drops with mass. Nothing is moved along
 * a curve: every drop is pulled, and what the eye reads as choreography is
 * weight.
 *
 * - A travelling drop falls towards where it is going (a steady pull, like
 *   gravity or surface tension), so it starts slowly and arrives fast, on an
 *   arc of its own. It is never round: it stretches along its way, wobbles
 *   and bulges at its own pace, and trails the drops that are slow to follow.
 * - The blob is the heavy body. What reaches it is swallowed: it bulges,
 *   recoils and rings for a moment. Nothing flees from it.
 * - A drawing (a thing, or the letters of the name) is exact; drops pour
 *   into it from where they land and it sets wherever they come to rest.
 *
 * All chaos lives here. What the drops settle into is precise.
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface StoryLayout {
  width: number
  height: number
  /** The square a thing is drawn in. */
  stage: { x: number; y: number; size: number }
  /** The rectangle the name's letters are drawn in. */
  name: Rect
}

export interface StoryFrame {
  positions: Float32Array
  states: Float32Array
  count: number
  /** Which thing is forming or set, and how much of the matter has set (0–1). */
  thing: number
  formed: number
  /** Which drawing the matter is setting into right now, and where it sits. */
  drawing: 'name' | 'thing'
  rect: Rect
  /** The drawing has just changed: its mask should be loaded. */
  changed: boolean
  /** The name's letters have set: the real text can take over from the matter. */
  inked: boolean
  /** The heavy body: where it is and how big. */
  blob: { x: number; y: number; radius: number }
  /** Where the story is (for the still harness; nothing is animated from it). */
  phase: 'birth' | 'blob' | 'forming' | 'hold' | 'melting'
}

type Mode = 'blob' | 'fly' | 'fill' | 'bead'

interface Group {
  mode: Mode
  count: number
  /** Centre of the drop, with its own inertia. */
  x: number
  y: number
  vx: number
  vy: number
  /** Where it is heading: a place in a drawing (0–1 of its rectangle), or the blob. */
  homeX: number
  homeY: number
  into: 'name' | 'thing' | 'blob'
  /** The drawing its drops' spots belong to. */
  spotsIn: 'name' | 'thing'
  clock: number
  /** Story time at which it sets off / lets go. */
  at: number
  radius: number
  /** How hard it is pulled (px/s²): small drops fall faster than large ones. */
  pull: number
  /** Which way it circles on the way in. */
  swerve: number
  /** Its own wobble: phase, pace and depth. */
  phase: number
  pace: number
  depth: number
  /** Whether it has come close enough to start braking. */
  near: boolean
}

const GOLDEN = 2.39996323
/** How much wider than its share a liquid drop's spot is drawn. */
const WIDE = 1.45
/** Share of the matter that builds the letters on load. */
const NAME_SHARE = 0.34
/** How many drops gather into the blob on load. */
const BLOB_DROPS = 11

const random = (from: number, to: number) => from + Math.random() * (to - from)
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

/** Cut a part's settling points into unequal pieces along its longer side. */
function pieces(part: { points: Float32Array }, howMany: number) {
  const size = part.points.length / 2
  if (howMany <= 1 || size < howMany * 6) {
    let sumX = 0
    let sumY = 0
    for (let j = 0; j < size; j++) {
      sumX += part.points[j * 2]!
      sumY += part.points[j * 2 + 1]!
    }
    return [{ x: sumX / Math.max(1, size), y: sumY / Math.max(1, size), points: part.points }]
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
  // Unequal shares: cut points jittered around an even split.
  const cuts: number[] = []
  for (let cut = 1; cut < howMany; cut++) {
    cuts.push(clamp01(cut / howMany + random(-0.4, 0.4) / howMany))
  }
  cuts.sort((a, b) => a - b)
  const result: Array<{ x: number; y: number; points: Float32Array }> = []
  let from = 0
  for (let piece = 0; piece < howMany; piece++) {
    const to = piece === howMany - 1 ? size : Math.max(from + 3, Math.round(size * cuts[piece]!))
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
    result.push({ x: sumX / (to - from), y: sumY / (to - from), points })
    from = to
  }
  return result
}

export function createStory(options: {
  count: number
  ballCount: number
  things: RasterThing[]
  /** The name's letters, or null if they could not be drawn. */
  name: RasterThing | null
  layout: StoryLayout
}) {
  const { count, ballCount, things, name } = options
  let layout = options.layout
  const total = count + ballCount

  const positions = new Float32Array(total * 2)
  const velocities = new Float32Array(total * 2)
  /** Per drop: spot size (px), settled (0–1), weight. */
  const states = new Float32Array(total * 3)
  /** Place in the blob (unit disc) and in its travelling drop (unit disc). */
  const inBlob = new Float32Array(total * 2)
  const inDrop = new Float32Array(total * 2)
  /** Spot in its drawing (0–1 of that drawing's rectangle). */
  const spots = new Float32Array(total * 2)
  const groupOf = new Int16Array(total).fill(-1)
  const delays = new Float32Array(total)
  const seeds = new Float32Array(total)

  // Spacing of drops in each state; the spot each one draws follows it, so
  // the matter keeps the same density whether loose or packed tight.
  const spacing = { blob: 1, drop: 1, thing: 1, name: 1 }
  let blobRadius = 1
  const stageRect = (): Rect => ({
    x: layout.stage.x,
    y: layout.stage.y,
    width: layout.stage.size,
    height: layout.stage.size,
  })
  const rectOf = (which: 'name' | 'thing') => (which === 'name' ? layout.name : stageRect())

  const measure = () => {
    const { stage } = layout
    blobRadius = stage.size * 0.43
    spacing.blob = blobRadius * Math.sqrt(Math.PI / count)
    spacing.drop = spacing.blob * 0.86
  }
  measure()

  // The heavy body, with its own inertia.
  const blob = {
    x: layout.stage.x + layout.stage.size / 2,
    y: layout.stage.y + layout.stage.size / 2,
    vx: 0,
    vy: 0,
    /** Its radius follows how much matter it holds. */
    radius: 0,
    /** Rings after it swallows something. */
    ring: 0,
  }
  const ball: Group = {
    mode: 'fly',
    count: ballCount,
    x: blob.x,
    y: blob.y,
    vx: 0,
    vy: 0,
    homeX: 0.5,
    homeY: 0.5,
    into: 'blob',
    spotsIn: 'thing',
    clock: 0,
    at: 0,
    radius: 1,
    pull: 0,
    swerve: 0,
    phase: 0,
    pace: 7,
    depth: 0.1,
    near: false,
  }

  // Places in the blob are dealt at random, so any share of the matter fills
  // the whole body evenly.
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = count - 1; i > 0; i--) {
    const other = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[other]] = [order[other]!, order[i]!]
  }
  for (let i = 0; i < total; i++) {
    seeds[i] = Math.random()
    const place = i < count ? order[i]! : i
    const radius = Math.sqrt((place + 0.5) / total)
    inBlob[i * 2] = radius * Math.cos(place * GOLDEN)
    inBlob[i * 2 + 1] = radius * Math.sin(place * GOLDEN)
    states[i * 3] = spacing.drop * 1.6 * WIDE
    states[i * 3 + 2] = 1 / (WIDE * WIDE)
    positions[i * 2] = blob.x
    positions[i * 2 + 1] = blob.y
  }
  for (let j = 0; j < ballCount; j++) {
    const i = count + j
    const radius = Math.sqrt((j + 0.5) / ballCount)
    inDrop[i * 2] = radius * Math.cos(j * GOLDEN)
    inDrop[i * 2 + 1] = radius * Math.sin(j * GOLDEN)
  }

  let groups: Group[] = []
  let phase: StoryFrame['phase'] = 'birth'
  let clock = 0
  let nextAt = 0
  let thing = 0
  let formed = 0
  let changed = true
  let drawing: StoryFrame['drawing'] = name ? 'name' : 'thing'
  let inked = !name
  /** When the letters finished setting; they let go a moment later. */
  let nameSetAt = -1
  let nameReleased = false

  const newGroup = (
    size: number,
    into: 'name' | 'thing' | 'blob',
    homeX: number,
    homeY: number
  ): Group => {
    // Small drops are quick and nervous, large ones slow and heavy.
    const heft = clamp01(size / (count * 0.16))
    return {
      mode: 'fly',
      count: size,
      x: blob.x,
      y: blob.y,
      vx: 0,
      vy: 0,
      homeX,
      homeY,
      into,
      spotsIn: into === 'name' ? 'name' : 'thing',
      clock: 0,
      at: 0,
      radius: spacing.drop * Math.sqrt(size / Math.PI),
      pull: layout.stage.size * random(5.2, 8.5) * (1.25 - 0.6 * heft),
      swerve: random(0.25, 1) * (Math.random() < 0.5 ? -1 : 1),
      phase: random(0, 6.28),
      pace: random(5.5, 9.5) * (1.3 - 0.6 * heft),
      depth: random(0.1, 0.24),
      near: false,
    }
  }

  const pack = (group: Group, index: number, members: number[]) => {
    members.forEach((i, j) => {
      groupOf[i] = index
      const radius = Math.sqrt((j + 0.5) / members.length)
      inDrop[i * 2] = radius * Math.cos(j * GOLDEN)
      inDrop[i * 2 + 1] = radius * Math.sin(j * GOLDEN)
    })
    group.count = members.length
    group.radius = spacing.drop * Math.sqrt(members.length / Math.PI)
  }

  // --- Load: drops come in from beyond the frame, each at its own pace.
  // Some gather into the blob, some build the letters of the name. ---
  {
    const { width, height } = layout
    const reach = Math.hypot(width, height) / 2
    const nameCount = name ? Math.round(count * NAME_SHARE) : 0
    let cursor = 0
    const launch = (group: Group, towardsX: number, towardsY: number) => {
      // From outside the frame, roughly on its own side of it.
      const side = Math.atan2(towardsY - height / 2, towardsX - width / 2) + random(-1.1, 1.1)
      // Just beyond the edge: the first of them is in the frame within a few frames.
      const distance = reach * random(1.0, 1.28) + group.radius
      group.x = width / 2 + Math.cos(side) * distance
      group.y = height / 2 + Math.sin(side) * distance
      // Already moving, and not straight at its goal.
      const dx = towardsX - group.x
      const dy = towardsY - group.y
      const length = Math.hypot(dx, dy) || 1
      const speed = layout.stage.size * random(1.6, 3.2)
      const sideways = layout.stage.size * random(0.5, 1.5) * group.swerve
      group.vx = (dx / length) * speed + (-dy / length) * sideways
      group.vy = (dy / length) * speed + (dx / length) * sideways
      group.at = random(0, 0.5)
    }

    if (name && nameCount) {
      spacing.name = Math.sqrt((layout.name.width * layout.name.height * name.coverage) / nameCount)
      // Each word arrives as several unequal drops.
      const chunks = name.parts.flatMap((part) => pieces(part, part.points.length > 80 ? 4 : 2))
      for (const chunk of chunks) {
        const size = chunk.points.length / 2
        const group = newGroup(size, 'name', chunk.x, chunk.y)
        const members: number[] = []
        for (let j = 0; j < size && cursor < count; j++, cursor++) {
          members.push(cursor)
          spots[cursor * 2] = chunk.points[j * 2]!
          spots[cursor * 2 + 1] = chunk.points[j * 2 + 1]!
        }
        pack(group, groups.length, members)
        launch(
          group,
          layout.name.x + chunk.x * layout.name.width,
          layout.name.y + chunk.y * layout.name.height
        )
        groups.push(group)
      }
    }
    const rest = count - cursor
    const shares = Array.from({ length: BLOB_DROPS }, () => 0.2 + Math.random() ** 2 * 2.6)
    const whole = shares.reduce((sum, share) => sum + share, 0)
    shares.forEach((share, index) => {
      const size =
        index === BLOB_DROPS - 1 ? count - cursor : Math.max(6, Math.round((share / whole) * rest))
      if (size <= 0 || cursor >= count) return
      const group = newGroup(size, 'blob', 0.5, 0.5)
      const members: number[] = []
      for (let j = 0; j < size && cursor < count; j++, cursor++) members.push(cursor)
      pack(group, groups.length, members)
      launch(group, blob.x, blob.y)
      // The blob's drops trickle in over a longer stretch than the letters'.
      group.at = random(0, 1.2)
      groups.push(group)
    })
    for (let i = 0; i < count; i++) {
      const group = groups[groupOf[i]!]
      if (!group) continue
      positions[i * 2] = group.x + inDrop[i * 2]! * group.radius
      positions[i * 2 + 1] = group.y + inDrop[i * 2 + 1]! * group.radius
      velocities[i * 2] = group.vx
      velocities[i * 2 + 1] = group.vy
    }
  }

  const membersOf = (group: Group) => {
    const index = groups.indexOf(group)
    const members: number[] = []
    for (let i = 0; i < count; i++) if (groupOf[i] === index) members.push(i)
    return members
  }

  const centreOf = (members: number[]) => {
    let x = 0
    let y = 0
    for (const i of members) {
      x += positions[i * 2]!
      y += positions[i * 2 + 1]!
    }
    const n = Math.max(1, members.length)
    return { x: x / n, y: y / n }
  }

  /** The blob swallows a drop: it takes its matter and its momentum. */
  const swallow = (group: Group) => {
    const share = group.count / count
    blob.vx += group.vx * share * 2.2
    blob.vy += group.vy * share * 2.2
    blob.ring = Math.min(1, blob.ring + 0.35 + share * 3)
    group.mode = 'blob'
  }

  /** A drop lands on its place in a drawing and pours out from there. */
  const land = (group: Group) => {
    const rect = rectOf(group.spotsIn)
    group.mode = 'fill'
    group.clock = 0
    const pour = layout.stage.size * random(0.55, 0.85)
    for (const i of membersOf(group)) {
      const sx = rect.x + spots[i * 2]! * rect.width
      const sy = rect.y + spots[i * 2 + 1]! * rect.height
      delays[i] = Math.hypot(sx - group.x, sy - group.y) / pour + seeds[i]! * 0.07
    }
  }

  /** A set piece lets go: its edges first, beading up where it stood, then it falls home. */
  const release = (group: Group) => {
    const members = membersOf(group)
    const centre = centreOf(members)
    group.mode = 'bead'
    group.into = 'blob'
    group.x = centre.x
    group.y = centre.y
    group.vx = 0
    group.vy = 0
    group.clock = 0
    group.at = 0
    group.near = false
    let reach = 1
    for (const i of members) {
      reach = Math.max(
        reach,
        Math.hypot(positions[i * 2]! - centre.x, positions[i * 2 + 1]! - centre.y)
      )
    }
    for (const i of members) {
      const edge =
        Math.hypot(positions[i * 2]! - centre.x, positions[i * 2 + 1]! - centre.y) / reach
      delays[i] = (1 - edge) * 0.34 + seeds[i]! * 0.07
    }
  }

  /** Hand each piece of the next thing its wedge of the blob, so drops leave towards where they are going. */
  const assign = () => {
    const raster = things[thing]!
    spacing.thing = layout.stage.size * Math.sqrt(raster.coverage / count)
    const byAngle = Array.from({ length: count }, (_, i) => i).sort((a, b) => {
      const angleA = Math.atan2(positions[a * 2 + 1]! - blob.y, positions[a * 2]! - blob.x)
      const angleB = Math.atan2(positions[b * 2 + 1]! - blob.y, positions[b * 2]! - blob.x)
      return angleA - angleB
    })
    // The larger parts arrive as two or three drops of different sizes.
    const chunks = raster.parts
      .flatMap((part) => {
        const size = part.points.length / 2
        return pieces(part, size > count * 0.2 ? 3 : size > count * 0.07 ? 2 : 1)
      })
      .map((chunk) => ({ chunk, angle: Math.atan2(chunk.y - 0.5, chunk.x - 0.5) }))
      .sort((a, b) => a.angle - b.angle)

    groups = []
    let cursor = 0
    chunks.forEach(({ chunk }) => {
      const size = chunk.points.length / 2
      const group = newGroup(size, 'thing', chunk.x, chunk.y)
      const members: number[] = []
      for (let j = 0; j < size; j++) {
        const i = byAngle[(cursor + j) % count]!
        members.push(i)
        spots[i * 2] = chunk.points[j * 2]!
        spots[i * 2 + 1] = chunk.points[j * 2 + 1]!
      }
      pack(group, groups.length, members)
      group.mode = 'blob'
      // They leave when they are ready, not in a queue: most within a second, a few late.
      group.at = clock + (Math.random() < 0.75 ? random(0.05, 0.9) : random(0.9, 1.5))
      cursor += size
      groups.push(group)
    })
    drawing = 'thing'
    changed = true
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

    // --- The blob: drifts about the middle, carries momentum, rings when fed ---
    let held = 0
    for (let i = 0; i < count; i++) {
      const group = groups[groupOf[i]!]
      if (!group || group.mode === 'blob') held++
    }
    const calm = phase === 'forming' || phase === 'hold' ? 0.25 : 1
    const driftX =
      (Math.sin(clock * 0.23) * 0.07 + Math.sin(clock * 0.41 + 2.1) * 0.04) * stage.size * calm
    const driftY =
      (Math.cos(clock * 0.19 + 0.7) * 0.06 + Math.sin(clock * 0.37 + 4) * 0.035) * stage.size * calm
    blob.vx += ((stageX + driftX - blob.x) * 22 - blob.vx * 5.5) * dt
    blob.vy += ((stageY + driftY - blob.y) * 22 - blob.vy * 5.5) * dt
    blob.x += blob.vx * dt
    blob.y += blob.vy * dt
    const full = blobRadius * Math.sqrt(Math.max(held, 1) / count)
    blob.radius += (full - blob.radius) * (1 - Math.exp(-dt / 0.22))
    blob.ring = Math.max(0, blob.ring - dt / 1.1)

    // --- What happens next (only decides where matter is pulled) ---
    let settled = 0
    for (let i = 0; i < count; i++) settled += states[i * 3 + 1]!
    formed = settled / count

    for (const group of groups) {
      group.clock += dt
      if (group.mode === 'bead' && group.clock > 0.5) {
        group.mode = 'fly'
        group.clock = 0
      }
    }

    if (phase === 'birth') {
      if (name && nameSetAt < 0) {
        let nameSettled = 0
        let nameTotal = 0
        for (const group of groups) {
          if (group.spotsIn !== 'name' || group.into !== 'name') continue
          for (const i of membersOf(group)) {
            nameSettled += states[i * 3 + 1]!
            nameTotal++
          }
        }
        if (nameTotal && nameSettled / nameTotal > 0.97) nameSetAt = clock
      }
      if (nameSetAt >= 0 && clock > nameSetAt + 0.3) inked = true
      if (nameSetAt >= 0 && !nameReleased && clock > nameSetAt + 0.7) {
        nameReleased = true
        // The letters have dried: their matter beads up and falls into the blob.
        for (const group of groups) {
          if (group.mode === 'fill') group.at = clock + random(0, 0.4)
        }
      }
      if (nameReleased) {
        for (const group of groups) {
          if (group.mode === 'fill' && clock >= group.at) release(group)
        }
      }
      if ((nameReleased || !name) && groups.every((group) => group.mode === 'blob')) {
        phase = 'blob'
        nextAt = clock + random(0.5, 0.9)
      }
    }
    if (phase === 'blob' && (clock >= nextAt || tapped)) {
      assign()
      phase = 'forming'
    }
    if (phase === 'forming') {
      for (const group of groups) {
        if (group.mode === 'blob' && group.into === 'thing' && clock >= group.at) {
          const centre = centreOf(membersOf(group))
          group.mode = 'fly'
          group.x = centre.x
          group.y = centre.y
          // It is pushed out of the body before it starts to fall.
          group.vx = (centre.x - blob.x) * 2.4 + blob.vx
          group.vy = (centre.y - blob.y) * 2.4 + blob.vy
          group.clock = 0
          group.near = false
        }
      }
      if (formed > 0.985 && groups.every((group) => group.mode === 'fill')) {
        phase = 'hold'
        nextAt = clock + random(2.3, 3)
      }
    }
    if (phase === 'hold' && (clock >= nextAt || tapped)) {
      phase = 'melting'
      for (const group of groups) {
        group.at = clock + (Math.random() < 0.7 ? random(0, 0.6) : random(0.6, 1.1))
      }
    }
    if (phase === 'melting') {
      for (const group of groups) {
        if (group.mode === 'fill' && clock >= group.at) release(group)
      }
      if (groups.every((group) => group.mode === 'blob')) {
        phase = 'blob'
        thing = (thing + 1) % things.length
        nextAt = clock + random(0.8, 1.4)
      }
    }

    // --- Travelling drops fall towards where they are going ---
    for (const group of groups) {
      if (group.mode !== 'fly' || clock < group.at) continue
      const rect = rectOf(group.spotsIn)
      const toBlob = group.into === 'blob'
      const toX = toBlob ? blob.x : rect.x + group.homeX * rect.width
      const toY = toBlob ? blob.y : rect.y + group.homeY * rect.height
      const dx = toX - group.x
      const dy = toY - group.y
      const distance = Math.hypot(dx, dy) || 1
      const speed = Math.hypot(group.vx, group.vy)
      const close = toBlob ? Math.max(blob.radius * 0.8, stage.size * 0.1) : stage.size * 0.22
      if (distance < close) group.near = true

      // A steady pull, a little air, and a sideways current of its own.
      const braking = group.near && !toBlob
      const pull = group.pull * (braking ? 1.6 : 1)
      let ax = (dx / distance) * pull
      let ay = (dy / distance) * pull
      const current = Math.sin(clock * 1.7 + group.phase) * stage.size * 0.9 * group.swerve
      ax += (-dy / distance) * current
      ay += (dx / distance) * current
      // Close to a place in a drawing it brakes hard, so it lands instead of circling.
      const drag = braking ? 7.5 : 0.55
      ax -= group.vx * drag
      ay -= group.vy * drag
      group.vx += ax * dt
      group.vy += ay * dt
      group.x += group.vx * dt
      group.y += group.vy * dt

      if (toBlob) {
        if (distance < Math.max(blob.radius * 0.6, stage.size * 0.07) || group.clock > 4)
          swallow(group)
      } else if ((distance < stage.size * 0.06 && speed < stage.size * 1.4) || group.clock > 2.2) {
        land(group)
      }
    }

    // The one loose drop follows the pointer. The blob is the heavier of the
    // two: near it the drop is drawn in, and the blob reaches for it.
    ball.radius = spacing.drop * Math.sqrt(ballCount / Math.PI)
    {
      const toBlob = Math.hypot(pointer.x - blob.x, pointer.y - blob.y)
      const drawn = pointer.active ? smooth(blob.radius * 2.4, blob.radius * 0.9, toBlob) * 0.5 : 1
      const toX = pointer.active ? pointer.x + (blob.x - pointer.x) * drawn : blob.x
      const toY = pointer.active ? pointer.y + (blob.y - pointer.y) * drawn : blob.y
      const stiffness = pointer.active ? 55 : 14
      const damping = pointer.active ? 11 : 6
      ball.vx += ((toX - ball.x) * stiffness - ball.vx * damping) * dt
      ball.vy += ((toY - ball.y) * stiffness - ball.vy * damping) * dt
      ball.x += ball.vx * dt
      ball.y += ball.vy * dt
    }

    // --- Every drop ---
    const reachOut = Math.max(ball.radius * 4.5, stage.size * 0.18)
    for (let i = 0; i < total; i++) {
      const ix = i * 2
      const iy = ix + 1
      const seed = seeds[i]!
      let x = positions[ix]!
      let y = positions[iy]!
      const isBall = i >= count
      const group = isBall ? ball : groups[groupOf[i]!]
      const mode: Mode = isBall ? 'fly' : group ? group.mode : 'blob'

      let targetX = x
      let targetY = y
      let stiffness = 0
      let ratio = 0.7
      let size = spacing.drop
      let liquid = 1
      let settling = false

      if (mode === 'blob') {
        // A lobed body that turns as one and is never a circle.
        const bx = inBlob[ix]!
        const by = inBlob[iy]!
        const radius = Math.hypot(bx, by)
        const angle = Math.atan2(by, bx) + clock * 0.11
        const lobes =
          1 +
          0.13 * Math.sin(angle * 3 + clock * 0.62) +
          0.08 * Math.sin(angle * 5 - clock * 0.83 + 1.3) +
          0.05 * Math.sin(angle * 2 + clock * 0.31 + 4) +
          // Just fed, it rings.
          blob.ring * 0.1 * Math.sin(angle * 4 + clock * 9)
        const r = radius * blob.radius * lobes
        targetX = blob.x + Math.cos(angle) * r
        targetY = blob.y + Math.sin(angle) * r
        stiffness = 26 * (0.75 + 0.5 * seed)
        ratio = 0.7 - 0.3 * blob.ring
        size = spacing.blob
      } else {
        const g = group!
        const rect = rectOf(g.spotsIn)
        const poured = mode === 'fill' && g.clock >= delays[i]!
        const holding = mode === 'bead' && g.clock < delays[i]!
        if (!isBall && (poured || holding)) {
          targetX = rect.x + spots[ix]! * rect.width
          targetY = rect.y + spots[iy]! * rect.height
          stiffness = 46 * (0.75 + 0.5 * seed)
          ratio = 0.9
          size = g.spotsIn === 'name' ? spacing.name : spacing.thing
          liquid = 0.15
          settling = poured
        } else {
          // Packed into its drop. The drop is alive: it stretches along its
          // way, squashes and bulges at its own pace, and no two are alike.
          const speed = Math.hypot(g.vx, g.vy)
          const stretch = Math.min(0.85, speed / (stage.size * 2.6))
          const dirX = speed > 1 ? g.vx / speed : 1
          const dirY = speed > 1 ? g.vy / speed : 0
          let ox = inDrop[ix]! * g.radius
          let oy = inDrop[iy]! * g.radius
          const turn = Math.atan2(oy, ox)
          const bulge =
            1 +
            g.depth * Math.sin(turn * 2 + clock * g.pace + g.phase) +
            g.depth * 0.6 * Math.sin(turn * 3 - clock * g.pace * 0.7 + g.phase * 2)
          ox *= bulge
          oy *= bulge
          const along = ox * dirX + oy * dirY
          const across = -ox * dirY + oy * dirX
          // Longer along its way, thinner across it, heavier at the front.
          const front = along * (1 + stretch * 1.1) - g.radius * stretch * 0.55
          const side = across * (1 - stretch * 0.38)
          targetX = g.x + dirX * front - dirY * side
          targetY = g.y + dirY * front + dirX * side
          // Some drops in it are slow to follow: that is its tail.
          stiffness = (isBall ? 80 : 60) * (0.4 + 1.2 * seed)
          ratio = isBall ? 0.78 : 0.72
          size = spacing.drop
        }
      }

      // It sets once it has come to rest on its spot.
      let settledNow = states[i * 3 + 1]!
      if (settling) {
        const off = Math.hypot(targetX - x, targetY - y)
        const speed = Math.hypot(velocities[ix]!, velocities[iy]!)
        if (off < size * 1.8 && speed < stage.size * 0.22) settledNow += dt / 0.55
        else settledNow -= dt / 0.5
      } else settledNow -= dt / 0.22

      let ax = (targetX - x) * stiffness
      let ay = (targetY - y) * stiffness
      const damping = 2 * Math.sqrt(Math.max(stiffness, 0.01)) * ratio
      ax -= velocities[ix]! * damping
      ay -= velocities[iy]! * damping

      if (liquid > 0.5) {
        // Neighbours share the current, so the body moves as one and does not clump.
        const stir = stage.size * 0.07
        ax += Math.sin(y * 0.012 + clock * 0.7) * stir
        ay += Math.cos(x * 0.011 - clock * 0.6) * stir
      }

      // Liquid matter reaches for the loose drop; set matter near it goes wet again.
      if (pointer.active && !isBall) {
        const dx = ball.x - x
        const dy = ball.y - y
        const distance = Math.hypot(dx, dy)
        if (distance < reachOut) {
          const closeness = (1 - distance / reachOut) ** 2
          if (liquid > 0.5) {
            const force = closeness * stage.size * 9
            ax += (dx / (distance || 1)) * force
            ay += (dy / (distance || 1)) * force
          } else settledNow -= dt * 3 * closeness
        }
      }

      velocities[ix] = velocities[ix]! + ax * dt
      velocities[iy] = velocities[iy]! + ay * dt
      x += velocities[ix]! * dt
      y += velocities[iy]! * dt
      positions[ix] = x
      positions[iy] = y

      // Liquid is drawn with wide, light spots (a smooth body); on its way into a
      // drawing the spots tighten, so the fill keeps the drawing's detail.
      const wide = liquid > 0.5 ? WIDE : 1
      // Without a pointer the loose drop is part of the blob and is not drawn.
      const hidden = isBall && !pointer.active
      const spot = hidden ? 0 : size * 1.6 * wide
      const ease = 1 - Math.exp(-dt / 0.24)
      states[i * 3] = states[i * 3]! + (spot - states[i * 3]!) * ease
      states[i * 3 + 1] = Math.min(1, Math.max(0, settledNow))
      // Weight follows the spot actually drawn, so the amount of matter stays the same.
      const drawn = Math.max(states[i * 3]! / Math.max(size * 1.6, 1e-3), 0.2)
      states[i * 3 + 2] = hidden ? 0 : 1 / (drawn * drawn)
    }

    const frame: StoryFrame = {
      positions,
      states,
      count: total,
      thing,
      formed,
      drawing,
      rect: rectOf(drawing),
      changed,
      inked,
      blob: { x: blob.x, y: blob.y, radius: blob.radius },
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
      spacing.thing = next.stage.size * Math.sqrt(things[thing]!.coverage / count)
      if (name) {
        spacing.name = Math.sqrt(
          (next.name.width * next.name.height * name.coverage) / Math.max(1, count * NAME_SHARE)
        )
      }
    },
  }
}
