import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createStory, type StoryLayout } from './matter-story'
import type { RasterThing } from './things'

/** A drawing of two bars (two parts), as the rasteriser would hand it over. */
function thing(): RasterThing {
  const size = 64
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 4; x < 60; x++) {
      if ((y >= 6 && y < 26) || (y >= 38 && y < 58)) {
        data[(y * size + x) * 4] = 255
        data[(y * size + x) * 4 + 3] = 255
      }
    }
  }
  return {
    mask: { data, width: size, height: size },
    coverage: (2 * 20 * 56) / (size * size),
    parts: [
      { x: 0.5, y: 0.25, points: new Float32Array(200) },
      { x: 0.5, y: 0.75, points: new Float32Array(200) },
    ],
  }
}

const layout: StoryLayout = {
  width: 800,
  height: 600,
  stage: { x: 250, y: 150, size: 300 },
  name: { x: 250, y: 60, width: 300, height: 480 },
}

function play(seconds: number, until: string, options: Parameters<typeof createStory>[0]) {
  const story = createStory(options)
  const phases: string[] = []
  let last = story.step(1 / 60, { x: 0, y: 0, active: false }, false)
  for (let frame = 0; frame < seconds * 60 && !phases.includes(until); frame++) {
    last = story.step(1 / 60, { x: 0, y: 0, active: false }, false)
    if (phases[phases.length - 1] !== last.phase) phases.push(last.phase)
  }
  return { story, phases, last }
}

// The story draws on chance; the tests repeat one run of it. Coverage slows the liquid a good deal.
vi.setConfig({ testTimeout: 60_000 })
beforeEach(() => {
  let state = 11
  vi.spyOn(Math, 'random').mockImplementation(() => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  })
})

describe('createStory', () => {
  it('gathers the drops into the blob, sets a thing and takes it back', () => {
    const { phases, last } = play(30, 'melting', {
      count: 300,
      ballCount: 12,
      things: [thing()],
      name: null,
      layout,
    })
    expect(phases.slice(0, 5)).toEqual(['birth', 'blob', 'forming', 'hold', 'melting'])
    expect(last.count).toBe(312)
    expect(last.inked).toBe(true)
    for (let i = 0; i < last.count * 2; i++) expect(Number.isFinite(last.positions[i]!)).toBe(true)
  })

  it('reports the set drawing and the heavy body', () => {
    const story = createStory({ count: 300, ballCount: 12, things: [thing()], name: null, layout })
    let frame = story.step(1 / 60, { x: 0, y: 0, active: false }, false)
    expect(frame.changed).toBe(true)
    let mostFormed = 0
    let blobRadius = 0
    for (let n = 0; n < 25 * 60 && frame.phase !== 'melting'; n++) {
      frame = story.step(1 / 60, { x: 0, y: 0, active: false }, n === 400)
      if (frame.phase === 'blob') blobRadius = Math.max(blobRadius, frame.blob.radius)
      if (frame.phase === 'hold') mostFormed = Math.max(mostFormed, frame.formed)
    }
    // The blob is about as large as the matter it holds; most of the matter sets in the drawing.
    expect(blobRadius).toBeGreaterThan(300 * 0.43 * 0.6)
    expect(mostFormed).toBeGreaterThan(0.5)
    expect(frame.drawing).toBe('thing')
    expect(frame.rect).toEqual({ x: 250, y: 150, width: 300, height: 300 })
  })

  it('builds the letters first, then lets the real text take over', () => {
    const { phases, last } = play(20, 'blob', {
      count: 300,
      ballCount: 12,
      things: [thing()],
      name: thing(),
      layout,
    })
    expect(phases[0]).toBe('birth')
    expect(last.inked).toBe(true)
    expect(phases).toContain('blob')
  })

  it('answers to the pointer and survives a resize', () => {
    const story = createStory({ count: 300, ballCount: 20, things: [thing()], name: null, layout })
    const pointer = { x: 80, y: 300, active: true }
    let frame = story.step(1 / 60, pointer, false)
    for (let n = 0; n < 240; n++) frame = story.step(1 / 60, pointer, false)
    // The pointer's own matter has come to it.
    let near = 0
    for (let i = 300; i < 320; i++) {
      if (Math.hypot(frame.positions[i * 2]! - 80, frame.positions[i * 2 + 1]! - 300) < 60) near++
    }
    expect(near).toBeGreaterThan(8)
    story.resize({ ...layout, width: 400, stage: { x: 100, y: 100, size: 200 } })
    frame = story.step(1 / 30, { ...pointer, active: false }, false)
    for (let i = 0; i < frame.count * 2; i++)
      expect(Number.isFinite(frame.positions[i]!)).toBe(true)
  })
})
