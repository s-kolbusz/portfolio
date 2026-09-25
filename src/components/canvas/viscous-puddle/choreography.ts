/**
 * Signature transition maths: the hero blob pours into the first scene's frame.
 *
 * Everything here is a pure function of the scroll position and the measured
 * layout, so fast scrolling, slow scrolling, reversing and stopping half-way
 * all land on the same picture. All values are CSS pixels in viewport space.
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
  /** Raw 0–1 scroll progress from hero to frame centred in the viewport. */
  progress: number
  /** SDF blend weight: 0 = metaball, 1 = rounded rectangle. */
  shape: number
  centerX: number
  centerY: number
  /** Metaball radius. */
  radius: number
  /** Rounded-rectangle half extents and corner radius. */
  halfWidth: number
  halfHeight: number
  cornerRadius: number
  /** Opacity of the real DOM image laid over the finished rectangle. */
  reveal: number
  /** True once the DOM image fully covers the shape and the canvas can sleep. */
  settled: boolean
}

/** Share of the scroll range before the blob starts to react. */
const START = 0.08
/** Share of the scroll range where the DOM image starts fading in. */
const REVEAL_FROM = 0.9

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

/** Scroll position at which the frame sits centred in the viewport. */
export function settleScroll(frame: FrameRect, viewportHeight: number) {
  return Math.max(1, frame.docTop + frame.height / 2 - viewportHeight / 2)
}

export function computeProgress(scrollY: number, frame: FrameRect | null, viewportHeight: number) {
  if (!frame) return 0
  const end = settleScroll(frame, viewportHeight)
  return clamp01((scrollY / end - START) / (1 - START))
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
  const unit = blobUnit(viewportHeight)
  const radius = 0.75 * unit * scale

  // At rest the blob sits in the middle of the hero and sinks slowly, so the
  // scene rising from below meets it part-way.
  const homeX = viewportWidth / 2
  const homeY = viewportHeight / 2 + scrollY * 0.15

  const progress = computeProgress(scrollY, frame, viewportHeight)

  if (!frame) {
    return {
      progress: 0,
      shape: 0,
      centerX: homeX,
      centerY: homeY,
      radius,
      halfWidth: radius,
      halfHeight: radius,
      cornerRadius: radius,
      reveal: 0,
      settled: scrollY > viewportHeight * 1.5,
    }
  }

  const move = easeInOutCubic(progress)
  const shape = smoothstep(0.15, 0.97, progress)

  const frameCenterX = frame.left + frame.width / 2
  // While the frame is still low, aim no lower than just below the middle so
  // the shape never drains out of the viewport. The clamp lets go before the
  // end, when the frame itself rises to the centre.
  const frameCenterY = Math.min(frame.docTop - scrollY + frame.height / 2, viewportHeight * 0.6)

  return {
    progress,
    shape,
    centerX: mix(homeX, frameCenterX, move),
    centerY: mix(homeY, frameCenterY, move),
    radius,
    halfWidth: mix(radius, frame.width / 2, move),
    halfHeight: mix(radius, frame.height / 2, move),
    cornerRadius: mix(radius, frame.radius, move),
    reveal: smoothstep(REVEAL_FROM, 1, progress),
    settled: progress >= 1,
  }
}
