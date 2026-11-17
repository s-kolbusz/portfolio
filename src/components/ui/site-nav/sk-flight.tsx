'use client'

// S and K leave the hero name for the bar's corner: the loader unfolded the initials into the name, this
// folds them back. Driven by the scroll (from 0.35 to 0.9 of a screen, while the rest of the name sinks under
// the water sheet) or, with the menu opened on the hero, by the menu's own pour (same length, same curve).
// The hero reports where its S and K stand in `.lq-stage[data-name]` and stops drawing them while
// `data-sk-cut` is 1 (liquid-stage.ts). Both sides are worked out from the frame time alone, and the hero asks
// for it (`lq-frame`) before it draws, so the swap between its letters and these happens in one frame.

import { useEffect, useRef, useState, type RefObject } from 'react'

import { OPEN_SECONDS, openEase } from './menu-water'

const SCROLL_FROM = 0.35
const SCROLL_TO = 0.9

interface NameData {
  s: [number, number]
  k: [number, number]
  size: number
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** where the baseline sits inside a Mattone Black line box with line-height 1, as a share of the font size */
function baselineRatio() {
  const c = document.createElement('canvas').getContext('2d')
  if (!c) return 0.8
  c.font = '900 100px "Mattone"'
  const m = c.measureText('SK')
  const a = m.fontBoundingBoxAscent || 80,
    d = m.fontBoundingBoxDescent || 20
  return (1 - (a + d) / 100) / 2 + a / 100
}

export function useSkFlight({
  enabled,
  cornerRef,
  menuOpen,
}: {
  enabled: boolean
  cornerRef: RefObject<HTMLElement | null>
  menuOpen: boolean
}) {
  const [landed, setLanded] = useState(!enabled)
  const sRef = useRef<HTMLSpanElement>(null)
  const kRef = useRef<HTMLSpanElement>(null)
  // the menu's share of the flight is a function of time: where it was when the menu last opened or closed
  const menuMove = useRef({ open: menuOpen, from: 0, at: 0 })

  useEffect(() => {
    const m = menuMove.current
    if (m.open === menuOpen) return
    const now = performance.now()
    const u = clamp01(m.from + (m.open ? 1 : -1) * ((now - m.at) / 1000 / OPEN_SECONDS))
    menuMove.current = { open: menuOpen, from: u, at: now }
  }, [menuOpen])

  useEffect(() => {
    if (!enabled) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ratio = 0
    let wasLanded: boolean | null = null
    let raf = 0

    const update = (now: number) => {
      const s = sRef.current,
        k = kRef.current,
        corner = cornerRef.current
      const stage = document.querySelector<HTMLElement>('.lq-stage[data-name]')
      if (!s || !k || !corner) return
      let p = 1
      let data: NameData | null = null
      if (stage && !reduced) {
        data = JSON.parse(stage.dataset.name ?? 'null') as NameData | null
        const vh = window.innerHeight
        const byScroll = clamp01(
          (window.scrollY - SCROLL_FROM * vh) / ((SCROLL_TO - SCROLL_FROM) * vh)
        )
        const m = menuMove.current
        const u = clamp01(m.from + (m.open ? 1 : -1) * ((now - m.at) / 1000 / OPEN_SECONDS))
        p = Math.max(byScroll, openEase(u))
      }
      // the hero stops drawing its own S and K exactly when these show up (same decision, same frame)
      const flying = !!data && p > 0
      if (stage) stage.dataset.skCut = flying ? '1' : '0'
      const isLanded = !data || p >= 1
      if (isLanded !== wasLanded) {
        wasLanded = isLanded
        setLanded(isLanded)
      }
      if (isLanded || !data || !stage) {
        s.style.opacity = k.style.opacity = '0'
        return
      }
      if (!ratio) ratio = baselineRatio()
      const e = openEase(p)
      const stageRect = stage.getBoundingClientRect()
      const fs1 = parseFloat(getComputedStyle(corner).fontSize) || 19
      const place = (el: HTMLElement, start: [number, number], letter: 's' | 'k') => {
        const target = corner.querySelector<HTMLElement>(`[data-sk-letter="${letter}"]`)
        if (!target) return
        const r = target.getBoundingClientRect()
        const x = lerp(stageRect.left + start[0], r.left, e)
        const base = lerp(stageRect.top + start[1], r.top + ratio * fs1, e)
        const fs = lerp(data!.size, fs1, e)
        el.style.fontSize = `${fs}px`
        el.style.transform = `translate(${x}px, ${base - ratio * fs}px)`
        el.style.opacity = flying ? '1' : '0'
      }
      place(s, data.s, 's')
      place(k, data.k, 'k')
    }

    // the hero calls in every frame it draws; when it does not draw (scrolled away), our own frames keep going
    const onHeroFrame = (e: Event) => update((e as CustomEvent<number>).detail)
    document.addEventListener('lq-frame', onHeroFrame)
    const loop = (now: number) => {
      update(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('lq-frame', onHeroFrame)
    }
  }, [enabled, cornerRef])

  const node = enabled ? (
    <span className="site-sk-fly" aria-hidden="true">
      <span ref={sRef}>S</span>
      <span ref={kRef}>K</span>
    </span>
  ) : null

  return { landed: enabled ? landed : true, node }
}
