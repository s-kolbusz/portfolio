import { createFluid } from './matter-fluid'
import { createMould, type Mould } from './matter-moulds'
import type { RasterThing } from './things'

/**
 * The matter is one liquid (matter-fluid.ts): a few thousand particles that
 * push apart, hold together and drag on each other. Nothing here moves a
 * particle to a place; the story only changes what pulls on the liquid.
 *
 * - The blob is the heavy body: a steady pull towards the middle of the
 *   stage, loose inside it. What reaches it is absorbed because liquid that
 *   touches liquid runs together.
 * - A drawing (a thing, or the letters of the name) is a mould
 *   (matter-moulds.ts): it draws matter to where it is still empty, lets it
 *   spread inside, and holds it. Matter that has come to rest in a full part
 *   of the mould sets: it thickens until it stands still, and the renderer
 *   swaps it for the exact drawing.
 * - A thing is made part by part, in the order it is made in life (a page
 *   from the top, a print from the bed). A part that has not been started
 *   holds nothing; the next is started when the one before has begun to set.
 *   The matter not yet in the thing stays one body and waits over what the
 *   thing still lacks, so what is finished is left behind in the open.
 * - Letting go is the mould's hold running out from one place outwards: from
 *   the blob for the letters, from the part made last for a thing. The matter
 *   draws together by itself and the blob's weight takes it back.
 *
 * All chaos lives in the liquid. What it sets into is precise.
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

const GOLDEN = 2.39996323
/** How much wider than its share a liquid particle's spot is drawn. */
const WIDE = 1.45
/** Share of the matter the letters can hold. */
const NAME_SHARE = 0.34
/** The liquid rests a little tighter than its nominal spacing; this evens it out. */
const LOOSEN = 1.08
/** Matter in a mould is given a little more room than it has, so it presses outwards and fills. */
const SWELL = 1.06

/**
 * Share of the matter a thing's parts end up holding; the rest stays in the
 * gaps between them. Each part is given room for that much, so the parts made
 * first do not take what the last ones need.
 */
const HELD = 0.85

/** Forces, as multiples of the stage size per second squared (so every screen moves alike). */
const WEIGHT = 4.6
const THIRST = 9
const WALL = 14
const CURRENT = 0.4
/** Drag (1/s): the air, the blob's own thickness, a mould, and matter that has set. */
const AIR = 1.5
const BODY = 2.2
const MOULD = 5
const LANDING = 26
const SET = 46
/** How readily particles take on their neighbours' motion (1/s): liquid, and set. */
const RUNNY = 5
const STIFF = 40

const random = (from: number, to: number) => from + Math.random() * (to - from)
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

