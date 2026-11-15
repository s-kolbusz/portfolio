import { describe, expect, it } from 'vitest'

import { createFluid } from './matter-fluid'

const GOLDEN = 2.39996323
const SIZE = 6

/** A drop of `count` particles around (x, y), stretched along x. */
function drop(
  fluid: ReturnType<typeof createFluid>,
  from: number,
  count: number,
  x: number,
  y: number,
  stretch = 1
) {
  for (let k = 0; k < count; k++) {
    const i = from + k
    const radius = Math.sqrt((k + 0.5) / count) * SIZE * Math.sqrt(count / Math.PI)
    fluid.positions[i * 2] = x + radius * Math.cos(k * GOLDEN) * stretch
    fluid.positions[i * 2 + 1] = y + (radius * Math.sin(k * GOLDEN)) / stretch
    // No two particles the same size, as in the story (scattered, not graded across the drop).
    const scatter = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1
    fluid.sizes[i] = SIZE * (0.84 + 0.32 * scatter)
  }
}

function run(fluid: ReturnType<typeof createFluid>, frames: number) {
  for (let frame = 0; frame < frames; frame++) {
    fluid.cohere({ x: -300, y: -300, width: 600, height: 600 }, SIZE)
    fluid.step(1 / 120)
    fluid.step(1 / 120)
  }
}

function spread(fluid: ReturnType<typeof createFluid>) {
  let xx = 0
  let yy = 0
  for (let i = 0; i < fluid.count; i++) {
    xx += fluid.positions[i * 2]! ** 2
    yy += fluid.positions[i * 2 + 1]! ** 2
  }
  return { aspect: Math.sqrt(xx / yy), radius: Math.sqrt((xx + yy) / fluid.count) }
}

describe('createFluid', () => {
  it('keeps a drop at rest whole, calm and at its own size', () => {
    const fluid = createFluid(300)
    fluid.viscosity.fill(5)
    fluid.drag.fill(2)
    drop(fluid, 0, 300, 0, 0)
    const before = spread(fluid).radius
    run(fluid, 90)
    const after = spread(fluid)
    expect(after.radius).toBeGreaterThan(before * 0.8)
    expect(after.radius).toBeLessThan(before * 1.2)
    let speed = 0
    for (let i = 0; i < 300; i++) {
      speed += Math.hypot(fluid.velocities[i * 2]!, fluid.velocities[i * 2 + 1]!)
      expect(Number.isFinite(fluid.positions[i * 2]!)).toBe(true)
    }
    expect(speed / 300).toBeLessThan(SIZE * 4)
    // Inside the body the liquid is about full; pairs were found.
    expect(fluid.pairs()).toBeGreaterThan(300)
    expect(Math.max(...fluid.fullness)).toBeGreaterThan(0.8)
  })

  it('pulls a stretched drop round (surface tension)', () => {
    const fluid = createFluid(300)
    fluid.viscosity.fill(5)
    fluid.drag.fill(2)
    drop(fluid, 0, 300, 0, 0, 1.6)
    expect(spread(fluid).aspect).toBeGreaterThan(2.2)
    run(fluid, 60)
    expect(spread(fluid).aspect).toBeLessThan(1.6)
  })

  it('does not round a drop that is held (not loose)', () => {
    const fluid = createFluid(300)
    fluid.viscosity.fill(5)
    fluid.drag.fill(2)
    fluid.loose.fill(0)
    drop(fluid, 0, 300, 0, 0, 1.6)
    run(fluid, 60)
    expect(spread(fluid).aspect).toBeGreaterThan(1.7)
  })

  it('conserves momentum when two drops run into each other', () => {
    const fluid = createFluid(260)
    fluid.viscosity.fill(5)
    drop(fluid, 0, 180, -60, 0)
    drop(fluid, 180, 80, 60, 10)
    for (let i = 0; i < 260; i++) fluid.velocities[i * 2] = i < 180 ? 90 : -200
    const momentum = () => {
      let sum = 0
      for (let i = 0; i < 260; i++) sum += fluid.velocities[i * 2]!
      return sum / 260
    }
    const before = momentum()
    for (let frame = 0; frame < 60; frame++) {
      fluid.step(1 / 120)
      fluid.step(1 / 120)
    }
    expect(momentum()).toBeCloseTo(before, 0)
    // They have become one body: no particle is left far from the rest.
    let farthest = 0
    for (let i = 0; i < 260; i++) {
      farthest = Math.max(
        farthest,
        Math.hypot(fluid.positions[i * 2]!, fluid.positions[i * 2 + 1]!)
      )
    }
    expect(farthest).toBeLessThan(140)
  })

  it('follows what pulls on it and what holds it back', () => {
    const fluid = createFluid(2)
    fluid.sizes.fill(SIZE)
    fluid.positions.set([0, 0, 500, 0])
    fluid.accelerations.set([0, 600, 0, 600])
    fluid.drag.set([0, 30])
    for (let frame = 0; frame < 30; frame++) fluid.step(1 / 60)
    expect(fluid.positions[1]!).toBeGreaterThan(60)
    expect(fluid.positions[3]!).toBeLessThan(fluid.positions[1]! / 2)
    fluid.step(0)
    expect(fluid.fullness[0]).toBe(0)
  })
})
