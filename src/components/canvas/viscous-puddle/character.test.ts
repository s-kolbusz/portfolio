import { describe, expect, it } from 'vitest'

import {
  type BlobCharacter,
  type CharacterInput,
  createCharacterState,
  PLAIN,
  stepCharacter,
  TUNED,
} from './character'

const unit = 400
const radius = 300
const rest = { x: 600, y: 400 }

function play(
  seconds: number,
  character: BlobCharacter,
  at: (time: number) => Partial<CharacterInput>,
  state = createCharacterState()
) {
  const frames = []
  for (let n = 0; n < seconds * 60; n++) {
    frames.push(
      stepCharacter(state, {
        delta: 1 / 60,
        unit,
        scale: 1,
        loose: 1,
        restX: rest.x,
        restY: rest.y,
        radius,
        ball: { x: rest.x, y: rest.y, vx: 0, vy: 0, radius: 100 },
        pointer: { x: 0, y: 0, active: false },
        character,
        ...at(n / 60),
      })
    )
  }
  return { frames, state, last: frames[frames.length - 1]! }
}

const ballAt = (x: number, vx = 0) => ({ ball: { x, y: rest.y, vx, vy: 0, radius: 100 } })

describe('stepCharacter', () => {
  it('leaves the plain blob alone', () => {
    const { last } = play(2, PLAIN, () => ({
      ...ballAt(rest.x + 900, 2000),
      pointer: { x: rest.x + 300, y: rest.y, active: true },
    }))
    expect(last.leanX).toBeCloseTo(0, 6)
    expect(last.grow).toBeCloseTo(1, 6)
    expect(last.squash).toBeCloseTo(0, 6)
    expect(last.stretch).toBe(0)
    expect(last.mutate).toBe(0)
  })

  it('leans after the pointer and lets go of one that is far away', () => {
    const lively = { ...TUNED, lean: 1, spring: 1 }
    const near = play(4, lively, () => ({
      pointer: { x: rest.x + radius, y: rest.y, active: true },
    }))
    expect(near.last.leanX).toBeGreaterThan(40)
    expect(near.last.leanY).toBeCloseTo(0, 3)
    expect(Math.max(...near.frames.map((frame) => frame.leanX))).toBeGreaterThan(
      near.last.leanX * 1.05
    )
    const far = play(4, lively, () => ({
      pointer: { x: rest.x + radius * 4, y: rest.y, active: true },
    }))
    expect(far.last.leanX).toBeLessThan(near.last.leanX * 0.2)
  })

  it('takes a gulp when the ball goes in, is larger for it, and gives it back', () => {
    const state = createCharacterState()
    const lively = { ...TUNED, gulp: 1, spring: 1 }
    play(1, lively, () => ballAt(rest.x + 900), state)
    const going = play(1.5, lively, () => ballAt(rest.x, -1500), state)
    expect(Math.max(...going.frames.map((frame) => frame.grow))).toBeGreaterThan(1.04)
    expect(Math.max(...going.frames.map((frame) => Math.abs(frame.squash)))).toBeGreaterThan(0.02)
    const settled = play(4, lively, () => ballAt(rest.x), state)
    expect(settled.last.grow).toBeCloseTo(Math.hypot(radius, 100) / radius, 2)
    expect(settled.last.squash).toBeCloseTo(0, 2)
    const out = play(5, lively, () => ballAt(rest.x + 900), state)
    expect(out.last.grow).toBeCloseTo(1, 2)
  })

  it('draws the ball out along its way, by how fast it goes', () => {
    const moving = play(0.1, TUNED, () => ballAt(rest.x + 900, 1200)).last
    expect(moving.stretch).toBeCloseTo(0.45, 5)
    expect(moving.stretchX).toBe(1)
    expect(moving.stretchY).toBe(0)
    expect(play(0.1, TUNED, () => ballAt(rest.x + 900, 300)).last.stretch).toBeCloseTo(0.1125, 5)
  })

  it('acts only on the free blob: clinging to the name it is the shape the scroll gives it', () => {
    const { last } = play(3, { ...TUNED, lean: 1, gulp: 1 }, (time) => ({
      loose: 0,
      ...ballAt(time < 1 ? rest.x + 900 : rest.x, time < 1 ? 0 : -1500),
      pointer: { x: rest.x + radius, y: rest.y, active: true },
    }))
    expect(last.leanX).toBeCloseTo(0, 6)
    expect(last.grow).toBe(1)
    expect(last.squash).toBeCloseTo(0, 6)
    expect(last.mutate).toBe(0)
    // Half loose, half of it.
    const half = play(1, TUNED, () => ({ loose: 0.5 })).last
    expect(half.mutate).toBeCloseTo(TUNED.mutate * 0.22 * 0.5, 6)
  })

  it('keeps its own clock for the outline and stands still when time does', () => {
    const state = createCharacterState()
    const { last } = play(2, TUNED, () => ({}), state)
    expect(last.phase).toBeCloseTo(2 * TUNED.mutateSpeed, 5)
    expect(last.mutate).toBeCloseTo(TUNED.mutate * 0.22, 6)
    const frozen = stepCharacter(state, {
      delta: 0,
      unit,
      scale: 1,
      loose: 1,
      restX: rest.x,
      restY: rest.y,
      radius,
      ball: { x: rest.x + 900, y: rest.y, vx: 0, vy: 0, radius: 100 },
      pointer: { x: rest.x + radius, y: rest.y, active: true },
      character: TUNED,
    })
    expect(frozen.phase).toBe(last.phase)
    expect(frozen.leanX).toBeCloseTo(last.leanX, 6)
    expect(frozen.grow).toBeCloseTo(last.grow, 6)
  })
})
