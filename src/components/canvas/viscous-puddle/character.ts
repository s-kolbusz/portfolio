/**
 * How the blob carries itself: what it does beyond lying there and rippling.
 * Its outline wanders on a large scale, it leans after the pointer with
 * weight, it takes a gulp when the cursor ball goes in and is larger for
 * what it took, and the ball draws out along its way. All of it is a
 * handful of springs; the shader only draws what they say.
 *
 * Shared by the live blob and by its tuning bench, so what is tuned on the
 * bench is what ships. With every dial at zero the blob is the one the site
 * had before.
 */

export interface BlobCharacter {
  /** How far the outline wanders from its shape (0–1). */
  mutate: number
  /** How fast it wanders (1 = the first proposed pace). */
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

/** The blob as it was before it had any of this. */
export const PLAIN: BlobCharacter = {
  mutate: 0,
  mutateSpeed: 1,
  gulp: 0,
  stretch: 0,
  lean: 0,
  spring: 0.4,
}

/** The owner's own setting, from his sitting with the dials on 2026-11-15. */
export const TUNED: BlobCharacter = {
  mutate: 0.7,
  mutateSpeed: 1.5,
  gulp: 0.5,
  stretch: 1,
  lean: 0.25,
  spring: 0,
}

export interface CharacterState {
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

export function createCharacterState(): CharacterState {
  return {
    absorbed: 0,
    // The ball starts in the body: no gulp for simply being there on load.
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

export interface CharacterInput {
  /** Seconds since the last frame (0 stands still). */
  delta: number
  /** Half the viewport height, the blob's own unit, and the site's size factor. */
  unit: number
  scale: number
  /**
   * How much the body is still the free blob (1), as opposed to clinging to
   * the name or lying as a sheet of water (0): nothing here acts on those.
   */
  loose: number
  /** Where the body rests (before it leans) and its radius, px. */
  restX: number
  restY: number
  radius: number
  ball: { x: number; y: number; vx: number; vy: number; radius: number }
  pointer: { x: number; y: number; active: boolean }
  character: BlobCharacter
}

export interface CharacterFrame {
  /** The body's lean away from its rest, px. */
  leanX: number
  leanY: number
  /** Factor on the body's size: what it has taken in, and the ring of a gulp. */
  grow: number
  /** Direction and amount the body is drawn out along (after a gulp). */
  squashX: number
  squashY: number
  squash: number
  /** Direction and amount the ball is drawn out along. */
  stretchX: number
  stretchY: number
  stretch: number
  /** How far the outline wanders (in blob units) and where its clock stands. */
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

export function stepCharacter(state: CharacterState, input: CharacterInput): CharacterFrame {
  const { delta, unit, scale, restX, restY, radius, ball, pointer, character } = input
  const loose = clamp01(input.loose)
  const lively = clamp01(character.spring)

  // --- The body leans after the pointer, with weight: late, and a little past. ---
  let leanTargetX = 0
  let leanTargetY = 0
  if (pointer.active && character.lean > 0 && loose > 0) {
    const toX = pointer.x - restX
    const toY = pointer.y - restY
    const far = Math.hypot(toX, toY) || 1
    const gap = far - radius
    // Strongest when the pointer is at its rim; it lets go of what is far away.
    const near = gap > 0 ? Math.exp(-((gap / (unit * scale * 0.9)) ** 2)) : 1
    const pull = character.lean * 0.22 * unit * scale * Math.min(1, far / radius) * near * loose
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

  // --- Where the ball is relative to the body. ---
  const fromX = ball.x - (restX + state.leanX)
  const fromY = ball.y - (restY + state.leanY)
  const distance = Math.hypot(fromX, fromY)
  const outX = distance > 1e-3 ? fromX / distance : state.gulpX
  const outY = distance > 1e-3 ? fromY / distance : state.gulpY
  /** The ball's centre to the body's rim (negative inside). */
  const depth = distance - radius

  // --- The gulp: going in sets the body ringing; what it took in makes it larger. ---
  const gulpHz = 1.6 + lively * 1.2
  const gulpDamping = 0.5 - lively * 0.32
  const nowInside = depth < 0
  if (nowInside !== state.inside) {
    state.inside = nowInside
    if (delta > 0 && character.gulp > 0 && loose > 0) {
      // How hard depends on how fast the ball crossed the rim.
      const crossing = Math.abs(ball.vx * outX + ball.vy * outY) / (unit * 2)
      const hit =
        character.gulp * Math.min(1.5, Math.max(0.3, crossing)) * (nowInside ? 1 : -0.5) * loose
      // (A push sized so the spring swings out by about `hit`.)
      state.swellV += hit * gulpHz * 2 * Math.PI
      state.squashV += hit * gulpHz * 0.8 * 2 * Math.PI
      state.gulpX = outX
      state.gulpY = outY
    }
  }
  const takenIn = smooth(0.3 * ball.radius, -0.7 * ball.radius, depth)
  const ease = delta > 0 ? 1 - Math.exp(-delta / 0.25) : 0
  state.absorbed += (takenIn - state.absorbed) * ease
  ;[state.swell, state.swellV] = spring(state.swell, state.swellV, 0, gulpHz, gulpDamping, delta)
  ;[state.squash, state.squashV] = spring(
    state.squash,
    state.squashV,
    0,
    gulpHz * 0.8,
    gulpDamping,
    delta
  )
  const grown =
    Math.sqrt(radius * radius + character.gulp * state.absorbed * ball.radius * ball.radius) /
    Math.max(radius, 1e-3)

  // --- The ball draws out along its way. ---
  const pace = Math.hypot(ball.vx, ball.vy)
  const stretch = character.stretch * 0.45 * clamp01(pace / (unit * 3))

  state.phase += delta * character.mutateSpeed

  return {
    leanX: state.leanX,
    leanY: state.leanY,
    grow: 1 + (grown * (1 + state.swell * 0.06) - 1) * loose,
    squashX: state.gulpX,
    squashY: state.gulpY,
    squash: Math.max(-0.3, Math.min(0.3, state.squash * 0.12)) * loose,
    stretchX: pace > 1e-3 ? ball.vx / pace : 1,
    stretchY: pace > 1e-3 ? ball.vy / pace : 0,
    stretch,
    mutate: clamp01(character.mutate) * 0.22 * loose,
    phase: state.phase,
  }
}
