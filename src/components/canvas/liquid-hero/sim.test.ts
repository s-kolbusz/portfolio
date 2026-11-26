import { describe, expect, it } from 'vitest'

import { createSim } from './sim'

const frame = { width: 60, height: 36, center: { x: 30, y: 18 }, radius: 5 }

function extent(sim: ReturnType<typeof createSim>) {
  let minX = Infinity,
    maxX = -Infinity
  for (let i = 0; i < sim.N - sim.rebelN; i++) {
    minX = Math.min(minX, sim.x[i])
    maxX = Math.max(maxX, sim.x[i])
  }
  return maxX - minX
}

describe('createSim', { timeout: 30_000 }, () => {
  it('fills the body disk and adds the cursor drop at the end', () => {
    const sim = createSim({ ...frame, rebelAt: { x: 12, y: 26 } })
    expect(sim.rebelN).toBeGreaterThan(0)
    expect(sim.N).toBeGreaterThan(sim.rebelN * 5)
    // the cursor drop's particles are the last rebelN ones
    expect(sim.x[sim.N - 1]).toBeLessThan(20)
    expect(sim.P.rho0).toBeGreaterThan(0)
  })

  it('stays whole and finite at rest', () => {
    const sim = createSim(frame)
    for (let i = 0; i < 120; i++) sim.step()
    expect(Array.from(sim.x).every(Number.isFinite)).toBe(true)
    expect(sim.state.pieces).toBe(0)
    expect(sim.state.mainMass).toBe(sim.N)
  })

  it('spreads out when the transition releases it', () => {
    const still = createSim(frame)
    const spread = createSim(frame)
    spread.P.spread = 1
    for (let i = 0; i < 150; i++) {
      still.step()
      spread.step()
    }
    expect(extent(spread)).toBeGreaterThan(extent(still) * 1.2)
  })

  it('splashes away from a click and takes bigger steps in light mode', () => {
    const sim = createSim({ ...frame, rebelAt: { x: 30, y: 18 } })
    sim.P.light = true
    Object.assign(sim.cur, { x: 30, y: 18, inside: true, down: true, impulse: 1 })
    sim.step(4)
    expect(Array.from(sim.vx).some((v) => Math.abs(v) > 0.01)).toBe(true)
    expect(sim.cur.impulse).toBe(0)
    for (let i = 0; i < 30; i++) sim.step(4)
    expect(Array.from(sim.y).every(Number.isFinite)).toBe(true)
  })
})
