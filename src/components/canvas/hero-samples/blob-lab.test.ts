import { describe, expect, it } from 'vitest'

import {
  type BlobLabParams,
  createBlobLabState,
  PRODUCTION,
  PROPOSAL,
  stepBlobLab,
} from './blob-lab'

const view = { viewportWidth: 1200, viewportHeight: 800, scale: 1 }
const unit = 400
const radius = 0.75 * unit
const centre = { x: 600, y: 400 }

/** Play `seconds` with the pointer where `at` puts it; returns every frame. */
function play(
  params: BlobLabParams,
  seconds: number,
  at: (time: number) => { x: number; y: number; active: boolean },
  state = createBlobLabState()
) {
  const frames = []
  for (let n = 0; n < seconds * 60; n++) {
    frames.push(stepBlobLab(state, { ...view, delta: 1 / 60, pointer: at(n / 60), params }))
  }
  return { frames, state, last: frames[frames.length - 1]! }
}

const away = () => ({ x: 0, y: 0, active: false })
const fixed = (x: number, y: number) => () => ({ x, y, active: true })

describe('stepBlobLab', () => {
  it('is the live blob when every dial is at zero', () => {
    const { last } = play(PRODUCTION, 2, fixed(1100, 400))
    expect(last.centerX).toBe(centre.x)
    expect(last.centerY).toBe(centre.y)
    expect(last.radius).toBeCloseTo(radius, 6)
    expect(last.ballRadius).toBeCloseTo(0.25 * unit, 6)
    expect(last.merge).toBeCloseTo(0.6 * unit, 6)
    expect(last.thread).toBe(0)
    expect(last.stretch).toBe(0)
    expect(last.squash).toBeCloseTo(0, 6)
    expect(last.mutate).toBe(0)
  })

  it('lets the ball chase the pointer as on the live site, and rest in the body without one', () => {
    const state = createBlobLabState()
    // It starts where it is asked to be, then covers about two thirds of the way in 0.27 s.
    play(PRODUCTION, 1 / 60, away, state)
    const chasing = play(PRODUCTION, 0.27, fixed(1100, 400), state)
    const covered = (chasing.last.ballX - centre.x) / 500
    expect(covered).toBeGreaterThan(0.55)
    expect(covered).toBeLessThan(0.72)
    const home = play(PRODUCTION, 3, away, state)
    expect(home.last.ballX).toBeCloseTo(centre.x, 0)
  })

  it('leans the body after the pointer, late and a little past', () => {
    const params = { ...PRODUCTION, lean: 1, spring: 1 }
    const { frames, last } = play(params, 4, fixed(centre.x + radius, centre.y))
    const reached = last.centerX - centre.x
    expect(reached).toBeGreaterThan(40)
    expect(frames[3]!.centerX - centre.x).toBeLessThan(reached * 0.2)
    expect(Math.max(...frames.map((frame) => frame.centerX - centre.x))).toBeGreaterThan(
      reached * 1.05
    )
    expect(last.centerY).toBeCloseTo(centre.y, 3)
    // A pointer far away is let go of.
    const far = play(params, 4, fixed(centre.x + radius * 4, centre.y))
    expect(far.last.centerX - centre.x).toBeLessThan(reached * 0.2)
  })

  it('reaches for the ball as it nears and holds on for a while as it leaves', () => {
    const params = { ...PRODUCTION, reach: 1 }
    const state = createBlobLabState()
    const outside = centre.x + radius + 0.25 * unit + 400
    const near = centre.x + radius + 0.25 * unit + 30
    expect(play(params, 2, fixed(outside, centre.y), state).last.thread).toBeLessThan(0.5)
    const reaching = play(params, 2, fixed(near, centre.y), state)
    expect(reaching.last.thread).toBeGreaterThan(20)
    // Pulled away fast: the bridge is still there at first, thinner, then gone.
    const leaving = play(params, 3, fixed(outside, centre.y), state)
    expect(leaving.frames[20]!.thread).toBeGreaterThan(1)
    expect(leaving.frames[20]!.thread).toBeLessThan(reaching.last.thread)
    expect(leaving.last.thread).toBeLessThan(0.5)
  })

  it('takes a gulp: the body rings when the ball goes in and is larger for what it took', () => {
    const params = { ...PRODUCTION, gulp: 1, spring: 1 }
    const state = createBlobLabState()
    play(params, 2, fixed(centre.x + radius * 2.4, centre.y), state)
    const going = play(params, 1.5, fixed(centre.x, centre.y), state)
    const sizes = going.frames.map((frame) => frame.radius)
    expect(Math.max(...sizes)).toBeGreaterThan(radius * 1.04)
    expect(Math.max(...going.frames.map((frame) => Math.abs(frame.squash)))).toBeGreaterThan(0.02)
    expect(going.frames.some((frame) => frame.squash < -0.005)).toBe(true)
    // Settled with the ball inside: larger by the ball's area.
    const settled = play(params, 4, fixed(centre.x, centre.y), state)
    expect(settled.last.radius).toBeCloseTo(Math.hypot(radius, 0.25 * unit), 0)
    expect(settled.last.squash).toBeCloseTo(0, 2)
    // And it gives it back.
    const out = play(params, 5, fixed(centre.x + radius * 2.4, centre.y), state)
    expect(out.last.radius).toBeCloseTo(radius, 0)
  })

  it('draws the ball out along its way while it moves', () => {
    const params = { ...PRODUCTION, stretch: 1 }
    const state = createBlobLabState()
    play(params, 1, fixed(100, 400), state)
    const moving = play(params, 0.2, fixed(1100, 400), state)
    expect(moving.last.stretch).toBeGreaterThan(0.1)
    expect(moving.last.stretchX).toBeCloseTo(1, 3)
    expect(moving.last.stretchY).toBeCloseTo(0, 3)
    expect(play(params, 4, fixed(1100, 400), state).last.stretch).toBeLessThan(0.01)
  })

  it('keeps its own clock for the outline and stands still when time does', () => {
    const state = createBlobLabState()
    const params = { ...PROPOSAL, mutateSpeed: 2 }
    const { last } = play(params, 1, fixed(900, 300), state)
    expect(last.phase).toBeCloseTo(2, 5)
    expect(last.mutate).toBeCloseTo(PROPOSAL.mutate * 0.22, 6)
    const frozen = stepBlobLab(state, {
      ...view,
      delta: 0,
      pointer: { x: 100, y: 100, active: true },
      params,
    })
    expect(frozen.ballX).toBe(last.ballX)
    expect(frozen.phase).toBe(last.phase)
    expect(frozen.centerX).toBeCloseTo(last.centerX, 6)
  })
})
