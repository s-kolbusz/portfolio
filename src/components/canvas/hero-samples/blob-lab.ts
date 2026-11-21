import {
  type BlobCharacter,
  type CharacterState,
  createCharacterState,
  PLAIN,
  stepCharacter,
  TUNED,
} from '@/components/canvas/viscous-puddle/character'

/**
 * The bench for the live site's blob: the hero's blob at rest (the same
 * radius, the same cursor ball, the same follow) with the blob's character
 * (viscous-puddle/character.ts) behind dials. With every dial at zero it is
 * the blob the site had before; what is tuned here is what the site runs.
 */

export type BlobLabParams = BlobCharacter

/** The blob as it was before it had a character. */
export const PRODUCTION: BlobLabParams = PLAIN

/** The owner's own setting, the one the live site runs. */
export const PROPOSAL: BlobLabParams = TUNED

export const PARAM_KEYS = Object.keys(PRODUCTION) as Array<keyof BlobLabParams>

export interface BlobLabState {
  ready: boolean
  ballX: number
  ballY: number
  ballVX: number
  ballVY: number
  character: CharacterState
}

export function createBlobLabState(): BlobLabState {
  return {
    ready: false,
    ballX: 0,
    ballY: 0,
    ballVX: 0,
    ballVY: 0,
    character: createCharacterState(),
  }
}

export interface BlobLabInput {
  /** Seconds since the last frame. */
  delta: number
  viewportWidth: number
  viewportHeight: number
  /** The live site's size factor: 1, or 0.6 on a phone. */
  scale: number
  pointer: { x: number; y: number; active: boolean }
  params: BlobLabParams
}

export interface BlobLabFrame {
  centerX: number
  centerY: number
  radius: number
  /** Direction and amount the body is drawn out along (after a gulp). */
  squashX: number
  squashY: number
  squash: number
  ballX: number
  ballY: number
  ballRadius: number
  /** Smooth-union width of body and ball, px. */
  merge: number
  /** Direction and amount the ball is drawn out along. */
  stretchX: number
  stretchY: number
  stretch: number
  mutate: number
  phase: number
}

export function stepBlobLab(state: BlobLabState, input: BlobLabInput): BlobLabFrame {
  const { delta, viewportWidth, viewportHeight, scale, pointer, params } = input
  const unit = viewportHeight / 2
  const baseRadius = 0.75 * unit * scale
  const ballRadius = 0.25 * unit * scale
  const merge = 0.6 * unit * scale
  const restX = viewportWidth / 2
  const restY = viewportHeight / 2
  const ease = (seconds: number) => (delta > 0 ? 1 - Math.exp(-delta / seconds) : 0)

  // The ball chases the pointer exactly as on the live site, or rests in the body.
  const targetX = pointer.active ? pointer.x : restX
  const targetY = pointer.active ? pointer.y : restY
  if (!state.ready) {
    state.ready = true
    state.ballX = targetX
    state.ballY = targetY
  }
  const lastX = state.ballX
  const lastY = state.ballY
  state.ballX += (targetX - state.ballX) * ease(0.27)
  state.ballY += (targetY - state.ballY) * ease(0.27)
  if (delta > 0) {
    state.ballVX += ((state.ballX - lastX) / delta - state.ballVX) * ease(0.15)
    state.ballVY += ((state.ballY - lastY) / delta - state.ballVY) * ease(0.15)
  }

  const character = stepCharacter(state.character, {
    delta,
    unit,
    scale,
    loose: 1,
    restX,
    restY,
    radius: baseRadius,
    ball: {
      x: state.ballX,
      y: state.ballY,
      vx: state.ballVX,
      vy: state.ballVY,
      radius: ballRadius,
    },
    pointer,
    character: params,
  })

  return {
    centerX: restX + character.leanX,
    centerY: restY + character.leanY,
    radius: baseRadius * character.grow,
    squashX: character.squashX,
    squashY: character.squashY,
    squash: character.squash,
    ballX: state.ballX,
    ballY: state.ballY,
    ballRadius,
    merge,
    stretchX: character.stretchX,
    stretchY: character.stretchY,
    stretch: character.stretch,
    mutate: character.mutate,
    phase: character.phase,
  }
}
