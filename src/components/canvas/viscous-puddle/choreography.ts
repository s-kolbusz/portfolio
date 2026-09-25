/**
 * Signature transition: the hero blob sets into the stronypodhale.pl page.
 * Script: docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
 *
 * Everything here is a pure function of the scroll position and measured
 * layout, so fast or slow scrolling, reversing and stopping half-way all land
 * on the same picture. All positions are CSS pixels in viewport space.
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

export interface ChoreographyInput {
  scrollY: number
  viewportWidth: number
  viewportHeight: number
  /** The pinned stage, or null on pages without one. */
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

export interface Droplet {
  x: number
  y: number
  radius: number
  /** Smooth-union width in px: large while attached, 0 once it has pinched off. */
  merge: number
}

export interface ChoreographyFrame {
  /** Pin progress P, 0–1. */
  progress: number
  /** Readout value: 0.82 liquid → 0 set. */
  viscosity: number
  /** viscosity / 0.82: drives drift, breathing, cursor and ripple. */
  fluid: number
  /** Colour shift from the blob green to the page's own colour, 0–1. */
  solid: number
  /** How much of the image shows through the matter, 0–1. */
  imageIn: number
  /** Solidification front, 0 = none, 1 = whole image set. */
  front: number
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
  /** Detached droplet, or null before it forms. */
  droplet: Droplet | null
  /** False when nothing on the canvas is visible and rendering can stop. */
  active: boolean
}

export const VISCOSITY_START = 0.82

/** Beat boundaries on the pin progress P (see the script's frame table). */
export const BEATS = {
  enter: [0, 0.1],
  form: [0.1, 0.45],
  set: [0.45, 0.7],
  transform: [0.6, 0.92],
  rest: [0.92, 1],
  droplet: [0.5, 0.66],
} as const

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

/** Readout: 0.82 → 0.30 while forming, → 0.05 while setting, → 0 by the rest beat. */
export function viscosityAt(progress: number) {
  if (progress <= BEATS.form[0]) return VISCOSITY_START
  if (progress <= BEATS.form[1]) return mix(VISCOSITY_START, 0.3, linear(...BEATS.form, progress))
  if (progress <= BEATS.set[1]) return mix(0.3, 0.05, linear(...BEATS.set, progress))
  return mix(0.05, 0, linear(BEATS.set[1], BEATS.rest[0], progress))
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

export function dropletRadius(viewportHeight: number) {
  return Math.min(36, Math.max(12, viewportHeight * 0.028))
}

function droplet(progress: number, box: Rect, viewportHeight: number): Droplet | null {
  if (progress < BEATS.droplet[0]) return null
  const radius = dropletRadius(viewportHeight)
  const t = easeInOutCubic(linear(...BEATS.droplet, progress))
  const right = box.left + box.width
  const bottom = box.top + box.height
  return {
    // Buds from inside the bottom-right corner and settles just below it.
    x: mix(right - radius * 2.5, right - radius, t),
    y: mix(bottom - radius * 2.5, bottom + radius * 3, t),
    radius,
    merge: mix(radius * 3, 0, t),
  }
}

export function choreograph({
  scrollY,
  viewportWidth,
  viewportHeight,
  stage,
  scale,
}: ChoreographyInput): ChoreographyFrame {
  const radius = 0.75 * (viewportHeight / 2) * scale

  if (!stage) {
    return {
      progress: 0,
      viscosity: VISCOSITY_START,
      fluid: 1,
      solid: 0,
      imageIn: 0,
      front: 0,
      reveal: 0,
      body: true,
      centerX: viewportWidth / 2,
      centerY: viewportHeight / 2 + scrollY * 0.15,
      halfWidth: radius,
      halfHeight: radius,
      cornerRadius: radius,
      box: { left: 0, top: 0, width: 0, height: 0 },
      droplet: null,
      active: scrollY < viewportHeight * 1.5,
    }
  }

  const progress = pinProgress(scrollY, stage)
  const box = boxRect(scrollY, stage)
  const viscosity = viscosityAt(progress)
  const form = easeInOutCubic(linear(...BEATS.form, progress))
  const reveal = smoothstep(0.94, 0.97, progress)
  const drop = droplet(progress, box, viewportHeight)

  // Before the pin the blob waits mid-viewport while the hero text leaves;
  // the box rises to meet it and the two coincide as the pin starts.
  const boxCenterY = box.top + box.height / 2
  const dropletOnScreen =
    drop !== null && drop.y + drop.radius > 0 && drop.y - drop.radius < viewportHeight

  return {
    progress,
    viscosity,
    fluid: viscosity / VISCOSITY_START,
    solid: easeInOutCubic(linear(...BEATS.set, progress)),
    imageIn: smoothstep(0.58, 0.7, progress),
    front: easeInOutCubic(linear(...BEATS.transform, progress)),
    reveal,
    body: reveal < 1,
    centerX: box.left + box.width / 2,
    centerY: Math.min(viewportHeight / 2, boxCenterY),
    halfWidth: mix(radius, box.width / 2, form),
    halfHeight: mix(radius, box.height / 2, form),
    // One shape throughout: corners only ever tighten, never sharper than the box.
    cornerRadius: mix(radius, stage.box.radius, smoothstep(BEATS.form[0], BEATS.set[1], progress)),
    box,
    droplet: drop,
    active: reveal < 1 || dropletOnScreen,
  }
}

export type ReadoutKey = 'target' | 'viscosity' | 'aspect' | 'colour' | 'solidified'

/** Which beat each readout narrates: [fade in from, fade out from]. */
const READOUT_WINDOWS: Record<ReadoutKey, [number, number]> = {
  target: [0, 0.92],
  viscosity: [0.1, 0.66],
  aspect: [0.1, 0.45],
  colour: [0.45, 0.7],
  solidified: [0.6, 0.92],
}

const READOUT_FADE = 0.05

/** Opacity of each readout at pin progress P. Phones keep the target plus the latest one. */
export function readoutOpacity(progress: number, compact: boolean): Record<ReadoutKey, number> {
  const entries = Object.entries(READOUT_WINDOWS) as Array<[ReadoutKey, [number, number]]>
  const result = {} as Record<ReadoutKey, number>
  for (const [key, [from, until]] of entries) {
    // The pin start itself shows the target at once; others fade in on their beat.
    const fadeIn = from === 0 ? (progress > 0 ? 1 : 0) : linear(from, from + READOUT_FADE, progress)
    result[key] = Math.min(fadeIn, 1 - linear(until, until + READOUT_FADE, progress))
  }
  if (compact) {
    const latest = entries
      .filter(([key, [from]]) => key !== 'target' && progress >= from && result[key] > 0)
      .at(-1)?.[0]
    for (const [key] of entries) {
      if (key !== 'target' && key !== latest) result[key] = 0
    }
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
