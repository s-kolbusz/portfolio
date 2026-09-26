import { describe, expect, it } from 'vitest'

import {
  boxRect,
  choreograph,
  coverRadius,
  HEADING_AT,
  mixColour,
  readoutOpacity,
  toHex,
  viscosityAt,
  type HeroLayout,
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
    expect(atProgress(0.36).halfWidth).toBeCloseTo(560)
    expect(atProgress(0.36).halfHeight).toBeCloseTo(315)
    expect(atProgress(0.34).solid).toBe(0)
    expect(atProgress(0.58).solid).toBe(1)
    expect(atProgress(0.48).imageIn).toBe(0)
    expect(atProgress(0.58).imageIn).toBe(1)
    expect(atProgress(0.52).clarity).toBe(0)
    expect(atProgress(0.82).clarity).toBe(1)
    expect(atProgress(0.82).fluid).toBe(0)
  })

  it('clears the surface gradually, the same everywhere (no spreading front)', () => {
    let previous = -1
    for (let p = 0.5; p <= 0.85; p += 0.01) {
      const { clarity } = atProgress(p)
      expect(clarity).toBeGreaterThanOrEqual(previous)
      previous = clarity
    }
  })

  it('reads out viscosity 0.82 → 0.30 → 0.05 → 0', () => {
    expect(viscosityAt(0)).toBe(0.82)
    expect(viscosityAt(0.36)).toBeCloseTo(0.3)
    expect(viscosityAt(0.58)).toBeCloseTo(0.05)
    expect(viscosityAt(0.82)).toBe(0)
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
    expect(atProgress(0.82).reveal).toBe(0)
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

  it('keeps the hero cursor ball: same size and union, coming away as the body sets', () => {
    const hero = at(0).ball
    expect(hero.radius).toBeCloseTo(0.25 * 450)
    expect(hero.merge).toBeCloseTo(0.6 * 450)
    expect(hero.detach).toBe(0)

    expect(atProgress(0.18).ball.merge).toBeCloseTo(hero.merge)
    expect(atProgress(0.3).ball.merge).toBeLessThan(hero.merge)
    const free = atProgress(0.42).ball
    expect(free.merge).toBe(0)
    expect(free.detach).toBe(1)
    expect(free.radius).toBeCloseTo(hero.radius)
  })

  it('rests the ball inside the blob, then beside or below the image without a pointer', () => {
    const inside = atProgress(0.1)
    expect(inside.ball.restX).toBeCloseTo(inside.centerX)
    expect(inside.ball.restY).toBeCloseTo(inside.centerY)

    const narrow: StageLayout = {
      ...stage,
      box: { ...stage.box, left: 24, offsetTop: 300, width: 342, height: 192 },
    }
    const phone = choreograph({
      viewportWidth: 390,
      viewportHeight: 844,
      scrollY: narrow.trackDocTop + narrow.pinDistance * 0.9,
      stage: narrow,
      scale: 0.6,
    }).ball
    expect(phone.restY).toBeGreaterThan(300 + 192)
  })

  it('keeps rendering for the ball while the scene is on screen, then sleeps', () => {
    expect(at(pinEnd + 300).active).toBe(true)
    expect(at(pinEnd + 2000).active).toBe(false)
  })

  it('narrates with readouts that all give way before the heading enters', () => {
    expect(readoutOpacity(0, false).target).toBe(0)
    expect(readoutOpacity(0.02, false).target).toBeGreaterThan(0)
    expect(readoutOpacity(0.02, false).target).toBeLessThan(1)
    expect(readoutOpacity(0.05, false).target).toBe(1)
    expect(readoutOpacity(0.2, false).viscosity).toBe(1)
    expect(readoutOpacity(0.2, false).colour).toBe(0)
    for (const value of Object.values(readoutOpacity(HEADING_AT, false))) {
      expect(value).toBe(0)
    }

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

describe('hero scroll choreography', () => {
  // 1440×900: hero pinned for one screen, the signature pin starts where it ends.
  const hero: HeroLayout = {
    trackDocTop: 0,
    pinDistance: 900,
    nameCenterX: 720,
    nameCenterY: 250,
    nameBox: { left: 200, top: 180, width: 1040, height: 150 },
    glyphHeight: 115,
    drips: [
      { x: 300, y: 300, stroke: 12, reach: 2.5, delay: 0 },
      { x: 700, y: 300, stroke: 10, reach: 0.6, delay: 0.3 },
    ],
  }
  const signature: StageLayout = { ...stage, trackDocTop: 900 }

  function heroAt(scrollY: number) {
    return choreograph({ ...viewport, scrollY, hero, stage: signature, scale: 1 })
  }

  it('starts as the resting hero: the DOM name shows, nothing melts', () => {
    const step = heroAt(0)
    expect(step.hero?.focus).toBe(0)
    expect(step.hero?.melt).toBe(0)
    expect(step.name).toBeNull()
    expect(step.progress).toBe(0)
  })

  it('pulls focus onto the matter and clears the role and offer first', () => {
    const step = heroAt(270)
    expect(step.hero?.focus).toBe(1)
    expect(step.hero?.contentOpacity).toBe(0)
    expect(step.halfWidth).toBeGreaterThan(heroAt(0).halfWidth)
  })

  it('hands the name to the canvas crisp and in place when the melt starts', () => {
    const step = heroAt(900 * 0.2801)
    expect(step.name).not.toBeNull()
    expect(step.name!.soften).toBe(0)
    expect(step.name!.sag).toBe(0)
    expect(step.name!.tint).toBe(0)
    expect(step.name!.drips.every((drip) => drip.length < 1)).toBe(true)
  })

  it('runs the drips with gravity: slow to start, then long, each on its own delay', () => {
    const early = heroAt(900 * 0.4).name!.drips
    const late = heroAt(900 * 0.7).name!.drips
    expect(late[0].length).toBeGreaterThan(early[0].length * 2)
    expect(early[1].length).toBeLessThan(early[0].length)
    expect(late[0].head).toBeGreaterThan(late[0].neck)
  })

  it('softens, sinks, turns green and dissolves the name by the end of the melt', () => {
    const end = heroAt(900 * 0.75).name!
    expect(end.soften).toBeCloseTo(0.85)
    expect(end.sag).toBeGreaterThan(100)
    expect(end.tint).toBe(1)
    expect(end.fade).toBe(1)
  })

  it('dives: the matter fills the whole frame when the hero ends', () => {
    const step = heroAt(899.9)
    expect(step.halfWidth).toBeCloseTo(coverRadius(1440, 900), 0)
    expect(step.aspect).toBeCloseTo(1440 / 900, 2)
  })

  it('hands the same matter to the signature scene without a jump', () => {
    const last = heroAt(899.99)
    const first = heroAt(900)
    expect(first.hero).toBeNull()
    expect(first.halfWidth).toBeCloseTo(last.halfWidth, 0)
    expect(first.centerX).toBeCloseTo(last.centerX, 0)
    expect(first.centerY).toBeCloseTo(last.centerY, 0)
  })
})
