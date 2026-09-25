import { describe, expect, it } from 'vitest'

import { choreograph, computeProgress, settleScroll, type FrameRect } from './choreography'

const viewport = { viewportWidth: 1440, viewportHeight: 900 }
const frame: FrameRect = { left: 120, docTop: 1100, width: 1200, height: 675, radius: 16 }
const end = settleScroll(frame, viewport.viewportHeight)

function at(scrollY: number, target: FrameRect | null = frame) {
  return choreograph({ ...viewport, scrollY, frame: target, scale: 1 })
}

describe('signature transition choreography', () => {
  it('rests as a metaball in the hero', () => {
    const step = at(0)
    expect(step.progress).toBe(0)
    expect(step.shape).toBe(0)
    expect(step.reveal).toBe(0)
    expect(step.settled).toBe(false)
    expect(step.centerX).toBe(720)
    expect(step.centerY).toBe(450)
  })

  it('lands exactly on the frame when it is centred in the viewport', () => {
    const step = at(end)
    const frameTop = frame.docTop - end

    expect(step.progress).toBe(1)
    expect(step.shape).toBe(1)
    expect(step.reveal).toBe(1)
    expect(step.settled).toBe(true)
    expect(step.centerX).toBeCloseTo(frame.left + frame.width / 2)
    expect(step.centerY).toBeCloseTo(frameTop + frame.height / 2)
    expect(step.halfWidth).toBeCloseTo(frame.width / 2)
    expect(step.halfHeight).toBeCloseTo(frame.height / 2)
    expect(step.cornerRadius).toBeCloseTo(frame.radius)
  })

  it('depends only on the scroll position, so reversing retraces the same path', () => {
    const forward = [0, 200, 400, 600, end].map((y) => at(y))
    const backward = [end, 600, 400, 200, 0].map((y) => at(y)).reverse()
    expect(backward).toEqual(forward)
  })

  it('progresses monotonically and keeps the image hidden until the shape has formed', () => {
    let previous = -1
    for (let y = 0; y <= end; y += 25) {
      const step = at(y)
      expect(step.progress).toBeGreaterThanOrEqual(previous)
      if (step.shape < 0.9) expect(step.reveal).toBe(0)
      previous = step.progress
    }
  })

  it('stays settled past the frame', () => {
    expect(at(end + 2000).settled).toBe(true)
    expect(computeProgress(end + 2000, frame, viewport.viewportHeight)).toBe(1)
  })

  it('without a frame keeps the hero blob and sleeps once scrolled away', () => {
    expect(at(400, null).shape).toBe(0)
    expect(at(400, null).settled).toBe(false)
    expect(at(2000, null).settled).toBe(true)
  })
})
