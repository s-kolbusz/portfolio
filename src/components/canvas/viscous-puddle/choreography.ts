/**
 * The opening sequence as one piece of matter: the hero (the name soaks up
 * the blob's colour like blotting paper, the camera flies into a soaked
 * stroke), then the signature transition where that matter, filling the
 * frame, darkens into a sheet of water the stronypodhale.pl page surfaces from.
 * Scripts: docs/design/2026-09-25-scroll-hero-scenariusz.md
 *          docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
 *
 * Everything here is a pure function of the scroll position and measured
 * layout, so fast or slow scrolling, reversing and stopping half-way all land
 * on the same picture. All positions are CSS pixels in viewport space.
 *
 * The camera has inertia: the story runs on `timeY`, a damped copy of the
 * scroll position, while everything pinned to the DOM is placed by the real
 * `scrollY`, so nothing drifts off its element.
 */

/** Pinned stage measurements, taken on resize. */
export interface StageLayout {
  /** Document-space top of the pin track (the tall wrapper around the stage). */
  trackDocTop: number
  /** Scroll distance during which the stage stays pinned. */
  pinDistance: number
  /** The box the matter sets into, relative to the pinned stage. */
  box: {
    left: number
    offsetTop: number
    width: number
    height: number
    radius: number
  }
}

/** Pinned hero measurements, taken on resize. */
export interface HeroLayout {
  trackDocTop: number
  pinDistance: number
  /** Box of the name mask, relative to the pinned stage (see `renderNameMask`). */
  nameBox: { left: number; top: number; width: number; height: number }
  /** The fly-in target inside the deepest stroke near the centre (stage px) and its thickness. */
  zoomX: number
  zoomY: number
  zoomStroke: number
}

export interface ChoreographyInput {
  scrollY: number
  /** Damped scroll position the story runs on (defaults to scrollY). */
  timeY?: number
  viewportWidth: number
  viewportHeight: number
  /** The pinned hero, or null on pages without one. */
  hero?: HeroLayout | null
  /** The pinned signature stage, or null on pages without one. */
  stage: StageLayout | null
  /** Blob size multiplier (smaller on phones). */
  scale: number
}

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * The hero's cursor ball: the small metaball that follows the pointer and
 * merges into the blob. It is the part of the matter that stays liquid.
 * Same size and same smooth-union as in the hero; as the body sets the
 * union narrows, so the ball comes away on its own, the way it does in the
 * hero when the cursor moves off.
 */
export interface Ball {
  radius: number
  /** Smooth-union width with the body in px: the hero's value, fading to 0 as the body sets. */
  merge: number
  /** 0 = part of the hero blob, 1 = free. */
  detach: number
  /** Where it settles without a pointer (touch), in viewport space. */
  restX: number
  restY: number
}

/** The name as the shader draws it while it soaks and the camera flies in. */
export interface NameFrame {
  /** Viewport box the mask is drawn in (camera zoom applied). */
  left: number
  top: number
  width: number
  height: number
  /** Camera zoom on the name (1 = as laid out). */
  zoom: number
  /** Soak progress 0–1 (2 once complete): letters turn from ink to the blob's green. */
  soak: number
}

export interface HeroFrame {
  /** Hero pin progress H, 0–1. */
  progress: number
  /** Once true the canvas draws the name and the DOM copy steps aside. */
  nameInCanvas: boolean
  /** Role / offer / CTA opacity. */
  contentOpacity: number
}

