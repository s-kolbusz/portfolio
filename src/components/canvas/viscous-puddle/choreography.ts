/**
 * The opening sequence as one piece of matter: the hero (focus pull, the name
 * melting into the blob, the dive under its surface), then the signature
 * transition where it sets into the stronypodhale.pl page.
 * Scripts: docs/design/2026-09-25-scroll-hero-scenariusz.md
 *          docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
 *
 * Everything here is a pure function of the scroll position and measured
 * layout, so fast or slow scrolling, reversing and stopping half-way all land
 * on the same picture. All positions are CSS pixels in viewport space.
 */

import type { DripOrigin } from './name-mask'

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

/** Pinned hero measurements, taken on resize with the hero's own motion reset. */
export interface HeroLayout {
  trackDocTop: number
  pinDistance: number
  /** Name centre, relative to the pinned hero stage (the focus pull scales around it). */
  nameCenterX: number
  nameCenterY: number
  /** Box of the name mask, relative to the stage (see `renderNameMask`). */
  nameBox: { left: number; top: number; width: number; height: number }
  /** Tallest glyph box, px: the unit for drip lengths and the sag. */
  glyphHeight: number
  /** Where drips start, relative to the stage. */
  drips: ReadonlyArray<DripOrigin>
}

export interface ChoreographyInput {
  scrollY: number
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

/** One drip running off the melting name, viewport px. */
export interface Drip {
  x: number
  /** Root, where it leaves the glyph. */
  y: number
  length: number
  /** Radius at the root and at the heavier head. */
  neck: number
  head: number
}

/** The melting name as the shader draws it. */
export interface NameFrame {
  /** Viewport box the mask is drawn in (focus scale applied, sag not). */
  left: number
  top: number
  width: number
  height: number
  /** How far the whole name has sunk, px. */
  sag: number
  /** 0 crisp type → 1 edges softened like warm wax. */
  soften: number
  /** Blur radius of the soft mask channel at this scale, px. */
  softRadius: number
  /** How much of the matter's colour it has taken on, 0–1. */
  tint: number
  /** 0 there → 1 dissolved into the blob. */
  fade: number
  drips: Drip[]
}

export interface HeroFrame {
  /** Hero pin progress H, 0–1. */
  progress: number
  /** Focus pull, 0 (on the name) → 1 (on the matter). */
  focus: number
  nameScale: number
  /** Melt progress, 0–1. While 0 the DOM name shows; after, the canvas draws it. */
  melt: number
  /** Role / offer / CTA: drift (px), opacity, how far under the surface (0–1). */
  contentShift: number
  contentOpacity: number
  underwater: number
  /** The surface passing the camera, 0–1 (peaks mid-dive): drives the refraction. */
  refraction: number
}

export interface ChoreographyFrame {
  /** Signature pin progress P, 0–1 (0 throughout the hero). */
  progress: number
  /** The hero's state while it plays, otherwise null. */
  hero: HeroFrame | null
  /** The melting name (hero only, once the melt has started). */
  name: NameFrame | null
  /** Proportions of the visible shape (clipped to the viewport), for the readout. */
  aspect: number
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
  /** Opacity of the DOM image (swapped in once the canvas matches it). */
  reveal: number
  /** Whether the main body is drawn (false once the DOM image covers it). */
  body: boolean
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
  cornerRadius: number
  /** Where the box currently is in the viewport (it scrolls away after the pin). */
  box: Rect
  /** The cursor ball (see `Ball`). */
  ball: Ball
  /** False when nothing on the canvas is visible and rendering can stop. */
  active: boolean
}

export const VISCOSITY_START = 0.82

/** Beat boundaries on the pin progress P (see the script's frame table). */
export const BEATS = {
  enter: [0, 0.06],
  form: [0.06, 0.36],
  detach: [0.18, 0.42],
  set: [0.34, 0.58],
  image: [0.48, 0.58],
  clear: [0.52, 0.82],
  swap: [0.83, 0.85],
} as const

/** Beat boundaries on the hero pin progress H (see the hero script). */
export const HERO_BEATS = {
  focus: [0, 0.3],
  melt: [0.28, 0.75],
  dive: [0.6, 1],
} as const

/** Pin progress at which the heading enters the frame; the rest of the pin lets it be read. */
export const HEADING_AT = 0.88

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

/** Readout: 0.82 → 0.30 while forming, → 0.05 while setting, → 0 once the surface is still. */
export function viscosityAt(progress: number) {
  const [formStart, formEnd] = BEATS.form
  const setEnd = BEATS.set[1]
  if (progress <= formStart) return VISCOSITY_START
  if (progress <= formEnd) return mix(VISCOSITY_START, 0.3, linear(formStart, formEnd, progress))
  if (progress <= setEnd) return mix(0.3, 0.05, linear(formEnd, setEnd, progress))
  return mix(0.05, 0, linear(setEnd, BEATS.clear[1], progress))
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

interface BodyShape {
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
}

/** Hero cursor ball radius and smooth-union width (shader units are half the viewport height). */
export function ballMetrics(viewportHeight: number, scale: number) {
  const unit = viewportHeight / 2
  return { radius: 0.25 * scale * unit, merge: 0.6 * scale * unit }
}

/**
 * Resting spot without a pointer: beside the image when there is room,
 * otherwise below its right corner, otherwise leaning on that corner.
 */
function ballRest(box: Rect, radius: number, viewportWidth: number, viewportHeight: number) {
  const right = box.left + box.width
  const bottom = box.top + box.height
  if (viewportWidth - right > radius * 2.4) {
    return { x: right + radius * 1.3, y: bottom - radius * 1.2 }
  }
  if (bottom + radius * 2.6 < viewportHeight) {
    return { x: right - radius * 1.2, y: bottom + radius * 1.3 }
  }
  return { x: right, y: bottom }
}

/** Radius that covers the whole viewport even with the surface drifting. */
export function coverRadius(viewportWidth: number, viewportHeight: number) {
  return Math.hypot(viewportWidth, viewportHeight) / 2 + 0.25 * (viewportHeight / 2)
}

function visibleAspect(
  halfWidth: number,
  halfHeight: number,
  viewportWidth: number,
  viewportHeight: number
) {
  return Math.min(halfWidth, viewportWidth / 2) / Math.min(halfHeight, viewportHeight / 2)
}

export function heroProgress(scrollY: number, hero: HeroLayout) {
  return linear(hero.trackDocTop, hero.trackDocTop + hero.pinDistance, scrollY)
}

function heroFrame(
  scrollY: number,
  viewportWidth: number,
  viewportHeight: number,
  hero: HeroLayout,
  scale: number
): ChoreographyFrame {
  const unit = viewportHeight / 2
  const baseRadius = 0.75 * unit * scale
  const progress = heroProgress(scrollY, hero)
  const pinned = Math.min(Math.max(scrollY - hero.trackDocTop, 0), hero.pinDistance)
  const stageTop = hero.trackDocTop - scrollY + pinned

  const focus = easeInOutCubic(linear(...HERO_BEATS.focus, progress))
  const dive = easeInOutCubic(linear(...HERO_BEATS.dive, progress))
  const centerX = viewportWidth / 2
  const centerY = stageTop + viewportHeight / 2
  const nameScale = 1 + 0.06 * focus

  // The name melts like wax (see the hero script): edges soften, drips run
  // from the lowest points of the glyphs with growing speed, then the whole
  // name sinks, takes on the green and dissolves into the blob.
  const melt = linear(...HERO_BEATS.melt, progress)
  const scaleAround = (x: number, y: number) => ({
    x: hero.nameCenterX + (x - hero.nameCenterX) * nameScale,
    y: stageTop + hero.nameCenterY + (y - hero.nameCenterY) * nameScale,
  })
  const glyph = hero.glyphHeight * nameScale
  const sag = glyph * 0.9 * Math.pow(smoothstep(0.55, 1, melt), 1.5)
  const boxCorner = scaleAround(hero.nameBox.left, hero.nameBox.top)
  const name: NameFrame | null =
    melt > 0
      ? {
          left: boxCorner.x,
          top: boxCorner.y,
          width: hero.nameBox.width * nameScale,
          height: hero.nameBox.height * nameScale,
          sag,
          soften: 0.85 * smoothstep(0.05, 0.5, melt),
          softRadius: hero.glyphHeight * 0.06 * nameScale,
          tint: smoothstep(0.35, 0.9, melt),
          fade: smoothstep(0.82, 1, melt),
          drips: hero.drips.map((origin) => {
            const root = scaleAround(origin.x, origin.y)
            const run = linear(origin.delay, 1, melt)
            const stroke = origin.stroke * nameScale
            return {
              x: root.x,
              y: root.y + sag,
              // Gravity: slow to start, then running.
              length: origin.reach * glyph * run * run,
              neck: stroke * 0.3 * smoothstep(0, 0.1, run),
              head: stroke * (0.4 + 0.35 * smoothstep(0, 0.4, run)) * smoothstep(0, 0.12, run),
            }
          }),
        }
      : null

  const nameArea = hero.nameBox.width * hero.nameBox.height * 0.2
  const grown = Math.sqrt(
    (baseRadius * (1 + 0.12 * focus)) ** 2 + nameArea * smoothstep(0.6, 1, melt)
  )
  const radius = mix(grown, coverRadius(viewportWidth, viewportHeight), dive)

  const contentShift = -0.12 * viewportHeight * progress
  const metrics = ballMetrics(viewportHeight, scale)

  return {
    progress: 0,
    hero: {
      progress,
      focus,
      nameScale,
      melt,
      contentShift,
      // The role and offer leave while focus pulls away, so the melt has the
      // frame to itself.
      contentOpacity: 1 - smoothstep(0.05, 0.3, progress),
      // The text already sits over the blob; what the dive changes is the
      // camera going under the surface: the surface passes (bending the text
      // most mid-way) and from then on the text is seen through the water.
      underwater: smoothstep(0.2, 0.8, dive),
      refraction: Math.sin(Math.PI * dive),
    },
    name,
    aspect: visibleAspect(radius, radius, viewportWidth, viewportHeight),
    viscosity: VISCOSITY_START,
    fluid: 1,
    solid: 0,
    imageIn: 0,
    clarity: 0,
    reveal: 0,
    body: true,
    centerX,
    centerY,
    halfWidth: radius,
    halfHeight: radius,
    cornerRadius: radius,
    box: { left: 0, top: 0, width: 0, height: 0 },
    ball: { ...metrics, detach: 0, restX: centerX, restY: centerY },
    active: stageTop + viewportHeight > 0,
  }
}

export function choreograph({
  scrollY,
  viewportWidth,
  viewportHeight,
  hero = null,
  stage,
  scale,
}: ChoreographyInput): ChoreographyFrame {
  const radius = 0.75 * (viewportHeight / 2) * scale

  // The hero plays until the signature pin takes over the same matter.
  if (hero && (!stage || scrollY < stage.trackDocTop)) {
    return heroFrame(scrollY, viewportWidth, viewportHeight, hero, scale)
  }

  if (!stage) {
    return {
      progress: 0,
      hero: null,
      name: null,
      aspect: 1,
      viscosity: VISCOSITY_START,
      fluid: 1,
      solid: 0,
      imageIn: 0,
      clarity: 0,
      reveal: 0,
      body: true,
      centerX: viewportWidth / 2,
      centerY: viewportHeight / 2 + scrollY * 0.15,
      halfWidth: radius,
      halfHeight: radius,
      cornerRadius: radius,
      box: { left: 0, top: 0, width: 0, height: 0 },
      ball: {
        ...ballMetrics(viewportHeight, scale),
        detach: 0,
        restX: viewportWidth / 2,
        restY: viewportHeight / 2,
      },
      active: scrollY < viewportHeight * 1.5,
    }
  }

  const progress = pinProgress(scrollY, stage)
  const box = boxRect(scrollY, stage)
  const viscosity = viscosityAt(progress)
  const form = easeInOutCubic(linear(...BEATS.form, progress))
  const reveal = smoothstep(...BEATS.swap, progress)

  // After the dive the matter fills the frame; it draws back into the box.
  // Without a hero it starts as the resting blob instead.
  const start = hero ? coverRadius(viewportWidth, viewportHeight) : radius
  const boxCenterX = box.left + box.width / 2
  const boxCenterY = box.top + box.height / 2
  const body: BodyShape = {
    centerX: mix(viewportWidth / 2, boxCenterX, form),
    centerY: mix(Math.min(viewportHeight / 2, boxCenterY), boxCenterY, form),
    halfWidth: mix(start, box.width / 2, form),
    halfHeight: mix(start, box.height / 2, form),
  }
  const metrics = ballMetrics(viewportHeight, scale)
  const detach = smoothstep(...BEATS.detach, progress)
  const rest = ballRest(box, metrics.radius, viewportWidth, viewportHeight)
  const sceneOnScreen = box.top + box.height + metrics.radius * 3 > 0 && box.top < viewportHeight

  return {
    progress,
    hero: null,
    name: null,
    aspect: visibleAspect(body.halfWidth, body.halfHeight, viewportWidth, viewportHeight),
    viscosity,
    fluid: viscosity / VISCOSITY_START,
    solid: easeInOutCubic(linear(...BEATS.set, progress)),
    imageIn: smoothstep(...BEATS.image, progress),
    clarity: easeInOutCubic(linear(...BEATS.clear, progress)),
    reveal,
    body: reveal < 1,
    ...body,
    // One shape throughout: corners only ever tighten, never sharper than the box.
    cornerRadius: mix(start, stage.box.radius, smoothstep(BEATS.form[0], BEATS.set[1], progress)),
    box,
    ball: {
      radius: metrics.radius,
      merge: metrics.merge * (1 - detach),
      detach,
      // Until it comes away it rests inside the body, as in the hero.
      restX: mix(body.centerX, rest.x, detach),
      restY: mix(body.centerY, rest.y, detach),
    },
    // The free ball keeps the canvas awake while the scene is on screen.
    active: reveal < 1 || sceneOnScreen,
  }
}

export type ReadoutKey = 'target' | 'viscosity' | 'aspect' | 'colour' | 'clarity'

const READOUT_FADE = 0.05

/** Which beat each readout narrates: [fade in from, fade out from]. */
const READOUT_WINDOWS: Record<ReadoutKey, [number, number]> = {
  // All give way to the heading, which enters in their place.
  target: [0, HEADING_AT - READOUT_FADE],
  aspect: [BEATS.form[0], BEATS.form[1]],
  viscosity: [BEATS.form[0], BEATS.set[1]],
  colour: [BEATS.set[0], BEATS.set[1]],
  clarity: [BEATS.clear[0], BEATS.clear[1]],
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
