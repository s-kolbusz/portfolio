'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  type DropsFrame,
  type DropsStage,
  type GroundRect,
  startDropsStage,
  supportsDrops,
} from '@/components/canvas/liquid-hero/drops-stage'
import { Rise, riseAt } from '@/components/ui/rise'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { type RevealDetail, useReveal } from '@/hooks/use-reveal'
import { Link } from '@/i18n/navigation-v2'
import { useScrollStore } from '@/lib/stores/scroll'

import './ready2order-scene.css'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const mix = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * The bundle's parts as liquid. Shares of the whole (illustrative, not to scale: no real module sizes
 * are known). Dependencies are two groups, so part of them can drain away while the rest stays;
 * the split-off screens are three, so they land on the shelf as separate drops. Dead code is named,
 * not drawn: as drops of its own it was too small to come apart without threads.
 */
const GROUPS = [
  { key: 'app', share: 0.33 },
  { key: 'depsKeep', share: 0.13 },
  { key: 'depsShed', share: 0.1 },
  { key: 's1', share: 0.11 },
  { key: 's2', share: 0.09 },
  { key: 's3', share: 0.07 },
  { key: 'redux', share: 0.17 },
] as const
type GroupKey = (typeof GROUPS)[number]['key']

/** the bundle's blocks as fractions of the map: [x, y, w, h] */
const BLOCKS = {
  app: [0, 0, 0.52, 0.6],
  deps: [0, 0.6, 0.52, 0.4],
  screens: [0.52, 0, 0.48, 0.66],
  redux: [0.52, 0.66, 0.48, 0.34],
} as const
type BlockKey = keyof typeof BLOCKS
type Box = { x: number; y: number; w: number; h: number }

/**
 * The scroll, as fractions of the section's travel: when each step's text takes over, and when the
 * liquid moves. One body → taken apart → slimmed, split off, thrown out → half the size.
 */
const T = {
  apart: [0.12, 0.3],
  fates: [0.4, 0.6],
  half: [0.66, 0.8],
  step: [0, 0.2, 0.42, 0.68],
  /** where a step holds still: a click on it scrolls there */
  hold: [0.06, 0.34, 0.62, 0.9],
}

/** where everything stands at a stage size (CSS px) */
function geometry(W: number, H: number) {
  const phone = W <= 700
  const M = W * 0.0667
  let box: Box, shelf: Box
  if (phone) {
    box = { x: M, y: 96, w: W - 2 * M, h: H * 0.32 }
    shelf = { x: M, y: box.y + box.h + 36, w: box.w, h: H * 0.1 }
  } else {
    const x0 = W * 0.42
    const full = W - M - x0
    const shelfW = full * 0.26
    box = { x: x0, y: 150, w: full - shelfW - 32, h: H - 150 - 96 }
    shelf = { x: box.x + box.w + 32, y: box.y, w: shelfW, h: box.h }
  }
  const k = Math.SQRT1_2
  const half: Box = { x: box.x, y: box.y, w: box.w * k, h: box.h * k }
  const block = (b: BlockKey): Box => {
    const [u, v, w, h] = BLOCKS[b]
    return { x: box.x + u * box.w, y: box.y + v * box.h, w: w * box.w, h: h * box.h }
  }
  const mid = (b: Box, u = 0.5, v = 0.5) => ({ x: b.x + b.w * u, y: b.y + b.h * v })
  // the one body fills the map; each part's drop has its share of that body's area
  const R = Math.min(box.w, box.h) * (phone ? 0.25 : 0.34)
  const radius = GROUPS.map((g) => R * Math.sqrt(g.share))
  // the labels sit in each block's top-left corner, so the drops sit a little below the middle
  const inBlock = (b: BlockKey) => mid(block(b), 0.5, 0.56)
  const drain = H * 1.3
  const shelfAt = (i: number) =>
    phone ? mid(shelf, 0.18 + i * 0.32, 0.66) : mid(shelf, 0.5, 0.22 + i * 0.3)
  // [taken apart, after the fates, half the size] for each group
  const at: Record<GroupKey, Array<{ x: number; y: number }>> = {
    app: [inBlock('app'), inBlock('app'), mid(half, 0.5, 0.54)],
    depsKeep: [inBlock('deps'), inBlock('deps'), mid(half, 0.5, 0.54)],
    depsShed: [inBlock('deps'), { x: mid(block('deps')).x, y: drain }],
    s1: [inBlock('screens'), shelfAt(0)],
    s2: [inBlock('screens'), shelfAt(1)],
    s3: [inBlock('screens'), shelfAt(2)],
    redux: [inBlock('redux'), { x: mid(block('redux')).x, y: drain }],
  }
  return { phone, box, shelf, half, block, radius, at, start: mid(box), drain }
}
type Geo = ReturnType<typeof geometry>