export interface ChoreographyFrame {
  /** Signature pin progress P, 0–1 (0 throughout the hero). */
  progress: number
  /** The hero's state while it plays, otherwise null. */
  hero: HeroFrame | null
  /** The soaking name (hero only, once the canvas has it). */
  name: NameFrame | null
  /** How much colour the blob has given up: 0 green, 1 clear water (hero only). */
  drain: number
  /** Camera zoom around (zoomX, zoomY) applied to the body and ball (hero fly-in). */
  bodyZoom: number
  zoomX: number
  zoomY: number
  /** Readout value: 0.82 liquid → 0 set. */
  viscosity: number
  /** viscosity / 0.82: drives drift, breathing, cursor and ripple. */
  fluid: number
  /** Colour shift from the blob green to the page's own colour, 0–1. */
  solid: number
  /** How much of the image shows through the matter, 0–1. */
  imageIn: number
  /** How calm and clear the surface over the page is: 0 murky waves, 1 still glass. */
  clarity: number
  /** How much the matter is a sheet of water (waves and sheen), 0–1 (signature scene). */
  surface: number
  /** Whether the body's edge stays liquid (the water sheet leaving with its section). */
  liquidEdge: number
  /** Opacity of the DOM image (swapped in once the canvas matches it). */
  reveal: number
  /** Whether the main body is drawn (false once the water sheet has left the screen). */
  body: boolean
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
  cornerRadius: number
  /** Where the box currently is in the viewport (it scrolls away after the pin). */
  box: Rect
  /** Corner radius of the box (the image surfaces with it). */
  boxRadius: number
  /** The cursor ball (see `Ball`). */
  ball: Ball
  /** False when nothing on the canvas is visible and rendering can stop. */
  active: boolean
}

export const VISCOSITY_START = 0.82

/*
 * One rhythm for the whole sequence (hero 2 screens + scene 2 screens): each
 * beat takes about half a screen of scroll and eases the same way, the next
 * one starting as the last settles. Only the fly-in, the one big camera
 * move, gets a full screen. So one scrolling speed reads the whole story.
 */

/** Beat boundaries on the pin progress P (2 screens; 0.25 = half a screen). */
export const BEATS = {
  enter: [0, 0.05],
  darken: [0, 0.28],
  detach: [0.1, 0.35],
  image: [0.25, 0.53],
  clear: [0.45, 0.73],
  swap: [0.73, 0.75],
  heading: [0.76, 0.96],
} as const

/** Beat boundaries on the hero pin progress H (2 screens; 0.25 = half a screen). */
export const HERO_BEATS = {
  quiet: [0, 0.14],
  cling: [0.06, 0.32],
  soak: [0.24, 0.52],
  drain: [0.26, 0.52],
  fly: [0.5, 1],
} as const

