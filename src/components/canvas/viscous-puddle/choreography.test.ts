import { describe, expect, it } from 'vitest'

import {
  choreograph,
  computeProgress,
  enterScroll,
  settleScroll,
  type FrameRect,
} from './choreography'

const viewport = { viewportWidth: 1440, viewportHeight: 900 }
const frame: FrameRect = { left: 80, docTop: 1400, width: 1280, height: 720, radius: 16 }
const start = enterScroll(frame, viewport.viewportHeight)
const end = settleScroll(frame, viewport.viewportHeight)

function at(scrollY: number, target: FrameRect | null = frame) {
  return choreograph({ ...viewport, scrollY, frame: target, scale: 1 })
}

describe('signature transition choreography', () => {
  it('rests as a round, liquid blob in the hero', () => {
    const step = at(0)
    expect(step.progress).toBe(0)
    expect(step.fluid).toBe(1)
    expect(step.reveal).toBe(0)
    expect(step.settled).toBe(false)
    expect(step.centerX).toBe(720)
    expect(step.centerY).toBe(450)
    expect(step.halfWidth).toBe(step.cornerRadius)
    expect(step.halfHeight).toBe(step.cornerRadius)
  })

  it('stays a blob until the frame enters the viewport', () => {
    for (let y = 0; y <= start; y += 50) {
      const step = at(y)
      expect(step.progress).toBe(0)
      expect(step.halfWidth).toBe(step.cornerRadius)
    }
    expect(at(start + 50).progress).toBeGreaterThan(0)
  })

  it('lands exactly on the frame when it is centred in the viewport', () => {
    const step = at(end)
    const frameTop = frame.docTop - end

    expect(step.progress).toBe(1)
    expect(step.fluid).toBe(0)
    expect(step.reveal).toBe(1)
    expect(step.settled).toBe(true)
    expect(step.centerX).toBeCloseTo(frame.left + frame.width / 2)
    expect(step.centerY).toBeCloseTo(frameTop + frame.height / 2)
    expect(step.halfWidth).toBeCloseTo(frame.width / 2)
    expect(step.halfHeight).toBeCloseTo(frame.height / 2)
    expect(step.cornerRadius).toBeCloseTo(frame.radius)
  })

  it('only ever softens into the frame: corners never sharper than the final radius', () => {
    let previousCorner = Infinity
    for (let y = start; y <= end; y += 10) {
      const step = at(y)
      expect(step.cornerRadius).toBeLessThanOrEqual(previousCorner)
      expect(step.cornerRadius).toBeGreaterThanOrEqual(frame.radius)
      previousCorner = step.cornerRadius
    }
  })

  it('depends only on the scroll position, so reversing retraces the same path', () => {
    const forward = [0, 400, 700, 1000, end].map((y) => at(y))
    const backward = [end, 1000, 700, 400, 0].map((y) => at(y)).reverse()
    expect(backward).toEqual(forward)
  })

  it('keeps the image hidden until the shape has nearly set', () => {
    for (let y = start; y <= end; y += 25) {
      const step = at(y)
      if (step.progress < 0.85) expect(step.reveal).toBe(0)
    }
  })

  it('stays settled past the frame', () => {
    expect(at(end + 2000).settled).toBe(true)
    expect(computeProgress(end + 2000, frame, viewport.viewportHeight)).toBe(1)
  })

  it('without a frame keeps the hero blob and sleeps once scrolled away', () => {
    expect(at(400, null).fluid).toBe(1)
    expect(at(400, null).settled).toBe(false)
    expect(at(2000, null).settled).toBe(true)
  })
})