/** when each group meets its fate: the shed dependencies first, then Redux and the screens */
const FATE_AT: Partial<Record<GroupKey, [number, number]>> = {
  depsShed: [0.44, 0.56],
  redux: [0.46, 0.6],
  s1: [0.44, 0.58],
  s2: [0.46, 0.6],
  s3: [0.48, 0.6],
}

/**
 * The scene's entrance, in seconds (played in time, like the stronypodhale.pl act): the texts rise
 * (useReveal), the map's blocks come up out of the ink one after another, the liquid rises from under
 * the map into its middle, the path draws, then the first step, the receipt's first line and the caption.
 */
const INTRO = {
  len: 2.3,
  blocks: 0.25,
  blockStep: 0.08,
  liquid: [0.3, 2.3],
  print: 1.25,
}
const ease3 = (t: number) => 1 - (1 - t) ** 3
/** how far the liquid has risen into the map (0: under it, 1: in place) */
// a soft start and landing: a sudden pull stretches the body into a teardrop
const risen = (intro: number) => ease(span(intro, INTRO.liquid[0], INTRO.liquid[1]))

/** the liquid's targets and the ground's blocks at scroll progress p, and the entrance at intro seconds */
function frameAt(g: Geo, p: number, intro = INTRO.len): DropsFrame {
  const apart = ease(span(p, T.apart[0], T.apart[1]))
  const half = ease(span(p, T.half[0], T.half[1]))
  const lift = risen(intro)
  const targets = GROUPS.map(({ key }) => {
    const [a, b, c] = g.at[key]
    let x = mix(g.start.x, a.x, apart),
      y = mix(g.start.y, a.y, apart)
    const f = FATE_AT[key]
    if (f) {
      const t = ease(span(p, f[0], f[1]))
      x = mix(x, b.x, t)
      y = mix(y, b.y, t)
    } else if (c) {
      x = mix(x, c.x, half)
      y = mix(y, c.y, half)
    }
    return { x, y: y + (1 - lift) * (g.drain - g.start.y) }
  })
  const gone = span(p, 0.44, 0.6)
  const r = (b: Box, a: number, more: Partial<GroundRect> = {}): GroundRect => ({
    ...b,
    a,
    ...more,
  })
  // from the start the map shows its modules; the parts' outlines firm up as the body comes apart
  const edge = 0.35 + 0.65 * apart
  const rects = [
    r(g.box, 1 - half),
    r(g.block('app'), 1 - half, { modules: 1, edge }),
    r(g.block('deps'), 1 - half, { modules: 1, edge }),
    r(g.block('screens'), 1 - gone, { modules: 1 - gone, edge }),
    r(g.block('redux'), 1 - gone, { modules: 1 - gone, edge }),
    r(g.shelf, span(p, 0.42, 0.56), { dashed: true }),
    r(g.box, half * 0.8, { dashed: true }),
    r(g.half, half * 1.2, { modules: 1 }),
  ]
  // the blocks come up one after another
  rects.forEach((rect, i) => {
    rect.a *= ease3(
      span(intro, INTRO.blocks + i * INTRO.blockStep, INTRO.blocks + i * INTRO.blockStep + 0.6)
    )
  })
  // the liquid comes up the hero's green and turns ready2order's blue as it rises into the map,
  // as the stronypodhale.pl liquid darkens into that brand's green
  return { targets, rects, blue: ease(span(intro, INTRO.liquid[0] + 0.4, INTRO.liquid[1])) }
}

