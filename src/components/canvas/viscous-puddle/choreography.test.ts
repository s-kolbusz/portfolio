import { describe, expect, it } from 'vitest'

import {
  boxRect,
  choreograph,
  mixColour,
  readoutOpacity,
  toHex,
  viscosityAt,
  type StageLayout,
} from './choreography'

const viewport = { viewportWidth: 1440, viewportHeight: 900 }
// 1440×900: hero 900px, then a 2.5-screen pin; the box sits centred in the stage.
const stage: StageLayout = {
  trackDocTop: 900,
  pinDistance: 2250,
  box: { left: 160, offsetTop: 135, width: 1120, height: 630, radius: 16 },
}
const pinEnd = stage.trackDocTop + stage.pinDistance

function at(scrollY: number) {
  return choreograph({ ...viewport, scrollY, stage, scale: 1 })
}

function atProgress(progress: number) {
  return at(stage.trackDocTop + stage.pinDistance * progress)
}

describe('signature transition choreography', () => {
  it('is the round, liquid hero blob before the pin', () => {
    for (const y of [0, 300, 600, 899]) {
      const step = at(y)
      expect(step.progress).toBe(0)
      expect(step.fluid).toBe(1)
      expect(step.solid).toBe(0)
      expect(step.imageIn).toBe(0)
      expect(step.halfWidth).toBe(step.cornerRadius)
      expect(step.halfHeight).toBe(step.cornerRadius)
      expect(step.centerY).toBe(450)
    }
  })

  it('holds the box still in the viewport while pinned, then lets it scroll away', () => {
    expect(boxRect(stage.trackDocTop, stage).top).toBe(135)
    expect(boxRect(stage.trackDocTop + 1000, stage).top).toBe(135)
    expect(boxRect(pinEnd, stage).top).toBe(135)
    expect(boxRect(pinEnd + 200, stage).top).toBe(-65)
    expect(boxRect(stage.trackDocTop - 300, stage).top).toBe(435)
  })

  it('follows the beats of the script', () => {
    expect(atProgress(0.05).fluid).toBe(1)
    expect(atProgress(0.45).halfWidth).toBeCloseTo(560)
    expect(atProgress(0.45).halfHeight).toBeCloseTo(315)
    expect(atProgress(0.45).solid).toBe(0)
    expect(atProgress(0.7).solid).toBe(1)
    expect(atProgress(0.59).imageIn).toBeLessThan(0.05)
    expect(atProgress(0.6).front).toBe(0)
    expect(atProgress(0.92).front).toBe(1)
    expect(atProgress(0.92).imageIn).toBe(1)
    expect(atProgress(0.92).fluid).toBe(0)
  })

  it('reads out viscosity 0.82 → 0.30 → 0.05 → 0', () => {
    expect(viscosityAt(0)).toBe(0.82)
    expect(viscosityAt(0.45)).toBeCloseTo(0.3)
    expect(viscosityAt(0.7)).toBeCloseTo(0.05)
    expect(viscosityAt(0.92)).toBe(0)
    let previous = Infinity
    for (let p = 0; p <= 1; p += 0.01) {
      expect(viscosityAt(p)).toBeLessThanOrEqual(previous)
      previous = viscosityAt(p)
    }
  })

  it('ends exactly on the box, which the DOM image then takes over', () => {
    const step = at(pinEnd)
    expect(step.centerX).toBeCloseTo(160 + 560)
    expect(step.centerY).toBeCloseTo(135 + 315)
    expect(step.halfWidth).toBeCloseTo(560)
    expect(step.halfHeight).toBeCloseTo(315)
    expect(step.cornerRadius).toBeCloseTo(16)
    expect(step.reveal).toBe(1)
    expect(step.body).toBe(false)
    expect(atProgress(0.9).reveal).toBe(0)
  })

  it('stays one soft shape: corners only tighten, never below the box radius', () => {
    let previous = Infinity
    for (let p = 0; p <= 1; p += 0.01) {
      const { cornerRadius } = atProgress(p)
      expect(cornerRadius).toBeLessThanOrEqual(previous)
      expect(cornerRadius).toBeGreaterThanOrEqual(16)
      previous = cornerRadius
    }
  })

  it('depends only on the scroll position, so reversing retraces the same path', () => {
    const ys = [0, 900, 1500, 2200, 2800, pinEnd, pinEnd + 400]
    const forward = ys.map(at)
    const backward = [...ys].reverse().map(at).reverse()
    expect(backward).toEqual(forward)
  })

  it('buds a droplet that pinches off and stays below the box', () => {
    expect(atProgress(0.49).droplet).toBeNull()
    const budding = atProgress(0.5).droplet!
    const settled = atProgress(0.7).droplet!
    expect(budding.merge).toBeGreaterThan(0)
    expect(settled.merge).toBe(0)
    expect(settled.y).toBeGreaterThan(135 + 630)
  })

  it('keeps rendering for the droplet after the pin, and sleeps once it scrolls away', () => {
    expect(at(pinEnd + 300).active).toBe(true)
    expect(at(pinEnd + 2000).active).toBe(false)
  })

  it('narrates with readouts: target on pin, at most one other on phones', () => {
    expect(readoutOpacity(0, false).target).toBe(0)
    expect(readoutOpacity(0.01, false).target).toBe(1)
    expect(readoutOpacity(0.3, false).viscosity).toBe(1)
    expect(readoutOpacity(0.3, false).colour).toBe(0)
    expect(readoutOpacity(0.99, false).target).toBe(0)

    for (let p = 0; p <= 1; p += 0.01) {
      const compact = readoutOpacity(p, true)
      const others = Object.entries(compact).filter(([key, value]) => key !== 'target' && value > 0)
      expect(others.length).toBeLessThanOrEqual(1)
    }
  })

  it('formats the colour readout as hex', () => {
    expect(toHex([0.494, 0.773, 0.557])).toBe('#7EC58E')
    expect(toHex(mixColour([0, 0, 0], [1, 1, 1], 0.5))).toBe('#808080')
  })
})
