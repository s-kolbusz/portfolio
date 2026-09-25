/**
 * Signature transition maths: the hero blob pours into the first scene's frame.
 *
 * Everything here is a pure function of the scroll position and the measured
 * layout, so fast scrolling, slow scrolling, reversing and stopping half-way
 * all land on the same picture. All values are CSS pixels in viewport space.
 *
 * The blob stays a blob until the frame is actually on screen, then it is one
 * shape throughout: a rounded box that starts as a circle (corner radius equal
 * to its half size) and only ever grows and tightens its corners, so it never
 * passes through a sharp-cornered state.
 */

export interface FrameRect {
  /** Left edge, viewport space (the frame never scrolls horizontally). */
  left: number
  /** Top edge in document space (`getBoundingClientRect().top + scrollY`). */
  docTop: number
  width: number
  height: number
  radius: number
}

export interface ChoreographyInput {
  scrollY: number
  viewportWidth: number
  viewportHeight: number
  /** Frame of the first scene, or null when the page has none. */
  frame: FrameRect | null
  /** Blob size multiplier (smaller on phones). */
  scale: number
}

export interface ChoreographyFrame {
  /** 0 until the frame enters the viewport, 1 once it sits centred. */
  progress: number
  /** How liquid the shape still is: 1 = hero blob, 0 = solid frame. */
  fluid: number
  centerX: number
  centerY: number
  /** Rounded-box half extents and corner radius (a circle when all equal). */
  halfWidth: number
  halfHeight: number
  cornerRadius: number
  /** Opacity of the real DOM image laid over the finished shape. */
  reveal: number
  /** True once the DOM image fully covers the shape and the canvas can sleep. */
  settled: boolean
}

/** Share of the morph where the DOM image starts fading in. */
const REVEAL_FROM = 0.85

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Scroll position at which the frame's top edge enters the viewport. */
export function enterScroll(frame: FrameRect, viewportHeight: number) {
  return Math.max(0, frame.docTop - viewportHeight)
}

/** Scroll position at which the frame sits centred in the viewport. */
export function settleScroll(frame: FrameRect, viewportHeight: number) {
  return Math.max(
    enterScroll(frame, viewportHeight) + 1,
    frame.docTop + frame.height / 2 - viewportHeight / 2
  )
}

export function computeProgress(scrollY: number, frame: FrameRect | null, viewportHeight: number) {
  if (!frame) return 0
  const start = enterScroll(frame, viewportHeight)
  const end = settleScroll(frame, viewportHeight)
  return clamp01((scrollY - start) / (end - start))
}

/** Unit the shader measures the blob in: half the viewport height. */
export function blobUnit(viewportHeight: number) {
  return viewportHeight / 2
}

export function choreograph({
  scrollY,
  viewportWidth,
  viewportHeight,
  frame,
  scale,
}: ChoreographyInput): ChoreographyFrame {
  const radius = 0.75 * blobUnit(viewportHeight) * scale

  // At rest the blob sits in the middle of the hero and sinks slowly.
  const homeX = viewportWidth / 2
  const homeY = viewportHeight / 2 + scrollY * 0.15

  if (!frame) {
    return {
      progress: 0,
      fluid: 1,
      centerX: homeX,
      centerY: homeY,
      halfWidth: radius,
      halfHeight: radius,
      cornerRadius: radius,
      reveal: 0,
      settled: scrollY > viewportHeight * 1.5,
    }
  }

  const progress = computeProgress(scrollY, frame, viewportHeight)
  const move = easeInOutCubic(progress)
  // Corners stay soft most of the way and only tighten at the very end.
  const corner = Math.pow(progress, 3)

  return {
    progress,
    fluid: 1 - smoothstep(0.55, 1, progress),
    centerX: mix(homeX, frame.left + frame.width / 2, move),
    centerY: mix(homeY, frame.docTop - scrollY + frame.height / 2, move),
    halfWidth: mix(radius, frame.width / 2, move),
    halfHeight: mix(radius, frame.height / 2, move),
    cornerRadius: mix(radius, frame.radius, corner),
    reveal: smoothstep(REVEAL_FROM, 1, progress),
    settled: progress >= 1,
  }
}
