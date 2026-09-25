import type { ChoreographyFrame } from './choreography'

/** What the blob canvas reports each frame for the scene's readouts. */
export interface SignatureFrame {
  step: ChoreographyFrame
  startColour: readonly [number, number, number]
  targetColour: readonly [number, number, number]
}

type Listener = (frame: SignatureFrame | null) => void

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
