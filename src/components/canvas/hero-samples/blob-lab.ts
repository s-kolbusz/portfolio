/**
 * The live site's blob, with a few things it does not do yet, each behind a
 * dial. With every dial at zero this is the production hero at rest: the
 * same radius, the same cursor ball, the same follow.
 *
 * What the dials add is how the body answers the cursor ball: it leans after
 * the pointer, takes a gulp when the ball goes in, and the ball itself draws
 * out along its way. All of it is a handful of springs; the shader only
 * draws what they say.
 */

export interface BlobLabParams {
  /** How far the outline wanders from a circle (0–1). */
  mutate: number
  /** How fast it wanders (1 = the proposed pace). */
  mutateSpeed: number
  /** How strongly the body answers to swallowing the ball (0–1). */
  gulp: number
  /** How much the ball draws out along its motion (0–1). */
  stretch: number
  /** How far the body leans after the pointer (0–1). */
  lean: number
  /** 0 heavy and damped, 1 lively and springy. */
  spring: number
}

/** The blob exactly as on the live site. */
export const PRODUCTION: BlobLabParams = {
  mutate: 0,
  mutateSpeed: 1,
  gulp: 0,
  stretch: 0,
  lean: 0,
  spring: 0.4,
}

/** The owner's own setting after his first sitting with the dials (2026-11-15). */
export const PROPOSAL: BlobLabParams = {
  mutate: 0.7,
  mutateSpeed: 1.5,
  gulp: 0.5,
  stretch: 1,
  lean: 0.25,
  spring: 0,
}

export const PARAM_KEYS = Object.keys(PRODUCTION) as Array<keyof BlobLabParams>

export interface BlobLabState {
  ready: boolean
  ballX: number
  ballY: number
  ballVX: number
  ballVY: number
  /** How much of the ball the body has taken in (0–1). */
  absorbed: number
  inside: boolean
  /** The body's size and shape after a gulp: two damped springs. */
  swell: number
  swellV: number
  squash: number
  squashV: number
  gulpX: number
  gulpY: number
  /** The body's lean, in px, and its speed. */
  leanX: number
  leanY: number
  leanVX: number
  leanVY: number
  /** The outline's own clock, so changing its pace never makes it jump. */
  phase: number
}

export function createBlobLabState(): BlobLabState {
  return {
    ready: false,
    ballX: 0,
    ballY: 0,
    ballVX: 0,
    ballVY: 0,
    absorbed: 0,
    inside: true,
    swell: 0,
    swellV: 0,
    squash: 0,
    squashV: 0,
    gulpX: 1,
    gulpY: 0,
    leanX: 0,
    leanY: 0,
    leanVX: 0,
    leanVY: 0,
    phase: 0,
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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

/** One damped spring towards `target`, stepped finely enough to stay stable. */
function spring(
  value: number,
  speed: number,
  target: number,
  hertz: number,
  damping: number,
  delta: number
): [number, number] {
  const omega = hertz * 2 * Math.PI
  const steps = Math.max(1, Math.ceil(delta * 120))
  const dt = delta / steps
  for (let step = 0; step < steps; step++) {
    speed += (-omega * omega * (value - target) - 2 * damping * omega * speed) * dt
    value += speed * dt
  }
  return [value, speed]
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

  // --- The body leans after the pointer, with weight: late, and a little past. ---
  const lively = clamp01(params.spring)
  let leanTargetX = 0
  let leanTargetY = 0
  if (pointer.active && params.lean > 0) {
    const toX = pointer.x - restX
    const toY = pointer.y - restY
    const far = Math.hypot(toX, toY) || 1
    const gap = far - baseRadius
    // Strongest when the pointer is at its rim; it lets go of what is far away.
    const near = gap > 0 ? Math.exp(-((gap / (unit * scale * 0.9)) ** 2)) : 1
    const pull = params.lean * 0.22 * unit * scale * Math.min(1, far / baseRadius) * near
    leanTargetX = (toX / far) * pull
    leanTargetY = (toY / far) * pull
  }
  const leanHz = 0.9 + lively * 0.6
  const leanDamping = 0.6 - lively * 0.3
  ;[state.leanX, state.leanVX] = spring(
    state.leanX,
    state.leanVX,
    leanTargetX,
    leanHz,
    leanDamping,
    delta
  )
  ;[state.leanY, state.leanVY] = spring(
    state.leanY,
    state.leanVY,
    leanTargetY,
    leanHz,
    leanDamping,
    delta
  )
  const centerX = restX + state.leanX
  const centerY = restY + state.leanY

  // --- Where the ball is relative to the body. ---
  const fromX = state.ballX - centerX
  const fromY = state.ballY - centerY
  const distance = Math.hypot(fromX, fromY)
  const outX = distance > 1e-3 ? fromX / distance : state.gulpX
  const outY = distance > 1e-3 ? fromY / distance : state.gulpY
  /** The ball's centre to the body's rim (negative inside). */
  const depth = distance - baseRadius

  // --- The gulp: going in sets the body ringing; what it took in makes it larger. ---
  const gulpHz = 1.6 + lively * 1.2
  const gulpDamping = 0.5 - lively * 0.32
  const nowInside = depth < 0
  if (nowInside !== state.inside) {
    state.inside = nowInside
    if (state.ready && params.gulp > 0) {
      // How hard depends on how fast the ball crossed the rim.
      const crossing = Math.abs(state.ballVX * outX + state.ballVY * outY) / (unit * 2)
      const hit = params.gulp * Math.min(1.5, Math.max(0.3, crossing)) * (nowInside ? 1 : -0.5)
      // (A push sized so the spring swings out by about `hit`.)
      state.swellV += hit * gulpHz * 2 * Math.PI
      state.squashV += hit * gulpHz * 0.8 * 2 * Math.PI
      state.gulpX = outX
      state.gulpY = outY
    }
  }
  const takenIn = smooth(0.3 * ballRadius, -0.7 * ballRadius, depth)
  state.absorbed += (takenIn - state.absorbed) * ease(0.25)
  ;[state.swell, state.swellV] = spring(state.swell, state.swellV, 0, gulpHz, gulpDamping, delta)
  ;[state.squash, state.squashV] = spring(
    state.squash,
    state.squashV,
    0,
    gulpHz * 0.8,
    gulpDamping,
    delta
  )
  const grown = Math.sqrt(
    baseRadius * baseRadius + params.gulp * state.absorbed * ballRadius * ballRadius
  )

  // --- The ball draws out along its way. ---
  const pace = Math.hypot(state.ballVX, state.ballVY)
  const stretch = params.stretch * 0.45 * clamp01(pace / (unit * 3))

  state.phase += delta * params.mutateSpeed

  return {
    centerX,
    centerY,
    radius: grown * (1 + state.swell * 0.06),
    squashX: state.gulpX,
    squashY: state.gulpY,
    squash: Math.max(-0.3, Math.min(0.3, state.squash * 0.12)),
    ballX: state.ballX,
    ballY: state.ballY,
    ballRadius,
    merge,
    stretchX: pace > 1e-3 ? state.ballVX / pace : 1,
    stretchY: pace > 1e-3 ? state.ballVY / pace : 0,
    stretch,
    mutate: clamp01(params.mutate) * 0.22,
    phase: state.phase,
  }
}
