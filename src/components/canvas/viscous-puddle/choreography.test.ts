import { describe, expect, it } from 'vitest'

import {
  boxRect,
  choreograph,
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
    expect(atProgress(0.03).solid).toBe(0)
    expect(atProgress(0.4).solid).toBe(1)
    expect(atProgress(0.3).imageIn).toBe(0)
    expect(atProgress(0.6).imageIn).toBe(1)
    expect(atProgress(0.45).clarity).toBe(0)
    expect(atProgress(0.82).clarity).toBe(1)
    expect(atProgress(0.82).fluid).toBe(0)
  })

  it('clears the surface gradually, the same everywhere (no spreading front)', () => {
    let previous = -1
    for (let p = 0.4; p <= 0.85; p += 0.01) {
      const { clarity } = atProgress(p)
      expect(clarity).toBeGreaterThanOrEqual(previous)
      previous = clarity
    }
  })

  it('reads out viscosity 0.82 → 0.30 → 0.05 → 0', () => {
    expect(viscosityAt(0)).toBe(0.82)
    expect(viscosityAt(0.4)).toBeCloseTo(0.3)
    expect(viscosityAt(0.6)).toBeCloseTo(0.05)
    expect(viscosityAt(0.82)).toBe(0)
    let previous = Infinity
    for (let p = 0; p <= 1; p += 0.01) {
      expect(viscosityAt(p)).toBeLessThanOrEqual(previous)
      previous = viscosityAt(p)
    }
  })

  it('hands the image over to the DOM, while the sheet stays behind it', () => {
    const step = at(pinEnd)
    expect(step.reveal).toBe(1)
    expect(step.body).toBe(true)
    expect(step.clarity).toBe(1)
    expect(step.boxRadius).toBe(16)
    expect(atProgress(0.82).reveal).toBe(0)
  })

  it('leaves with the section on a liquid edge, then sleeps once only the ball is gone', () => {
    const leaving = at(pinEnd + 450)
    expect(leaving.centerY + leaving.halfHeight).toBeCloseTo(900 - 450)
    expect(leaving.liquidEdge).toBe(1)
    expect(leaving.body).toBe(true)
    expect(at(pinEnd + 1200).body).toBe(false)
  })

  it('runs the story on the damped position, but places the box by the real scroll', () => {
    const lagging = choreograph({
      ...viewport,
      scrollY: pinEnd + 200,
      timeY: stage.trackDocTop + stage.pinDistance * 0.5,
      stage,
      scale: 1,
    })
    expect(lagging.progress).toBeCloseTo(0.5)
    expect(lagging.box.top).toBe(-65)
  })

  it('depends only on the scroll position, so reversing retraces the same path', () => {
    const ys = [0, 900, 1500, 2200, 2800, pinEnd, pinEnd + 400]
    const forward = ys.map(at)
    const backward = [...ys].reverse().map(at).reverse()
    expect(backward).toEqual(forward)
  })

  it('keeps the hero cursor ball: same size and union, coming away as the sheet darkens', () => {
    const hero = at(0).ball
    expect(hero.radius).toBeCloseTo(0.25 * 450)
    expect(hero.merge).toBeCloseTo(0.6 * 450)
    expect(hero.detach).toBe(0)

    expect(atProgress(0.1).ball.merge).toBeCloseTo(hero.merge)
    expect(atProgress(0.25).ball.merge).toBeLessThan(hero.merge)
    const free = atProgress(0.36).ball
    expect(free.merge).toBe(0)
    expect(free.detach).toBe(1)
    expect(free.radius).toBeCloseTo(hero.radius)
  })

  it('rests the ball mid-frame, then beside or on the corner of the image without a pointer', () => {
    const inside = atProgress(0.05)
    expect(inside.ball.restX).toBeCloseTo(720)
    expect(inside.ball.restY).toBeCloseTo(450)

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
    // Leaning on the bottom-right corner, clear of the link below.
    expect(phone.restX).toBeGreaterThan(24 + 342 - phone.radius)
    expect(phone.restY).toBeLessThan(300 + 192)
    expect(phone.restY).toBeGreaterThan(300 + 192 - phone.radius)
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
    expect(readoutOpacity(0.3, false).viscosity).toBe(1)
    expect(readoutOpacity(0.3, false).colour).toBe(1)
    expect(readoutOpacity(0.5, false).colour).toBe(0)
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
  // 1440×900: hero pinned for two screens, the signature pin starts where it ends.
  const hero: HeroLayout = {
    trackDocTop: 0,
    pinDistance: 1800,
    nameBox: { left: 200, top: 180, width: 1040, height: 150 },
    zoomX: 700,
    zoomY: 255,
    zoomStroke: 20,
  }
  const signature: StageLayout = { ...stage, trackDocTop: 1800 }
  const H = (h: number) => 1800 * h

  function heroAt(scrollY: number) {
    return choreograph({ ...viewport, scrollY, hero, stage: signature, scale: 1 })
  }

  it('starts as the resting hero: the DOM name shows, the blob is green', () => {
    const step = heroAt(0)
    expect(step.hero?.nameInCanvas).toBe(false)
    expect(step.name).toBeNull()
    expect(step.drain).toBe(0)
    expect(step.progress).toBe(0)
  })

  it('clears the role and offer, then hands the name to the canvas unsoaked', () => {
    expect(heroAt(H(0.1)).hero?.contentOpacity).toBe(0)
    const step = heroAt(H(0.08))
    expect(step.hero?.nameInCanvas).toBe(true)
    expect(step.name?.soak).toBe(0)
    expect(step.name?.zoom).toBe(1)
  })

  it('clings: the blob flattens along the name', () => {
    const clung = heroAt(H(0.34))
    expect(clung.halfWidth).toBeCloseTo(520)
    expect(clung.halfHeight).toBeCloseTo(150 * 0.62)
    expect(clung.centerY).toBeCloseTo(255)
  })

  it('soaks the letters steadily while the blob pales to clear water', () => {
    let previous = -1
    for (let p = 0.2; p < 0.6; p += 0.05) {
      const soak = heroAt(900 * p).name!.soak
      expect(soak).toBeGreaterThanOrEqual(previous)
      previous = soak
    }
    expect(heroAt(H(0.61)).name!.soak).toBe(2)
    expect(heroAt(H(0.62)).drain).toBe(1)
  })

  it('flies into the soaked stroke until it fills the frame', () => {
    const start = heroAt(H(0.58)).name!
    const end = heroAt(1799.9).name!
    expect(start.zoom).toBe(1)
    // The stroke (20 px) outgrows the viewport diagonal.
    expect(end.zoom * 20).toBeGreaterThan(Math.hypot(1440, 900))
    // The target ends up in the middle of the frame.
    const targetX = end.left + (700 - 200) * end.zoom
    const targetY = end.top + (255 - 180) * end.zoom
    expect(targetX).toBeCloseTo(720, 0)
    expect(targetY).toBeCloseTo(450, 0)
  })

  it('eases after the scroll: a lagging camera shows an earlier beat in the same place', () => {
    const lagging = choreograph({
      ...viewport,
      scrollY: H(0.5),
      timeY: H(0.25),
      hero,
      stage: signature,
      scale: 1,
    })
    expect(lagging.hero?.progress).toBeCloseTo(0.25)
    expect(lagging.name?.soak).toBe(heroAt(H(0.25)).name?.soak)
  })

  it('never shrinks: the matter stays a sheet over the whole stage', () => {
    for (let p = 0; p <= 1; p += 0.05) {
      const step = heroAt(signature.trackDocTop + signature.pinDistance * p)
      expect(step.centerY - step.halfHeight).toBeLessThanOrEqual(0)
      expect(step.centerY + step.halfHeight).toBeGreaterThanOrEqual(900)
      expect(step.centerX - step.halfWidth).toBeLessThan(0)
      expect(step.centerX + step.halfWidth).toBeGreaterThan(1440)
    }
  })

  it('hands over to the signature scene, which starts from full-frame matter', () => {
    const first = heroAt(1800)
    expect(first.hero).toBeNull()
    expect(first.name).toBeNull()
    // The sheet covers the whole frame from the first scene frame on.
    expect(first.centerY - first.halfHeight).toBeLessThanOrEqual(0)
    expect(first.centerY + first.halfHeight).toBeGreaterThanOrEqual(900)
    expect(first.halfWidth).toBeGreaterThan(720)
    expect(first.drain).toBe(0)
  })
})
