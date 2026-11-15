import { describe, expect, it } from 'vitest'

import { createMould } from './matter-moulds'

/** A mask with two filled squares, left and right, on a 64 × 32 rectangle. */
function mask() {
  const width = 64
  const height = 32
  const data = new Uint8Array(width * height * 4)
  for (let y = 8; y < 24; y++) {
    for (let x = 0; x < width; x++) {
      if ((x >= 6 && x < 22) || (x >= 42 && x < 58)) data[(y * width + x) * 4 + 3] = 255
    }
  }
  return { data, width, height }
}

describe('createMould', () => {
  it('knows its shape', () => {
    const mould = createMould(mask(), { detail: 64, coarse: 16 })
    expect(mould.aspect).toBeCloseTo(0.5)
    expect(mould.coverage).toBeCloseTo((2 * 16 * 16) / (64 * 32), 2)
    const [u, v] = mould.pointInside()
    mould.wall(u, v)
    expect(mould.distance).toBeLessThan(0)
  })

  it('reads the wall: inside, outside, and which way is out', () => {
    const mould = createMould(mask(), { detail: 64, coarse: 16 })
    mould.wall(14 / 64, 16 / 64)
    expect(mould.distance).toBeLessThan(-0.08)
    // In the gap between the squares, nearer the left one: out is to the right.
    mould.wall(26 / 64, 16 / 64)
    expect(mould.distance).toBeGreaterThan(0.03)
    expect(mould.awayX).toBeGreaterThan(0.9)
    // Beyond the rectangle the distance keeps growing and out points away from it.
    mould.wall(-0.5, 0.25)
    expect(mould.distance).toBeGreaterThan(0.5)
    expect(mould.awayX).toBeLessThan(-0.9)
  })

  it('draws matter to the part that is still empty, and stops when both are full', () => {
    const mould = createMould(mask(), { detail: 64, coarse: 16 })
    const fill = (left: boolean, right: boolean) => {
      mould.count()
      const points: Array<[number, number]> = []
      for (let y = 9; y < 24; y += 2) {
        for (let x = 7; x < 22; x += 2) {
          if (left) points.push([x / 64, y / 64])
          if (right) points.push([(x + 36) / 64, y / 64])
        }
      }
      for (const [u, v] of points) mould.add(u, v, 1 / 128)
      for (let frame = 0; frame < 60; frame++) mould.settle(8)
    }
    fill(true, false)
    expect(mould.filled()).toBeGreaterThan(0.4)
    expect(mould.filled()).toBeLessThan(0.6)
    // From the middle, the pull is towards the empty right square.
    mould.thirst(0.5, 0.25)
    expect(mould.pull).toBeGreaterThan(0.1)
    expect(mould.towardsX).toBeGreaterThan(0.8)
    // The full square reads as full, the empty one as empty.
    mould.thirst(14 / 64, 16 / 64)
    expect(mould.fill).toBeGreaterThan(0.6)
    mould.thirst(50 / 64, 16 / 64)
    expect(mould.fill).toBeLessThan(0.1)

    fill(true, true)
    expect(mould.filled()).toBeGreaterThan(0.85)
    mould.thirst(0.5, 0.25)
    expect(mould.pull).toBeLessThan(0.05)
  })

  it('pulls only on what is near when given a reach', () => {
    const near = createMould(mask(), { detail: 64, coarse: 16, reach: 0.1 })
    const far = createMould(mask(), { detail: 64, coarse: 16 })
    for (const mould of [near, far]) {
      mould.count()
      for (let frame = 0; frame < 80; frame++) mould.settle(8)
    }
    near.thirst(0.5, 0.45)
    far.thirst(0.5, 0.45)
    expect(near.pull).toBeLessThan(far.pull)
  })

  it('opens part by part: a closed part neither draws matter nor counts as room', () => {
    const { data, width, height } = mask()
    const ids = new Uint8Array(width * height)
    for (let p = 0; p < ids.length; p++) {
      if (data[p * 4 + 3]) ids[p] = (p % width) / width < 0.5 ? 1 : 2
    }
    const mould = createMould({ data, width, height }, { detail: 64, coarse: 16, ids, parts: 2 })
    expect(mould.shares[0]! + mould.shares[1]!).toBeCloseTo(1, 5)
    // The wall says which part is nearest, inside it and beside it.
    mould.wall(0.22, 0.25)
    const left = mould.part
    mould.wall(0.78, 0.25)
    expect(mould.part).not.toBe(left)
    // Only the right part open: matter in the middle is drawn to the right.
    const open = [0, 0]
    open[1 - left] = 1
    mould.open(open)
    mould.count()
    mould.settle(200)
    mould.thirst(0.5, 0.25)
    expect(mould.pull).toBeGreaterThan(0)
    expect(mould.towardsX).toBeGreaterThan(0.5)
    expect(mould.filled()).toBe(0)
    // A drawing without parts ignores it.
    const plain = createMould(mask(), { detail: 64, coarse: 16 })
    plain.open([0])
    plain.wall(0.22, 0.25)
    expect(plain.part).toBe(-1)
  })
})
