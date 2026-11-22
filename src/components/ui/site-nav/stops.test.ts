import { describe, expect, it } from 'vitest'

import { STOPS, locate, stopBounds, stopShares } from './stops'

const VH = 900
// hero track is 4 screens; sections after it as measured on the home page at 1440×900
const TOPS = [3600, 4846, 7726, 8500, 9500, 10345, 11000, 12397, 13712]
const MAX = 15000 - VH

describe('stopBounds', () => {
  it('starts with the hero and the water sheet, then each section at the reading line', () => {
    const bounds = stopBounds(TOPS, VH, MAX)
    expect(bounds).toHaveLength(STOPS.length + 1)
    expect(bounds[0]).toBe(0)
    expect(bounds[1]).toBe(630)
    expect(bounds[2]).toBe(3600 - 360)
    expect(bounds[bounds.length - 1]).toBe(MAX)
  })

  it('stays increasing when sections are missing or out of order', () => {
    const bounds = stopBounds([100, 50, 50, 50, 50, 50, 50, 50, 50], VH, 0)
    for (let i = 1; i < bounds.length; i++) expect(bounds[i]).toBeGreaterThan(bounds[i - 1])
  })
})

describe('locate', () => {
  const bounds = stopBounds(TOPS, VH, MAX)

  it('is on the hero at the top of the page', () => {
    expect(locate(0, bounds)).toEqual({ index: 0, progress: 0 })
  })

  it('moves to stronypodhale.pl once the sheet has darkened', () => {
    expect(locate(700, bounds).index).toBe(1)
  })

  it('reports progress through the current stop', () => {
    const { index, progress } = locate((bounds[3] + bounds[4]) / 2, bounds)
    expect(index).toBe(3)
    expect(progress).toBeCloseTo(0.5)
  })

  it('ends on the last stop, fully travelled', () => {
    expect(locate(MAX + 500, bounds)).toEqual({ index: STOPS.length - 1, progress: 1 })
  })
})

describe('stopShares', () => {
  it('sums to one and gives every stop at least the floor before normalising', () => {
    const shares = stopShares(stopBounds(TOPS, VH, MAX))
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(Math.min(...shares)).toBeGreaterThan(0.04)
  })
})