/**
 * Act 3, second scene: ready2order. The production bundle is one body of liquid on a map of its
 * blocks. Scrolling takes it apart into its parts, then each part meets its fate: dependencies
 * slimmed in place, screens split off onto a shelf (they still load, when opened), Redux and the dead code
 * drained away. What is left runs together into a body half the size, in the old outline.
 * With reduced motion it is the story as a plain section.
 */
export function Ready2orderScene() {
  const t = useTranslations('ready2order')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)
  // the entrance: texts rise when the stage is halfway up the screen (the stage gets data-in)
  useReveal(stageRef, { at: 0.5, back: 0.8 })

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const stage = stageRef.current
    const holder = liquidRef.current
    if (!track || !stage || !holder) return
    const q = <E extends HTMLElement>(s: string) => Array.from(stage.querySelectorAll<E>(s))
    const steps = q('[data-step]')
    const fills = q('[data-fill]')
    const rows = q('[data-print]')
    const ticks = q('[data-tick]')
    const fades = q('[data-show]')
    const placed = q('[data-at]')
    const drops = q<HTMLImageElement>('[data-drop]')
    const whole = stage.querySelector<HTMLElement>('[data-whole]')
    const boxes = q('[data-rect]')
    const door = stage.querySelector<HTMLElement>('.r2o-door')
    let frame = 0
    let p = 0
    let geo = geometry(stage.clientWidth, stage.clientHeight)
    // the entrance's clock: already in place when the page opens past it, else it plays from 0
    let intro = stage.hasAttribute('data-in') ? INTRO.len : 0
    let introOn = intro > 0

    // the real liquid; without WebGL2 cut-out drops and drawn boxes do the same, plainer.
    // It exists only while the scene is near: built a screen before it shows, freed (context, buffers,
    // physics thread) once the page is more than 1.5 screens away (owner, 2026-11-18: only the scene
    // being read may cost memory)
    let liquid: DropsStage | null = null
    const canDrops = supportsDrops()
    const near = () => {
      const r = track.getBoundingClientRect()
      const vh = window.innerHeight
      const m = liquid ? 1.5 : 1
      return r.top < vh * (1 + m) && r.bottom > -vh * m
    }
    const free = () => {
      liquid?.stop()
      liquid = null
      holder.replaceChildren()
      delete stage.dataset.liquid
    }
    const start = () => {
      liquid?.stop()
      liquid = null
      if (!canDrops || !near()) return
      // a fresh canvas each time: a stopped stage has given up its WebGL context for good
      const canvas = document.createElement('canvas')
      canvas.className = 'r2o-liquid'
      canvas.setAttribute('aria-hidden', 'true')
      holder.replaceChildren(canvas)
      stage.dataset.liquid = '1'
      liquid = startDropsStage({
        canvas,
        groups: geo.radius,
        // before the entrance the liquid waits under the map
        start: intro > 0 ? geo.start : { x: geo.start.x, y: geo.drain },
        frame: () => frameAt(geo, p, intro),
        onFail: () => delete stage.dataset.liquid,
      })
    }
    start()

    // labels and captions: placed against the map's blocks, shown in their steps
    const place = () => {
      const g = geo
      const boxOf: Record<string, Box> = {
        box: g.box,
        half: g.half,
        shelf: g.shelf,
        app: g.block('app'),
        deps: g.block('deps'),
        screens: g.block('screens'),
        redux: g.block('redux'),
      }
      for (const el of placed) {
        const [name, where] = (el.dataset.at ?? '').split(':')
        const b = boxOf[name]
        if (!b) continue
        let x = b.x,
          y = b.y
        if (where === 'above') y -= 8
        else if (where === 'below') y += b.h + 12
        else if (where === 'band') {
          // the strip the old outline leaves under the new, half-size bundle
          y = g.half.y + g.half.h + (g.box.h - g.half.h) / 2
        } else {
          x += 12
          y += 10
        }
        el.style.transform = `translate(${x}px, ${y}px)${where === 'above' ? ' translateY(-100%)' : ''}`
        el.style.maxWidth =
          where === 'above' || where === 'below'
            ? `${g.shelf.x + g.shelf.w - g.box.x}px`
            : `${b.w - 24}px`
      }
      // the result fills the freed strip without spilling out of it
      const big = stage.querySelector<HTMLElement>('.r2o-big')
      if (big) {
        const room = g.box.h - g.half.h
        big.style.fontSize = `${Math.min(room * 0.72, g.phone ? g.box.w * 0.24 : g.box.w * 0.2)}px`
      }
    }
    place()

    // the site bar turns light over this dark scene, as it does over the hero's dark sheet
    const adapt = (on: boolean) => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-adapt-theme]'))) {
        if (el.dataset.adaptTheme === 'pointer') continue
        const r = el.getBoundingClientRect()
        const sr = stage.getBoundingClientRect()
        const y = r.top + r.height / 2
        const dark = on && y >= sr.top && y < sr.bottom
        if (el.classList.contains('dark') !== dark) el.classList.toggle('dark', dark)
      }
    }
    let wasIn = false
    let last = -1
    let closeReceipt = () => {}

    const draw = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const isNear = near()
      if (isNear && !liquid && canDrops) start()
      else if (!isNear && liquid) free()
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      if (inView || wasIn) adapt(inView)
      wasIn = inView
      const travel = rect.height - window.innerHeight
      p = travel > 0 ? clamp01(-rect.top / travel) : 1
      if (Math.abs(p - last) < 0.0005) return
      last = p
      // the step the text is on; the rail's line opens it, the others fold
      let now = 0
      T.step.forEach((s, i) => {
        if (p >= s) now = i
      })
      // a new step prints new lines: a pulled-up receipt goes back in first
      if (stage.dataset.step !== String(now + 1)) closeReceipt()
      stage.dataset.step = String(now + 1)
      steps.forEach((el, i) => {
        el.dataset.state = i === now ? 'now' : i < now ? 'past' : 'next'
      })
      // each step's stretch of the path fills as the scroll goes through it
      fills.forEach((el, i) => {
        const a = T.step[i],
          b = T.step[i + 1] ?? 1
        el.style.transform = `scaleX(${span(p, a, b)})`
      })
      ticks.forEach((el, i) => el.toggleAttribute('aria-current', i === now))
      // the receipt prints line by line, and takes its lines back when the page scrolls up
      rows.forEach((el) => {
        const on = intro >= INTRO.print && now + 1 >= Number(el.dataset.print)
        if ((el.dataset.on === '1') !== on) el.dataset.on = on ? '1' : '0'
      })
      if (door) door.tabIndex = now === 3 ? 0 : -1
      // labels rise from under their line in their stretch of the scroll and leave upward after it
      // (the steps' own movement); one marked data-intro waits for the entrance to reach it
      for (const el of fades) {
        const [a, b, c, d] = (el.dataset.show ?? '0 0 1 1').split(' ').map(Number)
        const wait = intro < Number(el.dataset.intro ?? 0)
        const state = p >= (c + d) / 2 ? 'past' : p >= (a + b) / 2 && !wait ? 'now' : 'next'
        if (el.dataset.state !== state) el.dataset.state = state
      }
      // without WebGL2: the same story with cut-out drops and drawn boxes
      if (!stage.dataset.liquid) {
        const f = frameAt(geo, p, intro)
        const apart = span(p, T.apart[0], T.apart[0] + 0.06)
        if (whole) {
          const d = Math.min(geo.box.w, geo.box.h) * 0.86
          const y = geo.start.y + (1 - risen(intro)) * (geo.drain - geo.start.y)
          whole.style.width = `${d}px`
          whole.style.transform = `translate(${geo.start.x - d / 2}px, ${y - d / 2}px)`
          whole.style.opacity = String(1 - apart)
        }
        drops.forEach((el, i) => {
          const d = geo.radius[i] * 2.15
          const tg = f.targets[i]
          el.style.width = `${d}px`
          el.style.transform = `translate(${tg.x - d / 2}px, ${tg.y - d / 2}px) rotate(${i * 67}deg)`
          el.style.opacity = String(apart)
        })
        boxes.forEach((el, i) => {
          const r = f.rects[i]
          el.style.transform = `translate(${r.x}px, ${r.y}px)`
          el.style.width = `${r.w}px`
          el.style.height = `${r.h}px`
          el.style.opacity = String(Math.min(1, r.a))
          el.style.borderStyle = r.dashed ? 'dashed' : 'solid'
        })
      }
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    let lastW = stage.clientWidth,
      lastH = stage.clientHeight,
      restart = 0
    const onResize = () => {
      const w = stage.clientWidth,
        h = stage.clientHeight
      if (w === lastW && Math.abs(h - lastH) < 120) return request()
      lastW = w
      lastH = h
      geo = geometry(w, h)
      place()
      last = -1
      request()
      // the liquid's canvas has a fixed size: start it again for the new one, once resizing stops
      clearTimeout(restart)
      restart = window.setTimeout(start, 250)
    }
    // a step on the path takes the page to that step
    const go = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-tick]')
      if (!btn) return
      const top = track.getBoundingClientRect().top + window.scrollY
      const y = top + (track.offsetHeight - window.innerHeight) * T.hold[Number(btn.dataset.tick)]
      const lenis = useScrollStore.getState().lenis
      if (lenis) lenis.scrollTo(y, { duration: 1.4 })
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }
    stage.addEventListener('click', go)

    // the entrance plays in time; going back up it runs backwards, 1.4x faster (as the texts do)
    let introFrame = 0
    let introPrev = 0
    const tick = (now: number) => {
      const dt = Math.min((now - introPrev) / 1000, 0.05)
      introPrev = now
      intro = Math.min(INTRO.len, Math.max(0, intro + (introOn ? dt : -dt * 1.4)))
      last = -1
      draw()
      introFrame =
        (introOn && intro < INTRO.len) || (!introOn && intro > 0) ? requestAnimationFrame(tick) : 0
    }
    const onReveal = (e: Event) => {
      const { on, instant } = (e as CustomEvent<RevealDetail>).detail
      introOn = on
      cancelAnimationFrame(introFrame)
      introFrame = 0
      if (instant) {
        intro = on ? INTRO.len : 0
        last = -1
        request()
        return
      }
      introPrev = performance.now()
      introFrame = requestAnimationFrame(tick)
    }
    stage.addEventListener('rv', onReveal)

    // the receipt: pulled up to its whole length, and tucked back in
    const slot = stage.querySelector<HTMLElement>('.r2o-slot')
    const receipt = stage.querySelector<HTMLElement>('.r2o-receipt')
    const paper = stage.querySelector<HTMLElement>('.r2o-paper')
    const isOpen = () => receipt?.getAttribute('aria-expanded') === 'true'
    const setReceipt = (open: boolean) => {
      if (!slot || !receipt || !paper || open === isOpen()) return
      // no higher than the column: from the slot's bottom up to the top of the column
      const to = open
        ? Math.min(paper.offsetHeight, slot.offsetTop + slot.offsetHeight)
        : slot.offsetHeight
      receipt.style.height = `${receipt.offsetHeight}px`
      void receipt.offsetHeight
      receipt.setAttribute('aria-expanded', String(open))
      receipt.dataset.lift = '1'
      receipt.style.height = `${to}px`
      const done = (e: TransitionEvent) => {
        if (e.propertyName !== 'height') return
        receipt.removeEventListener('transitionend', done)
        // back into its slot: its own height again, under the slot's fade
        if (!isOpen()) {
          receipt.style.height = ''
          delete receipt.dataset.lift
        }
      }
      receipt.addEventListener('transitionend', done)
    }
    const onReceipt = (e: MouseEvent) => {
      if (!receipt) return
      if (receipt.contains(e.target as Node)) setReceipt(!isOpen())
      else if (isOpen()) setReceipt(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen()) setReceipt(false)
      if (e.target === receipt && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        setReceipt(!isOpen())
      }
    }
    // the slot fades the paper only while the paper is longer than the room it has
    const fits = new ResizeObserver(() => {
      if (slot && paper)
        slot.toggleAttribute('data-over', paper.offsetHeight > slot.offsetHeight + 1)
    })
    if (slot && paper) {
      fits.observe(slot)
      fits.observe(paper)
    }
    document.addEventListener('click', onReceipt)
    document.addEventListener('keydown', onKey)
    closeReceipt = () => setReceipt(false)
    draw()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      liquid?.stop()
      stage.removeEventListener('click', go)
      stage.removeEventListener('rv', onReveal)
      cancelAnimationFrame(introFrame)
      fits.disconnect()
      document.removeEventListener('click', onReceipt)
      document.removeEventListener('keydown', onKey)
      holder.replaceChildren()
      clearTimeout(restart)
      adapt(false)
      delete stage.dataset.liquid
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  const STEP_KEYS = ['one', 'apart', 'fates', 'half'] as const
  const door = (
    <Link href="/projects/ready2order" className="r2o-door">
      {t('door')} <span aria-hidden="true">→</span>
    </Link>
  )
  const intro = (
    <>
      <a
        className="r2o-logo rv-b"
        style={riseAt(0)}
        href="https://ready2order.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static mark; next/image adds nothing here */}
        <img
          src="/images/r2o/ready2order-logo-on-ink.webp"
          alt={t('logo')}
          width={640}
          height={108}
        />
      </a>
      <p className="r2o-label">
        <Rise text={t('label')} at={0.08} />
      </p>
      <h2 id="r2o-title" className="r2o-ask">
        <Rise text={t('question')} at={0.16} />
      </h2>
      <p className="r2o-who rv-b" style={riseAt(0.5)}>
        {t('who')}{' '}
        <a href="https://ready2order.com" target="_blank" rel="noopener noreferrer">
          {t('site')} <span aria-hidden="true">↗</span>
        </a>
      </p>
    </>
  )
  // the till's own receipt: it prints the story as it goes, and ends with the sum
  const line = (print: number, name: string, value?: string, gone = false, valueFrom = print) => (
    <div className={gone ? 'r2o-row r2o-gone' : 'r2o-row'} data-print={print} data-on="0">
      <span>{name}</span>
      <i />
      {value ? (
        <span data-print={valueFrom} data-on="0">
          {value}
        </span>
      ) : null}
    </div>
  )
  const receipt = (
    <div className="r2o-slot rv-b" style={riseAt(1.1)}>
      {/* tucked under the column's edge; a click or tap pulls the whole receipt up over the steps */}
      <div
        className="r2o-receipt"
        role="button"
        tabIndex={0}
        aria-expanded="false"
        aria-label={t('receipt.show')}
      >
        <div className="r2o-paper" aria-hidden="true">
          <p className="r2o-hd">{t('receipt.head')}</p>
          <p className="r2o-sub">{t('receipt.sub')}</p>
          {line(1, t('receipt.all'), '100%')}
          {line(2, t('receipt.app'), t('receipt.kept'), false, 3)}
          {line(2, t('receipt.deps'), t('receipt.updated'), false, 3)}
          {line(2, t('receipt.screens'), t('receipt.later'), false, 3)}
          {line(2, t('receipt.redux'), t('receipt.removed'), true, 3)}
          {line(3, t('receipt.webpack'), t('receipt.rewritten'))}
          <div className="r2o-tot" data-print={4} data-on="0">
            <span>{t('receipt.total')}</span>
            <strong>{t('result')}</strong>
          </div>
          <p className="r2o-thx" data-print={4} data-on="0">
            {t('receipt.thanks')}
          </p>
        </div>
      </div>
    </div>
  )

  if (reduced) {
    return (
      <section id="ready2order" className="r2o r2o--still" aria-labelledby="r2o-title">
        <div className="r2o-intro">{intro}</div>
        <ol className="r2o-steps">
          {STEP_KEYS.map((key, i) => (
            <li key={key} data-state="now">
              <span className="r2o-micro">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <b>{t(`steps.${key}.title`)}</b>
                <span className="r2o-text">{t(`steps.${key}.text`)}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="r2o-big">{t('result')}</p>
        <p className="r2o-micro">{t('map.metric')}</p>
        {door}
      </section>
    )
  }

  // a label's place (block:where) and when it shows (in, full, out, gone: scroll fractions)
  const label = (at: string, show: string, name: string, fate?: string) => (
    <p className="r2o-tag" data-at={at} data-show={show}>
      <span className="r2o-in">
        {name}
        {fate ? <em>{fate}</em> : null}
      </span>
    </p>
  )

  return (
    <section ref={trackRef} id="ready2order" className="r2o" aria-labelledby="r2o-title">
      <div ref={stageRef} className="r2o-stage" data-step="1">
        <div ref={liquidRef} className="r2o-liquid-holder" />
        {/* without WebGL2: the map's boxes and cut-out drops */}
        <div className="r2o-plain" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} data-rect />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element -- transformed every frame; next/image adds nothing here */}
          <img data-whole src="/images/r2o/body.png" alt="" draggable={false} />
          {GROUPS.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element -- as above
            <img key={g.key} data-drop src="/images/r2o/body.png" alt="" draggable={false} />
          ))}
        </div>

        <div className="r2o-left">
          <div className="r2o-intro">{intro}</div>
          {/* the story's path: four stretches that fill with the scroll; each one takes you to its step */}
          <nav className="r2o-path" aria-label={t('stepsLabel')}>
            <ol>
              {STEP_KEYS.map((key, i) => (
                <li key={key}>
                  <button type="button" data-tick={i}>
                    <span className="r2o-track rv-l" style={riseAt(0.6 + i * 0.1)}>
                      <span data-fill />
                    </span>
                    <span className="r2o-tick rv-b" style={riseAt(0.7 + i * 0.1)}>
                      {String(i + 1).padStart(2, '0')} {t(`steps.${key}.short`)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="r2o-now">
            {STEP_KEYS.map((key, i) => (
              <div key={key} className="r2o-step" data-step data-state={i === 0 ? 'now' : 'next'}>
                <b>{t(`steps.${key}.title`)}</b>
                <p>
                  {t(`steps.${key}.text`)}
                  {key === 'half' ? <> {door}</> : null}
                </p>
              </div>
            ))}
          </div>
          {receipt}
        </div>

        <div className="r2o-map" aria-hidden="true">
          <p className="r2o-cap" data-at="box:above" data-show="-1 0 0.14 0.17" data-intro="1.5">
            <span className="r2o-in">
              {t('map.whole')} · <b>100%</b>
            </span>
          </p>
          <p className="r2o-cap" data-at="box:above" data-show="0.17 0.2 0.38 0.41">
            <span className="r2o-in">{t('map.apart')}</span>
          </p>
          <p className="r2o-cap" data-at="box:above" data-show="0.41 0.44 0.64 0.67">
            <span className="r2o-in">{t('map.fates')}</span>
          </p>
          <p className="r2o-cap" data-at="box:above" data-show="0.67 0.7 2 2">
            <span className="r2o-in">{t('map.before')} · 100%</span>
          </p>
          <p className="r2o-cap" data-at="box:below" data-show="0.2 0.28 0.64 0.68">
            <span className="r2o-in">{t('map.illustrative')}</span>
          </p>
          <p className="r2o-cap" data-at="box:below" data-show="0.7 0.78 2 2">
            <span className="r2o-in">{t('map.metric')}</span>
          </p>
          {label('app', '0.2 0.28 0.46 0.52', t('parts.app.name'))}
          {label('deps', '0.2 0.28 0.46 0.52', t('parts.deps.name'))}
          {label('screens', '0.2 0.28 0.42 0.48', t('parts.screens.name'))}
          {label('redux', '0.2 0.28 0.42 0.46', t('parts.redux.name'))}
          {label('app', '0.46 0.52 0.66 0.7', t('parts.app.name'), t('parts.app.fate'))}
          {label('deps', '0.46 0.52 0.66 0.7', t('parts.deps.name'), t('parts.deps.fate'))}
          {label('redux', '0.48 0.54 0.64 0.68', 'Redux', t('parts.redux.fate'))}
          {label('shelf', '0.5 0.56 2 2', t('parts.shelf.name'), t('parts.shelf.fate'))}
          {label('half', '0.72 0.8 2 2', `${t('map.after')} · 50%`)}
          <p className="r2o-big" data-at="half:band" data-show="0.74 0.82 2 2">
            <span className="r2o-in">{t('result')}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