/** Pin progress at which the heading starts to enter the frame. */
export const HEADING_AT = BEATS.heading[0]

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function linear(edge0: number, edge1: number, value: number) {
  return clamp01((value - edge0) / (edge1 - edge0))
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = linear(edge0, edge1, value)
  return t * t * (3 - 2 * t)
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function pinProgress(scrollY: number, stage: StageLayout) {
  return linear(stage.trackDocTop, stage.trackDocTop + stage.pinDistance, scrollY)
}

/** Readout: 0.82 → 0.30 while darkening, → 0.05 as the page surfaces, → 0 once the surface is still. */
export function viscosityAt(progress: number) {
  const [darkStart, darkEnd] = BEATS.darken
  const imageEnd = BEATS.image[1]
  if (progress <= darkStart) return VISCOSITY_START
  if (progress <= darkEnd) return mix(VISCOSITY_START, 0.3, linear(darkStart, darkEnd, progress))
  if (progress <= imageEnd) return mix(0.3, 0.05, linear(darkEnd, imageEnd, progress))
  return mix(0.05, 0, linear(imageEnd, BEATS.clear[1], progress))
}

/** Viewport-space box position: follows the stage in, holds while pinned, leaves with it. */
export function boxRect(scrollY: number, stage: StageLayout): Rect {
  const pinned = Math.min(Math.max(scrollY - stage.trackDocTop, 0), stage.pinDistance)
  const stageTop = stage.trackDocTop - scrollY + pinned
  return {
    left: stage.box.left,
    top: stageTop + stage.box.offsetTop,
    width: stage.box.width,
    height: stage.box.height,
  }
}

/** Hero cursor ball radius and smooth-union width (shader units are half the viewport height). */
export function ballMetrics(viewportHeight: number, scale: number) {
  const unit = viewportHeight / 2
  return { radius: 0.25 * scale * unit, merge: 0.6 * scale * unit }
}

/**
 * Resting spot without a pointer: beside the image when there is room,
 * otherwise leaning on its bottom-right corner.
 */
function ballRest(box: Rect, radius: number, viewportWidth: number) {
  const right = box.left + box.width
  const bottom = box.top + box.height
  if (viewportWidth - right > radius * 2.4) {
    return { x: right + radius * 1.3, y: bottom - radius * 1.2 }
  }
  // Otherwise it leans on that corner, half behind the image, clear of the link.
  return { x: right - radius * 0.2, y: bottom - radius * 0.2 }
}

/** Radius that covers the whole viewport even with the surface drifting. */
export function coverRadius(viewportWidth: number, viewportHeight: number) {
  return Math.hypot(viewportWidth, viewportHeight) / 2 + 0.25 * (viewportHeight / 2)
}

export function heroProgress(scrollY: number, hero: HeroLayout) {
  return linear(hero.trackDocTop, hero.trackDocTop + hero.pinDistance, scrollY)
}

function heroFrame(
  scrollY: number,
  timeY: number,
  viewportWidth: number,
  viewportHeight: number,
  hero: HeroLayout,
  scale: number
): ChoreographyFrame {
  const unit = viewportHeight / 2
  const baseRadius = 0.75 * unit * scale
  const progress = heroProgress(timeY, hero)
  const pinned = Math.min(Math.max(scrollY - hero.trackDocTop, 0), hero.pinDistance)
  const stageTop = hero.trackDocTop - scrollY + pinned

  // Cling: drawn in by the paper, the blob flattens along the name until it
  // touches every letter.
  const cling = smoothstep(...HERO_BEATS.cling, progress)
  const nameCenterX = hero.nameBox.left + hero.nameBox.width / 2
  const nameCenterY = stageTop + hero.nameBox.top + hero.nameBox.height / 2
  const restX = viewportWidth / 2
  const restY = stageTop + viewportHeight / 2
  const clingHalfWidth = hero.nameBox.width * 0.5
  const clingHalfHeight = hero.nameBox.height * 0.62
  let centerX = mix(restX, nameCenterX, cling)
  let centerY = mix(restY, nameCenterY, cling)
  let halfWidth = mix(baseRadius, clingHalfWidth, cling)
  let halfHeight = mix(baseRadius, clingHalfHeight, cling)
  let cornerRadius = mix(baseRadius, Math.min(clingHalfWidth, clingHalfHeight), cling)

  // Soak: each letter takes up the colour as a whole, ink turning to green,
  // the ones nearest the blob first. Past the beat everything is soaked.
  const soakTime = linear(...HERO_BEATS.soak, progress)
  const soak = soakTime >= 1 ? 2 : soakTime
  const drain = smoothstep(...HERO_BEATS.drain, progress)

  // Fly-in: the camera pushes towards a point deep in a soaked stroke, at a
  // steady perceived speed (exponential zoom), until that stroke's green
  // fills the frame. The words part and grow by perspective alone; the
  // drained blob sits further back, so it grows less.
  const fly = linear(...HERO_BEATS.fly, progress)
  const zoomX = hero.zoomX
  const zoomY = stageTop + hero.zoomY
  const diagonal = Math.hypot(viewportWidth, viewportHeight)
  const zoomMax = (diagonal * 1.3) / Math.max(hero.zoomStroke, 1)
  // Past full cover at the end (1.3 × the diagonal), so the handover frame is solid green.
  // Eased in and out in log space, like every other beat: the push starts
  // and lands gently, with no burst of speed at the end.
  const zoom = Math.exp(Math.log(zoomMax) * smoothstep(0, 1, fly))
  // Keep the target drifting to the centre of the frame as we approach it.
  const aim = smoothstep(0, 0.6, fly)
  const shiftX = (viewportWidth / 2 - zoomX) * aim
  const shiftY = (viewportHeight / 2 - zoomY) * aim
  const bodyZoom = 1 + (zoom - 1) * 0.35
  centerX = zoomX + shiftX + (centerX - zoomX) * bodyZoom
  centerY = zoomY + shiftY + (centerY - zoomY) * bodyZoom
  halfWidth *= bodyZoom
  halfHeight *= bodyZoom
  cornerRadius *= bodyZoom

  const nameInCanvas = progress >= HERO_BEATS.cling[0]
  const name: NameFrame | null = nameInCanvas
    ? {
        left: zoomX + shiftX + (hero.nameBox.left - zoomX) * zoom,
        top: zoomY + shiftY + (stageTop + hero.nameBox.top - zoomY) * zoom,
        width: hero.nameBox.width * zoom,
        height: hero.nameBox.height * zoom,
        zoom,
        soak,
      }
    : null

  const metrics = ballMetrics(viewportHeight, scale)

  return {
    progress: 0,
    hero: {
      progress,
      nameInCanvas,
      contentOpacity: 1 - smoothstep(...HERO_BEATS.quiet, progress),
    },
    name,
    drain,
    bodyZoom,
    zoomX: zoomX + shiftX,
    zoomY: zoomY + shiftY,
    viscosity: VISCOSITY_START,
    fluid: 1,
    solid: 0,
    imageIn: 0,
    clarity: 0,
    surface: 0,
    liquidEdge: 0,
    reveal: 0,
    body: true,
    centerX,
    centerY,
    halfWidth,
    halfHeight,
    cornerRadius,
    box: { left: 0, top: 0, width: 0, height: 0 },
    boxRadius: 0,
    ball: {
      ...metrics,
      radius: metrics.radius * bodyZoom,
      detach: 0,
      restX: centerX,
      restY: centerY,
    },
    active: stageTop + viewportHeight > 0,
  }
}

export function choreograph({
  scrollY,
  timeY = scrollY,
  viewportWidth,
  viewportHeight,
  hero = null,
  stage,
  scale,
}: ChoreographyInput): ChoreographyFrame {
  const radius = 0.75 * (viewportHeight / 2) * scale

  // The hero plays until the signature pin takes over the same matter.
  if (hero && (!stage || timeY < stage.trackDocTop)) {
    return heroFrame(scrollY, timeY, viewportWidth, viewportHeight, hero, scale)
  }

  if (!stage) {
    return {
      progress: 0,
      hero: null,
      name: null,
      drain: 0,
      bodyZoom: 1,
      zoomX: 0,
      zoomY: 0,
      viscosity: VISCOSITY_START,
      fluid: 1,
      solid: 0,
      imageIn: 0,
      clarity: 0,
      surface: 0,
      liquidEdge: 0,
      reveal: 0,
      body: true,
      centerX: viewportWidth / 2,
      centerY: viewportHeight / 2 + scrollY * 0.15,
      halfWidth: radius,
      halfHeight: radius,
      cornerRadius: radius,
      box: { left: 0, top: 0, width: 0, height: 0 },
      boxRadius: 0,
      ball: {
        ...ballMetrics(viewportHeight, scale),
        detach: 0,
        restX: viewportWidth / 2,
        restY: viewportHeight / 2,
      },
      active: scrollY < viewportHeight * 1.5,
    }
  }

  const progress = pinProgress(timeY, stage)
  const box = boxRect(scrollY, stage)
  const viscosity = viscosityAt(progress)
  const reveal = smoothstep(...BEATS.swap, progress)
  const stageTop = box.top - stage.box.offsetTop
  const unit = viewportHeight / 2

  // The matter that filled the frame stays: it is the whole stage, a sheet
  // of water behind the scene, and leaves with it. It reaches well past the
  // top and sides; only its bottom edge is ever seen, soft and liquid.
  // Without a hero it grows out of the resting blob instead.
  const margin = 0.3 * unit
  const sheetHalfWidth = viewportWidth / 2 + margin
  // Its bottom sits a little below the stage, so its rippling edge stays
  // out of sight while pinned and only shows as it leaves.
  const sheetHalfHeight = viewportHeight + margin / 2
  const grow = hero ? 1 : smoothstep(...BEATS.darken, progress)
  const metrics = ballMetrics(viewportHeight, scale)
  const detach = smoothstep(...BEATS.detach, progress)
  const rest = ballRest(box, metrics.radius, viewportWidth)
  const middleY = stageTop + viewportHeight / 2
  const sheetBottom = stageTop + viewportHeight
  const sheetOnScreen = sheetBottom + margin > 0 && stageTop < viewportHeight
  const sceneOnScreen = box.top + box.height + metrics.radius * 3 > 0 && box.top < viewportHeight

  return {
    progress,
    hero: null,
    name: null,
    drain: 0,
    bodyZoom: 1,
    zoomX: 0,
    zoomY: 0,
    viscosity,
    fluid: viscosity / VISCOSITY_START,
    solid: smoothstep(...BEATS.darken, progress),
    imageIn: smoothstep(...BEATS.image, progress),
    clarity: smoothstep(...BEATS.clear, progress),
    surface: hero ? smoothstep(0, 0.12, progress) : grow,
    liquidEdge: 1,
    reveal,
    body: sheetOnScreen,
    centerX: viewportWidth / 2,
    centerY: mix(Math.min(viewportHeight / 2, middleY), stageTop + margin / 2, grow),
    halfWidth: mix(radius, sheetHalfWidth, grow),
    halfHeight: mix(radius, sheetHalfHeight, grow),
    cornerRadius: mix(radius, unit * 0.6, grow),
    box,
    boxRadius: stage.box.radius,
    ball: {
      radius: metrics.radius,
      merge: metrics.merge * (1 - detach),
      detach,
      // Until it comes away it rests mid-frame, as in the hero.
      restX: mix(viewportWidth / 2, rest.x, detach),
      restY: mix(middleY, rest.y, detach),
    },
    // The water sheet, then the free ball, keep the canvas awake.
    active: sheetOnScreen || sceneOnScreen,
  }
}

export type ReadoutKey = 'target' | 'viscosity' | 'colour' | 'clarity'

const READOUT_FADE = 0.05

/** Which beat each readout narrates: [fade in from, fade out from]. */
const READOUT_WINDOWS: Record<ReadoutKey, [number, number]> = {
  // All give way to the heading, which enters in their place.
  target: [0, HEADING_AT - READOUT_FADE],
  colour: [BEATS.darken[0], BEATS.darken[1]],
  viscosity: [BEATS.darken[0] + 0.05, BEATS.image[1]],
  clarity: [BEATS.clear[0], HEADING_AT - READOUT_FADE],
}

export interface ReadoutMotion {
  /** 0 → 1 across the readout's entrance (scroll-bound, not timed). */
  enter: number
  /** 0 → 1 across its exit. */
  exit: number
}

/**
 * Scroll-bound entrance and exit of each readout at pin progress P, so they
 * move with the scroll like everything else in the scene. Phones keep the
 * target plus the latest one.
 */
export function readoutMotion(
  progress: number,
  compact: boolean
): Record<ReadoutKey, ReadoutMotion> {
  const entries = Object.entries(READOUT_WINDOWS) as Array<[ReadoutKey, [number, number]]>
  const result = {} as Record<ReadoutKey, ReadoutMotion>
  for (const [key, [from, until]] of entries) {
    result[key] = {
      enter: linear(from, from + READOUT_FADE, progress),
      exit: linear(until, until + READOUT_FADE, progress),
    }
  }
  if (compact) {
    const showing = (key: ReadoutKey) => result[key].enter > 0 && result[key].exit < 1
    const latest = entries.filter(([key]) => key !== 'target' && showing(key)).at(-1)?.[0]
    for (const [key] of entries) {
      if (key !== 'target' && key !== latest) result[key] = { enter: 0, exit: 0 }
    }
  }
  return result
}

/** Opacity of each readout at pin progress P (entrance and exit combined). */
export function readoutOpacity(progress: number, compact: boolean): Record<ReadoutKey, number> {
  const motion = readoutMotion(progress, compact)
  const result = {} as Record<ReadoutKey, number>
  for (const key of Object.keys(motion) as ReadoutKey[]) {
    result[key] = Math.min(motion[key].enter, 1 - motion[key].exit)
  }
  return result
}

/** `#rrggbb` for an sRGB colour given as 0–1 floats. */
export function toHex([r, g, b]: readonly [number, number, number]) {
  const channel = (value: number) =>
    Math.round(clamp01(value) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}

export function mixColour(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number
): [number, number, number] {
  return [mix(from[0], to[0], t), mix(from[1], to[1], t), mix(from[2], to[2], t)]
}

/**
 * The heading's entrance, scrubbed by the scroll: the site's reveal (rise
 * 100 px and fade in, staggered) laid over the heading beat instead of
 * played on a timer. Returns 0 → 1 for the item at `index` of `count`.
 */
export function headingMotion(progress: number, index: number, count: number) {
  const [from, until] = BEATS.heading
  const stagger = 0.03
  const length = until - from - stagger * (count - 1)
  const start = from + index * stagger
  return linear(start, start + length, progress)
}
