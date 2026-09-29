import type { ChoreographyFrame } from './choreography'

/** What the blob canvas reports each frame for the scene's readouts. */
export interface SignatureFrame {
  step: ChoreographyFrame
  startColour: readonly [number, number, number]
  targetColour: readonly [number, number, number]
  /** The cursor ball in viewport px (the hero's letters answer to it). */
  ball: { x: number; y: number; radius: number }
}

type Listener = (frame: SignatureFrame | null) => void

/**
 * The final act's page move, played in time by the scene (0 in the middle of
 * the frame → 1 in place) and read by the canvas, so the image it draws and
 * the DOM image move together. null while the scene is not driving it.
 */
export const signatureAct: {
  placed: number | null
  /**
   * True while the final act plays its exit. The story then waits at the
   * act's threshold, so the page does not sink back into the water before
   * the heading has hidden behind it; afterwards it glides on to the scroll.
   */
  exiting: boolean
} = { placed: null, exiting: false }

const listeners = new Set<Listener>()

/** `null` means the canvas is gone (unmounted, no WebGL): readouts should hide. */
export function publishSignature(frame: SignatureFrame | null) {
  for (const listener of listeners) listener(frame)
}

export function subscribeSignature(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** DOM hooks shared by the scene (which renders them) and the canvas (which reads them). */
export const SIGNATURE_TRACK_SELECTOR = '[data-signature-track]'
export const SIGNATURE_STAGE_SELECTOR = '[data-signature-stage]'
export const SIGNATURE_FRAME_SELECTOR = '[data-signature-frame]'
/** Text blocks in the scene the cursor ball sinks beneath, to keep them legible. */
export const SIGNATURE_TEXT_SELECTOR = '[data-signature-text]'
/** CSS custom property on the frame: opacity of its real image, 0–1. */
export const SIGNATURE_REVEAL_VAR = '--signature-reveal'
/** Set on the track when the canvas cannot run: the pin collapses to a plain section. */
export const SIGNATURE_STATIC_ATTR = 'data-signature-static'

/** Hero hooks: the pinned hero, the name and its letters. */
export const HERO_TRACK_SELECTOR = '[data-hero-track]'
export const HERO_STAGE_SELECTOR = '[data-hero-stage]'
export const HERO_NAME_SELECTOR = '[data-hero-name]'
export const HERO_CHAR_SELECTOR = '[data-hero-char]'
/** Set on the hero track when the canvas cannot run: the hero is not pinned. */
export const HERO_STATIC_ATTR = 'data-hero-static'
/**
 * Fixed chrome (docks, cursor) that takes the palette of what is under it:
 * over the dark water sheet it switches to the dark theme's tokens. The
 * value "pointer" means: judge by the pointer's position, not the element's.
 */
export const ADAPT_THEME_SELECTOR = '[data-adapt-theme]'