export function createStory(options: {
  count: number
  ballCount: number
  things: RasterThing[]
  /** The name's letters, or null if they could not be drawn. */
  name: RasterThing | null
  layout: StoryLayout
}) {
  const { count, ballCount, things } = options
  let layout = options.layout
  const total = count + ballCount

  const fluid = createFluid(total)
  const { positions, velocities, accelerations } = fluid
  /** Per particle, for the renderer: spot size (px), settled (0–1), weight. */
  const states = new Float32Array(total * 3)
  /** Each particle is a little larger or smaller than the next, so the liquid never packs into a lattice. */
  const girth = new Float32Array(total)
  /** 1 loose liquid, 0 held in a mould. */
  const wet = new Float32Array(total).fill(1)
  const settled = new Float32Array(total)
  /** 1 for the matter the letters draw on load; the rest answers only to the blob. */
  const lettered = new Uint8Array(total)
  /** When the mould's hold on each particle runs out (story time). */
  const letGoAt = new Float32Array(total).fill(Infinity)
  {
    let sum = 0
    for (let i = 0; i < total; i++) {
      girth[i] = random(0.84, 1.16)
      sum += girth[i]! * girth[i]!
    }
    const even = Math.sqrt(total / sum)
    for (let i = 0; i < total; i++) girth[i] = girth[i]! * even
  }

  // The moulds: the wall is read finely (thin strokes), the thirst coarsely.
  const nameMould = options.name
    ? createMould(options.name.mask, {
        detail: Math.min(640, Math.round(layout.name.width)),
        coarse: 44,
        reach: 0.16,
      })
    : null
  const thingMoulds = things.map((thing) =>
    createMould(thing.mask, {
      detail: 256,
      coarse: 36,
      ids: thing.ids,
      parts: thing.parts.length,
    })
  )
  /** The order each thing's parts are made in: its own, or as a page is read (rows, then left to right). */
  const orders = things.map((thing, index) => {
    const shares = thingMoulds[index]!.shares
    const row = (part: number) => Math.round(thing.parts[part]!.y / 0.1)
    const made =
      thing.order ??
      thing.parts
        .map((_, part) => part)
        .sort((a, b) => row(a) - row(b) || thing.parts[a]!.x - thing.parts[b]!.x)
    return made.filter((part) => (shares[part] ?? 0) > 0)
  })
  const mostParts = Math.max(1, ...things.map((thing) => thing.parts.length))

  // Lengths that follow the layout.
  const stageRect = (): Rect => ({
    x: layout.stage.x,
    y: layout.stage.y,
    width: layout.stage.size,
    height: layout.stage.size,
  })
  const scale = { unit: 1, spacing: 1, radius: 1, name: 1, things: thingMoulds.map(() => 1) }
  const measure = () => {
    scale.unit = layout.stage.size
    scale.radius = layout.stage.size * 0.43
    scale.spacing = scale.radius * Math.sqrt(Math.PI / count)
    if (nameMould) {
      const area = layout.name.width * layout.name.height * nameMould.coverage
      scale.name = Math.sqrt(area / (count * NAME_SHARE))
    }
    thingMoulds.forEach((mould, index) => {
      scale.things[index] = layout.stage.size * Math.sqrt(mould.coverage / (total * HELD))
    })
  }
  measure()

  const home = () => ({
    x: layout.stage.x + layout.stage.size / 2,
    y: layout.stage.y + layout.stage.size / 2,
  })

  let phase: StoryFrame['phase'] = 'birth'
  let clock = 0
  let phaseAt = 0
  let nextAt = 0
  let thing = 0
  let formed = 0
  let changed = true
  let drawing: StoryFrame['drawing'] = nameMould ? 'name' : 'thing'
  let inked = !nameMould
  let inkedAt = -1
  /** The letters have taken what they can: what is left over on them goes to the blob. */
  let lettersDone = !nameMould
  let lettersDoneAt = -1
  let mostSet = 0
  let mostSetAt = 0
  /** The mould the matter answers to now, how strongly it draws, and whether it is letting go. */
  let mould: Mould | null = nameMould
  let draw = nameMould ? 1 : 0
  let releasing = false
  /** How much the blob's weight counts (0 while a thing has the matter). */
  let weight = 1
  let calmFor = 0
  /** How much matter is in the middle of the blob (from the last frame), and how much of it is loose. */
  let inCore = 0
  let inPool = 0
  /**
   * A thing is made part by part, in the order it is made in life. `opened`
   * is how far each part takes matter; `turn` is how many have been started.
   * The next part opens when the one before has begun to set.
   */
  const opened = new Float32Array(mostParts)
  const partHas = new Float32Array(mostParts)
  const partSet = new Float32Array(mostParts)
  /** How much more each part will take from outside it (1 all it is offered, 0 it has its share). */
  const partRoom = new Float32Array(mostParts).fill(1)
  let turn = 0
  let turnAt = 0
  let nextGap = 0
  /**
   * Before it gives its matter to a thing that needs more room than the blob
   * takes, the blob loosens to that thing's density (0 its own, 1 the thing's),
   * so no part is handed more than it can hold.
   */
  let slack = 0
  /**
   * Where the matter that is not yet part of the thing waits: over what the
   * thing still lacks, so what is finished is left behind in the open.
   */
  const pool = { x: 0, y: 0 }
  const blob = { ...home(), radius: 0 }
  Object.assign(pool, home())
  /** The middle of what the thing still lacks: the parts not started, and what is missing in those being made. */
  const waiting = () => {
    const order = orders[thing] ?? []
    const parts = things[thing]?.parts ?? []
    const shares = thingMoulds[thing]?.shares
    let sum = 0
    let x = 0
    let y = 0
    for (let k = 0; k < order.length; k++) {
      const part = order[k]!
      // A part being made counts for as much as it still lacks.
      const lacks =
        k < turn ? clamp01(1 - partHas[part]! / ((shares?.[part] ?? 0) * total * HELD)) : 1
      const share = (shares?.[part] ?? 0) * lacks
      sum += share
      x += parts[part]!.x * share
      y += parts[part]!.y * share
    }
    if (sum <= 0.02) return null
    return {
      x: layout.stage.x + (x / sum) * layout.stage.size,
      y: layout.stage.y + (y / sum) * layout.stage.size,
    }
  }

  // --- Load: the matter comes in from beyond the frame as unequal drops,
  // each already moving, each on a course of its own. ---
  {
    const { width, height } = layout
    const centre = home()
    const aims: Array<{ x: number; y: number; size: number; letters: boolean }> = []
    const split = (howMany: number, amount: number) => {
      const shares = Array.from({ length: howMany }, () => 0.25 + Math.random() ** 2 * 2.4)
      const whole = shares.reduce((sum, share) => sum + share, 0)
      return shares.map((share) => Math.max(8, Math.round((share / whole) * amount)))
    }
    const rain = (howMany: number, amount: number) => {
      const shares = Array.from({ length: howMany }, () => random(0.75, 1.25))
      const whole = shares.reduce((sum, share) => sum + share, 0)
      return shares.map((share) => Math.round((share / whole) * amount))
    }
    const mobileish = width < 768
    if (nameMould) {
      // Aimed at the letters, spread along them.
      // Spread along them: each new aim is the candidate farthest from the ones before.
      const chosen: Array<[number, number]> = []
      // The letters are written by a rain of small drops.
      for (const size of rain(mobileish ? 18 : 24, count * NAME_SHARE * 1.03)) {
        let best = nameMould.pointInside()
        let bestGap = -1
        for (let attempt = 0; attempt < 24; attempt++) {
          const candidate = nameMould.pointInside()
          let gap = Infinity
          for (const [cu, cv] of chosen) {
            gap = Math.min(gap, Math.hypot(candidate[0] - cu, candidate[1] - cv))
          }
          if (gap > bestGap) {
            bestGap = gap
            best = candidate
          }
        }
        chosen.push(best)
        const [u, v] = best
        aims.push({
          x: layout.name.x + u * layout.name.width,
          y: layout.name.y + v * layout.name.width,
          size,
          letters: true,
        })
      }
    }
    const aimed = aims.reduce((sum, aim) => sum + aim.size, 0)
    for (const size of split(11, total - aimed)) {
      aims.push({
        x: centre.x + random(-0.2, 0.2) * scale.radius,
        y: centre.y + random(-0.2, 0.2) * scale.radius,
        size,
        letters: false,
      })
    }
    let cursor = 0
    aims.forEach((aim, index) => {
      const size = index === aims.length - 1 ? total - cursor : Math.min(aim.size, total - cursor)
      if (size <= 0) return
      const radius = scale.spacing * Math.sqrt(size / Math.PI)
      // From just beyond the edge of the frame. What builds the letters comes from
      // behind them, so it does not cross the blob; the rest comes from the sides,
      // so it does not cross the letters (the name stands above and below the stage).
      const side = aim.letters
        ? Math.atan2(aim.y - centre.y, aim.x - centre.x) + random(-0.8, 0.8)
        : (Math.random() < 0.5 ? 0 : Math.PI) + random(-0.55, 0.55)
      const dirX = Math.cos(side)
      const dirY = Math.sin(side)
      const toEdgeX = dirX > 0 ? (width - aim.x) / dirX : dirX < 0 ? -aim.x / dirX : Infinity
      const toEdgeY = dirY > 0 ? (height - aim.y) / dirY : dirY < 0 ? -aim.y / dirY : Infinity
      const stretch = random(1, 1.5)
      const away =
        Math.max(0, Math.min(toEdgeX, toEdgeY)) +
        radius * stretch * 1.1 +
        scale.unit * (aim.letters ? random(0, 0.9) : random(0.5, 3))
      const startX = aim.x + dirX * away
      const startY = aim.y + dirY * away
      // Already on its way, not straight at where it is going, its front faster than its tail.
      // The rain is thrown just hard enough to reach the letters through the air;
      // the blob's drops only need a start, its weight does the rest.
      const speed = aim.letters ? away * AIR * random(1.1, 1.45) : scale.unit * random(0.7, 1.7)
      const sideways =
        scale.unit *
        (aim.letters ? random(0, 0.2) : random(0.15, 0.6)) *
        (Math.random() < 0.5 ? -1 : 1)
      const lead = random(0, 0.12)
      for (let j = 0; j < size; j++, cursor++) {
        const r = Math.sqrt((j + 0.5) / size) * radius
        const along = r * Math.cos(j * GOLDEN) * stretch
        const across = (r * Math.sin(j * GOLDEN)) / stretch
        lettered[cursor] = aim.letters ? 1 : 0
        positions[cursor * 2] = startX - dirX * along + dirY * across
        positions[cursor * 2 + 1] = startY - dirY * along - dirX * across
        const pace = speed * (1 + (lead * along) / (radius * stretch))
        velocities[cursor * 2] = -dirX * pace - dirY * sideways
        velocities[cursor * 2 + 1] = -dirY * pace + dirX * sideways
      }
    })
    // The particles that answer to the pointer are scattered through the matter.
    for (let j = 0; j < ballCount; j++) {
      const a = count + j
      const b = Math.floor(Math.random() * count)
      lettered[a] = 0
      lettered[b] = 0
      for (const array of [positions, velocities]) {
        for (let axis = 0; axis < 2; axis++) {
          const kept = array[a * 2 + axis]!
          array[a * 2 + axis] = array[b * 2 + axis]!
          array[b * 2 + axis] = kept
        }
      }
    }
  }

  const rectOf = (which: 'name' | 'thing') => (which === 'name' ? layout.name : stageRect())

  /** The mould lets go: its hold runs out from one place outwards (from the blob, if none is given). */
  const letGo = (from?: { x: number; y: number }) => {
    const centre = from ?? home()
    const pace = scale.unit * 1.5
    for (let i = 0; i < total; i++) {
      const distance = Math.hypot(positions[i * 2]! - centre.x, positions[i * 2 + 1]! - centre.y)
      letGoAt[i] = clock + distance / pace
    }
    releasing = true
  }
  const open = (next: Mould) => {
    mould = next
    draw = 0
    releasing = false
    letGoAt.fill(Infinity)
    opened.fill(0)
    turn = 0
    turnAt = clock
    nextGap = random(0.35, 0.5)
    next.open(opened)
    next.count()
    next.settle(0)
  }

  const advance = (
    dt: number,
    pointer: { x: number; y: number; active: boolean },
    rounds: number
  ) => {
    const centre = pool
    const { unit, spacing, radius } = scale
    const rect = rectOf(drawing)
    const mouldSpacing = drawing === 'name' ? scale.name : (scale.things[thing] ?? spacing)
    const isName = drawing === 'name'
    const roomy = isName ? 1 : Math.max(1, (mouldSpacing * SWELL * 1.03) / (spacing * LOOSEN))
    const liquidSpacing = spacing * (1 + (roomy - 1) * slack)
    const perWidth = 1 / rect.width

    // What the mould holds, and where it is still empty.
    if (mould && draw > 0) {
      mould.count()
      const share = 1 / (isName ? count * NAME_SHARE : total * HELD)
      for (let i = 0; i < total; i++) {
        // Only matter that answers to this mould counts as filling it.
        if (isName && !lettered[i]) continue
        mould.add(
          (positions[i * 2]! - rect.x) * perWidth,
          (positions[i * 2 + 1]! - rect.y) * perWidth,
          share
        )
      }
      mould.settle(isName ? 4 : 8)
    }

    // The letters keep their matter from the blob only while they are still empty somewhere.
    const hungry = !isName || !lettersDone

    // The pointer's own drop is drawn towards the blob when it comes near.
    const pointerToBlob = Math.hypot(pointer.x - centre.x, pointer.y - centre.y)
    const drawnIn = pointer.active ? smooth(radius * 1.6, radius * 0.95, pointerToBlob) : 0
    const reach = Math.max(unit * 0.16, spacing * 9)

    if (mould && !isName) {
      // A part that has its share stops drawing in what lies beside it: that stays the blob's.
      for (let part = 0; part < mould.shares.length; part++) {
        const share = mould.shares[part]! * total * HELD
        partRoom[part] = 1 - smooth(1, 1.15, partHas[part]! / Math.max(share, 1))
      }
    }
    partHas.fill(0)
    partSet.fill(0)

    // The blob's weight is nil only inside the body it already is: an empty
    // middle draws matter all the way in.
    const hollow =
      radius *
      Math.min(Math.sqrt(clamp01(inCore / (0.36 * total))), Math.sqrt(inPool / total) * 1.05)
    let core = 0
    let loosely = 0

    let resting = 0
    let gathered = 0
    let energy = 0
    let sumX = 0
    let sumY = 0
    for (let i = 0; i < total; i++) {
      const ix = i * 2
      const iy = ix + 1
      const x = positions[ix]!
      const y = positions[iy]!
      const vx = velocities[ix]!
      const vy = velocities[iy]!
      const speed = Math.hypot(vx, vy)
      const called = i >= count && pointer.active
      let ax = 0
      let ay = 0
      let drag = AIR
      let viscosity = RUNNY
      let inMould = false
      let grip = 0
      let wetting = 0
      let landing = 0
      /** How much it answers to the mould rather than to the blob (while the mould is still thirsty). */
      let answering = 0

      // --- The mould: its thirst, its wall, its hold. ---
      if (mould && draw > 0 && !called && (!isName || lettered[i])) {
        const u = (x - rect.x) * perWidth
        const v = (y - rect.y) * perWidth
        mould.wall(u, v)
        // A part that has not been started holds nothing: matter lying on it is still the blob's.
        const here = mould.part < 0 ? 1 : opened[mould.part]!
        const drawn = draw * (releasing ? 1 - clamp01((clock - letGoAt[i]!) / 0.3) : 1)
        grip = drawn * here
        if (drawn > 0) mould.thirst(u, v)
        if (drawn > 0 && !releasing) {
          // The letters answer to small gaps too; a thing draws more evenly.
          const pull =
            (mould.pull / (mould.pull + (isName ? 0.3 : 1))) *
            THIRST *
            unit *
            drawn *
            (1 - settled[i]!)
          ax += mould.towardsX * pull
          ay += mould.towardsY * pull
        }
        if (grip > 0) {
          const distance = mould.distance * rect.width
          inMould = distance < mouldSpacing * 0.4
          const fill = mould.fill
          answering = grip * (releasing || !hungry ? 0 : 1)
          if (inMould && mould.part >= 0) {
            partHas[mould.part] = partHas[mould.part]! + 1
            if (settled[i]! > 0.5) partSet[mould.part] = partSet[mould.part]! + 1
          }
          if (distance > 0) {
            // Just outside: drawn in. The letters only take what they have room for.
            const near = isName ? 1 - smooth(mouldSpacing * 2, mouldSpacing * 5, distance) : 1
            const room = isName
              ? 1 - smooth(1, 1.3, fill)
              : mould.part < 0
                ? 1
                : partRoom[mould.part]!
            const pull =
              WALL * unit * Math.min(1, distance / (mouldSpacing * 0.8)) * grip * near * room
            ax -= mould.awayX * pull
            ay -= mould.awayY * pull
            // Being drawn in, it wets the drawing instead of holding itself round.
            wetting = grip * room * (1 - smooth(mouldSpacing * 1.5, mouldSpacing * 6, distance))
            landing = grip * (isName ? 1 : room) * (1 - smooth(unit * 0.04, unit * 0.2, distance))
          } else {
            wetting = grip
            landing = grip
          }
          // It sets where it has come to rest and the mould around it is full.
          const rests =
            inMould && grip > 0.6 && speed < unit * 0.14 && fill > 0.55 && (!isName || fill < 1.4)
          settled[i] = clamp01(settled[i]! + (rests ? dt / 0.4 : -dt / 0.3))
          // The drawing is a surface: what lands on it stays on it.
          // (Only what arrives fast is braked; what creeps along it to an empty part is not.)
          // (And a part that is still mostly empty lets it run along to where it is missing.)
          const thick = isName ? 1 : 0.25 + 0.75 * smooth(0.4, 0.95, fill)
          drag += inMould
            ? MOULD * grip * thick
            : LANDING * landing * smooth(unit * 0.3, unit * 0.9, speed)
        }
      }
      if (grip <= 0) settled[i] = clamp01(settled[i]! - dt / 0.25)
      const set = settled[i]!
      drag += SET * set * set
      viscosity += STIFF * set

      // --- The blob's weight: none inside it, steady beyond it. ---
      const toX = centre.x - x
      const toY = centre.y - y
      const far = Math.hypot(toX, toY) || 1
      const heavy = weight * (inMould ? 1 - grip : 1 - answering)
      if (heavy > 0) {
        const pull = WEIGHT * unit * smooth(hollow * 0.8, hollow * 0.8 + radius * 0.5, far) * heavy
        ax += (toX / far) * pull
        ay += (toY / far) * pull
        drag += BODY * heavy * (1 - smooth(radius * 0.9, radius * 1.5, far))
      }

      // --- Slow currents, shared by neighbours, keep the liquid from ever standing still. ---
      if (!inMould) {
        const wave = 4.4 / radius
        const push = CURRENT * unit
        ax += Math.sin((y - centre.y) * wave + clock * 0.7) * push
        ay += Math.cos((x - centre.x) * wave * 1.13 - clock * 0.53) * push
      }

      // --- The pointer: its own drop follows it; liquid nearby reaches for it; set matter softens. ---
      if (pointer.active) {
        const px = pointer.x - x
        const py = pointer.y - y
        const distance = Math.hypot(px, py) || 1
        if (called) {
          const pull = Math.min(distance * 90, unit * 30) * (1 - 0.75 * drawnIn)
          ax += (px / distance) * pull
          ay += (py / distance) * pull
          // Near the pointer it is held still, so it gathers into a drop instead of circling.
          drag += 4 + 14 * (1 - smooth(reach * 0.5, reach * 2, distance))
        } else if (distance < reach) {
          const closeness = (1 - distance / reach) ** 2
          if (inMould) settled[i] = clamp01(settled[i]! - dt * 3 * closeness)
          else {
            ax += (px / distance) * closeness * unit * 5
            ay += (py / distance) * closeness * unit * 5
          }
        }
      }

      accelerations[ix] = ax
      accelerations[iy] = ay
      fluid.drag[i] = drag
      fluid.viscosity[i] = called ? RUNNY * drawnIn : viscosity

      // Loose or held: the spacing it wants, and whether surface tension acts on it.
      const loose = inMould ? 1 - grip : 1
      wet[i] = wet[i]! + (loose - wet[i]!) * (1 - Math.exp(-dt / 0.16))
      const liquid = wet[i]!
      // What builds the letters wets them: it does not pull itself into beads until it is let go.
      // (The pointer's drop is held by the pointer, not by itself, until the blob draws it in.)
      fluid.loose[i] = called ? drawnIn : Math.min(liquid, 1 - wetting, 1 - answering)
      fluid.sizes[i] =
        girth[i]! *
        (mouldSpacing * SWELL + (liquidSpacing * LOOSEN - mouldSpacing * SWELL) * liquid)

      // What the renderer draws: a wide soft spot when liquid, a tight one in a mould.
      const own = girth[i]! * (mouldSpacing + (liquidSpacing - mouldSpacing) * liquid)
      const wide = 1 + (WIDE - 1) * liquid
      states[i * 3] = own * 1.6 * wide
      states[i * 3 + 1] = set
      states[i * 3 + 2] = 1 / (wide * wide)

      if (set > 0.5) resting++
      if (far < radius * 0.6) core++
      if (far < radius * 1.3 && grip < 0.5) loosely++
      if (far < radius * 1.3) {
        gathered++
        sumX += x
        sumY += y
      }
      energy += speed
    }
    inCore = core
    inPool = loosely
    for (let round = 0; round < rounds; round++) fluid.step(dt / rounds)

    return {
      resting,
      gathered,
      calm: energy / total < unit * 0.14,
      centreX: gathered ? sumX / gathered : centre.x,
      centreY: gathered ? sumY / gathered : centre.y,
    }
  }

  const step = (
    delta: number,
    pointer: { x: number; y: number; active: boolean },
    tapped: boolean
  ): StoryFrame => {
    // Short steps keep the liquid stiff; a slow frame is slowed down rather than made coarse.
    const rounds = Math.min(3, Math.max(1, Math.ceil(delta * 110)))
    const dt = Math.min(delta, rounds / 110)
    clock += dt
    const { spacing } = scale

    // A mould draws harder as it opens; the blob's weight returns as a thing lets go.
    const order = orders[thing] ?? []
    // A thing has all the matter once its last part has been started; until
    // then what is not yet in it stays one body, over the parts still to come.
    const thingHasIt = (phase === 'forming' && turn >= order.length) || phase === 'hold'
    draw = Math.min(1, draw + (mould ? dt / 0.35 : 0))
    weight += ((thingHasIt ? 0 : 1) - weight) * (1 - Math.exp(-dt / 0.2))
    if (phase === 'forming') {
      // The next part is started when a good part of the one before has set.
      const before = order[turn - 1]
      const shares = mould?.shares
      const fed =
        before === undefined ||
        partSet[before]! > (shares?.[before] ?? 0) * total * HELD * 0.3 ||
        clock > turnAt + 0.7
      if (turn < order.length && fed && clock > turnAt + nextGap) {
        turn++
        turnAt = clock
        nextGap = random(0.05, 0.3)
      }
      for (let k = 0; k < turn; k++) {
        const part = order[k]!
        opened[part] = Math.min(1, opened[part]! + dt / 0.3)
      }
      mould?.open(opened)
    }
    slack += ((phase === 'forming' || phase === 'hold' ? 1 : 0) - slack) * (1 - Math.exp(-dt / 0.3))
    const rest = (phase === 'forming' && waiting()) || home()
    const drift = 1 - Math.exp(-dt / 0.5)
    pool.x += (rest.x - pool.x) * drift
    pool.y += (rest.y - pool.y) * drift

    fluid.cohere(
      {
        x: -layout.width * 0.15,
        y: -layout.height * 0.15,
        width: layout.width * 1.3,
        height: layout.height * 1.3,
      },
      spacing
    )
    const now = advance(dt, pointer, rounds)
    calmFor = now.calm ? calmFor + dt : 0
    const allHome = now.gathered > total * 0.985 && calmFor > 0.25

    // --- What happens next. Every change has a cause in the matter itself. ---
    if (phase === 'birth') {
      formed = clamp01(now.resting / (count * NAME_SHARE))
      if (nameMould && !lettersDone) {
        // The letters are full, or have stopped taking matter in.
        if (formed > mostSet + 0.04) {
          mostSet = formed
          mostSetAt = clock
        }
        const full = nameMould.filled() > 0.84 && formed > 0.7
        const stalled = formed > 0.4 && clock > mostSetAt + 0.35
        if (full || stalled || clock > 6) {
          lettersDone = true
          lettersDoneAt = clock
        }
      }
      // What was left over has run off: the letters dry to ink.
      if (nameMould && lettersDone && !inked && clock > lettersDoneAt + 0.3) {
        inked = true
        inkedAt = clock
      }
      // The text has taken over; the matter is let go, nearest the blob first.
      if (nameMould && inked && !releasing && clock > inkedAt + 0.45) letGo()
      if ((releasing || !nameMould) && (allHome || clock > phaseAt + 12)) {
        phase = 'blob'
        phaseAt = clock
        mould = null
        nextAt = clock + random(0.5, 0.9)
      }
    } else if (phase === 'blob') {
      if (clock >= nextAt || tapped) {
        phase = 'forming'
        phaseAt = clock
        drawing = 'thing'
        changed = true
        open(thingMoulds[thing]!)
      }
    } else if (phase === 'forming') {
      formed = clamp01(now.resting / total)
      const started = turn >= order.length && clock > turnAt + 0.5
      if ((started && (formed > 0.9 || calmFor > 0.7)) || clock > phaseAt + 14) {
        phase = 'hold'
        phaseAt = clock
        nextAt = clock + random(2.3, 3)
      }
    } else if (phase === 'hold') {
      formed = clamp01(now.resting / total)
      if (clock >= nextAt || tapped) {
        phase = 'melting'
        phaseAt = clock
        // It comes undone from the part that was made last.
        const last = things[thing]?.parts[order[order.length - 1] ?? -1]
        letGo(
          last && {
            x: layout.stage.x + last.x * layout.stage.size,
            y: layout.stage.y + last.y * layout.stage.size,
          }
        )
      }
    } else if (phase === 'melting') {
      formed = clamp01(now.resting / total)
      if ((allHome && clock > phaseAt + 0.6) || clock > phaseAt + 9) {
        phase = 'blob'
        phaseAt = clock
        mould = null
        thing = (thing + 1) % things.length
        nextAt = clock + random(0.8, 1.4)
      }
    }

    // The heavy body, as the letters of the name feel it.
    const ease = 1 - Math.exp(-dt / 0.25)
    blob.x += (now.centreX - blob.x) * ease
    blob.y += (now.centreY - blob.y) * ease
    blob.radius += (spacing * Math.sqrt(now.gathered / Math.PI) * weight - blob.radius) * ease

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
      // The matter keeps its place relative to the stage.
      const before = home()
      const ratio = next.stage.size / layout.stage.size
      layout = next
      const after = home()
      for (let i = 0; i < total; i++) {
        positions[i * 2] = after.x + (positions[i * 2]! - before.x) * ratio
        positions[i * 2 + 1] = after.y + (positions[i * 2 + 1]! - before.y) * ratio
        velocities[i * 2] = velocities[i * 2]! * ratio
        velocities[i * 2 + 1] = velocities[i * 2 + 1]! * ratio
      }
      measure()
    },
  }
}
