'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  type DropsStage,
  startDropsStage,
  supportsDrops,
} from '@/components/canvas/liquid-hero/drops-stage'
import { usePrefersReducedMotion } from '@/hooks/use-media'

import './how-i-work-stock.css'

/** the parts of this page made for it, given back in this order */
const PARTS = ['drop', 'type', 'menu', 'cursor'] as const
type Part = (typeof PARTS)[number]

/** the scroll through the track, 0..1 */
const T = {
  rise: [0.06, 0.26], // the liquid rises from under the template into the image's place
  eat: [0.22, 0.34], // it swallows the placeholder and the button
  words: [0.36, 0.6], // the words fly from the template's layout into the site's own
  menu: 0.66,
  cursor: 0.76,
  borrowed: 0.86,
} as const
/** when each part's note shows */
const NOTE: Record<Part, number> = { drop: 0.3, type: 0.6, menu: T.menu, cursor: T.cursor }
/** how long the drop is held before the template takes the words too, ms */
const TAKE_WORDS = 3000
/** how fast holding turns the page stock and letting go gives it back, ms */
const TURN = 380

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const glide = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

type Box = { x: number; y: number; w: number; h: number }

/**
 * Act 4, line 2: "nothing off the shelf" (owner, 2026-11-21; concept by the Fable agent, rebuilt
 * after the owner's review the same day). The screen comes in as a template: the same sentence
 * centred in a default font, a grey image placeholder and a stock button; the page around it goes
 * stock too (a hamburger, the system arrow: data-stock on <html>). The liquid that left line 1 rises
 * from under the template into the image's place and swallows the placeholder and the button. Then
 * every word flies from the template's layout into the site's own type and place, and the menu
 * and the cursor come back. Each part gets one note where it sits. Holding the drop turns it all
 * back into the template; held for three seconds, the template takes the words too.
 * Everything is a function of the scroll (and of the hold), so it plays back when scrolled up.
 */
export function HowIWorkStock() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const heldRef = useRef(false)
  const [held, setHeld] = useState(false)
  const [words, setWords] = useState(false)
  const list = t('shelf').split(/\s+/).filter(Boolean)

  useEffect(() => {
    heldRef.current = held
    if (!held) return
    const id = window.setTimeout(() => setWords(true), TAKE_WORDS)
    return () => window.clearTimeout(id)
  }, [held])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    const holder = holderRef.current
    if (!track || !stage || !holder) return
    const root = document.documentElement
    const fine = matchMedia('(pointer: fine)').matches
    const finals = Array.from(stage.querySelectorAll<HTMLElement>('.st-fw'))
    const temps = Array.from(stage.querySelectorAll<HTMLElement>('.st-tw'))
    const tpl = stage.querySelector<HTMLElement>('.st-tpl')
    const box = stage.querySelector<HTMLElement>('.st-box')
    const cta = stage.querySelector<HTMLElement>('.st-cta')
    const line = stage.querySelector<HTMLElement>('.st-line')

    // --- the geometry, px of the stage (pinned: the stage is the screen)
    let W = 0
    let H = 0
    let R = 60
    let drop = { x: 0, y: 0 }
    let boxAt = { x: 0, y: 0 }
    let at = { x: 0, y: 0 }
    let rF: Box[] = []
    let rT: Box[] = []
    let rCta: Box = { x: 0, y: 0, w: 0, h: 0 }
    const rel = (el: Element, sr: DOMRect): Box => {
      const r = el.getBoundingClientRect()
      return {
        x: r.left - sr.left + r.width / 2,
        y: r.top - sr.top + r.height / 2,
        w: r.width,
        h: r.height,
      }
    }
    const measure = () => {
      W = stage.clientWidth
      H = stage.clientHeight
      const margin = W * 0.0667
      const inner = W - margin * 2
      const wide = W >= 1000 && W / H > 1.15
      R = W <= 700 ? Math.min(W * 0.13, 52) : Math.max(44, Math.min(100, H * 0.09, W * 0.062))
      const dropX = margin + inner * 0.74
      stage.toggleAttribute('data-wide', wide)
      if (line) line.style.maxWidth = `${wide ? dropX - R * 1.6 - 64 - margin : inner}px`
      stage.style.setProperty('--R', `${R}px`)
      // every word where it ends (the site's own) and where it starts (the template's)
      for (const el of [...finals, ...temps]) el.style.transform = ''
      if (cta) cta.style.transform = ''
      const sr = stage.getBoundingClientRect()
      const lr = line?.getBoundingClientRect()
      const under = lr ? lr.bottom - sr.top : H * 0.4
      drop = wide
        ? { x: dropX, y: H * 0.5 }
        : { x: W / 2, y: Math.min(H * 0.6, under + R * 1.6 + 28) }
      // the template's image: in the right half of the template's container (a split hero), or
      // under its text when the screen is not wide
      const tr = tpl?.getBoundingClientRect()
      const cr = cta?.getBoundingClientRect()
      boxAt =
        wide && tr
          ? { x: tr.left - sr.left + tr.width * 0.75, y: H * 0.5 }
          : { x: W / 2, y: cr ? cr.bottom - sr.top + R * 1.3 + 72 : drop.y }
      stage.style.setProperty('--bx', `${boxAt.x}px`)
      stage.style.setProperty('--by', `${boxAt.y}px`)
      stage.style.setProperty('--lb', `${under}px`)
      const typeNote = stage.querySelector<HTMLElement>('[data-part="type"]')
      if (typeNote) stage.style.setProperty('--th', `${typeNote.offsetHeight}px`)
      rF = finals.map((el) => rel(el, sr))
      rT = temps.map((el) => rel(el, sr))
      if (cta) rCta = rel(cta, sr)
    }

    // --- the state: scroll p, and the hold h (0 given back .. 1 all stock), eased in time
    let p = 0
    let near = false
    let h = 0
    let hTo = 0
    let hAt = 0
    let hFrom = 0
    const holdNow = () => {
      const k = clamp01((performance.now() - hAt) / TURN)
      h = lerp(hFrom, hTo, glide(k))
      return k < 1
    }

    // the page around the screen: what is stock now, which notes show
    const parts = PARTS.filter((part) => part !== 'cursor' || fine)
    const back = (part: Part) =>
      part === 'drop'
        ? p >= T.eat[0]
        : part === 'type'
          ? p >= T.words[1]
          : p >= (part === 'menu' ? T.menu : T.cursor)
    const page = () => {
      const stock = h > 0.5 ? parts : parts.filter((part) => !back(part))
      const value = near ? stock.filter((s) => s === 'menu' || s === 'cursor').join(' ') : ''
      if ((root.dataset.stock ?? '') !== value) {
        if (value) root.dataset.stock = value
        else delete root.dataset.stock
      }
      const notes = h > 0.5 ? [] : parts.filter((part) => p >= NOTE[part])
      const shown = notes.join(' ')
      if (stage.dataset.notes !== shown) stage.dataset.notes = shown
      stage.dataset.last = notes[notes.length - 1] ?? ''
      stage.toggleAttribute('data-borrowed', p >= (fine ? T.borrowed : T.cursor) && h < 0.5)
      stage.toggleAttribute('data-stock', stock.includes('drop'))
    }

    // the screen: placeholder, button and words, every frame, from p and h
    const place = () => {
      const stay = 1 - h
      const eat = glide(span(p, T.eat)) * stay
      if (box) {
        box.style.opacity = String(1 - eat)
        box.style.transform = `scale(${lerp(1, 0.5, eat)})`
      }
      if (cta) {
        // the button is pulled into the drop and taken in
        const k = glide(span(p, [T.eat[0] + 0.03, T.eat[1]])) * stay
        cta.style.transform = `translate(${(boxAt.x - rCta.x) * k}px, ${(boxAt.y - rCta.y) * k}px) scale(${lerp(1, 0.15, k)})`
        cta.style.opacity = String(1 - glide((k - 0.6) / 0.4))
      }
      const kw = span(p, T.words)
      const n = rF.length
      const each = 0.45
      const step = n > 1 ? (1 - each) / (n - 1) : 0
      for (let i = 0; i < n; i++) {
        const a = rF[i]
        const b = rT[i]
        if (!a || !b) continue
        const k = glide((kw - i * step) / each) * stay
        // the site's own word flies from the template's place and size into its own
        finals[i].style.transform =
          `translate(${(b.x - a.x) * (1 - k)}px, ${(b.y - a.y) * (1 - k)}px) ` +
          `scale(${lerp(b.h / a.h, 1, k)})`
        finals[i].style.opacity = String(clamp01((k - 0.42) / 0.16))
        temps[i].style.transform =
          `translate(${(a.x - b.x) * k}px, ${(a.y - b.y) * k}px) ` +
          `scale(${lerp(1, a.h / b.h, k)})`
        temps[i].style.opacity = String(1 - clamp01((k - 0.42) / 0.16))
      }
      tpl?.toggleAttribute('data-gone', kw >= 1 && h === 0)
      // the liquid hides while the page is held stock
      holder.style.opacity = String(stay)
      // the drop's labels and the hold go where the drop is
      const now = target()
      if (Math.abs(now.x - at.x) > 0.5 || Math.abs(now.y - at.y) > 0.5) {
        at = now
        stage.style.setProperty('--dx', `${now.x.toFixed(1)}px`)
        stage.style.setProperty('--dy', `${Math.min(now.y, H + R).toFixed(1)}px`)
      }
    }

    // the liquid: it waits under the template and rises into the image's place
    let liquid: DropsStage | null = null
    const canDrops = supportsDrops() && !reduced
    // where the drop is now: risen into the image's place, then carried along with the layout
    const target = () => {
      const k = glide(span(p, T.rise))
      const m = glide(span(p, T.words))
      const x = lerp(boxAt.x, drop.x, m)
      const y = lerp(boxAt.y, drop.y, m)
      // at the very end it runs out through the bottom again, on to the next screen
      const out = glide(span(p, [0.95, 1]))
      return { x, y: lerp(lerp(H + R * 4, y, k), H + R * 4, out) }
    }
    const free = () => {
      liquid?.stop()
      liquid = null
      holder.replaceChildren()
      stage.removeAttribute('data-liquid')
    }
    const start = () => {
      free()
      if (!canDrops) return
      const canvas = document.createElement('canvas')
      canvas.className = 'st-liquid'
      canvas.setAttribute('aria-hidden', 'true')
      holder.replaceChildren(canvas)
      stage.setAttribute('data-liquid', '')
      liquid = startDropsStage({
        canvas,
        groups: [R * 0.72, R * 0.72],
        start: target(),
        paper: true,
        frame: () => {
          const at = target()
          return { targets: [at, at], rects: [] }
        },
        onFail: free,
      })
    }
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !liquid) start()
        else if (!entry.isIntersecting && liquid) free()
      },
      { rootMargin: '50% 0px' }
    )
    seen.observe(track)

    let frame = 0
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    function draw() {
      frame = 0
      const rect = track!.getBoundingClientRect()
      const vh = window.innerHeight
      p = reduced ? 1 : clamp01(-rect.top / Math.max(1, rect.height - vh))
      // the page is stock from when the template is half up the screen until it has half left it
      near = !reduced && rect.top < vh * 0.5 && rect.bottom > vh * 0.5
      const turning = holdNow()
      page()
      place()
      if (turning) request()
    }
    const onHeld = () => {
      hFrom = h
      hTo = heldRef.current ? 1 : 0
      hAt = performance.now()
      request()
    }
    let restart = 0
    const onResize = () => {
      measure()
      request()
      clearTimeout(restart)
      restart = window.setTimeout(() => liquid && start(), 200)
    }
    void document.fonts.ready.then(() => {
      measure()
      request()
    })
    measure()
    draw()
    stage.addEventListener('st-held', onHeld)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      seen.disconnect()
      free()
      clearTimeout(restart)
      cancelAnimationFrame(frame)
      delete root.dataset.stock
      stage.removeEventListener('st-held', onHeld)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  useEffect(() => {
    stageRef.current?.dispatchEvent(new Event('st-held'))
  }, [held])

  const hold = (on: boolean) => {
    setHeld(on)
    if (!on) setWords(false)
  }

  return (
    <section ref={trackRef} className="st" aria-labelledby="st-title">
      <div ref={stageRef} className="st-stage" data-held={held || undefined}>
        {/* the template this screen starts as: the same sentence, set the way a template sets it */}
        <div className="st-tpl" aria-hidden="true" data-words={words || undefined}>
          <p className="st-tpl-h">
            {list.map((w, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className="st-tw">{w}</span>
              </span>
            ))}
          </p>
          <p className="st-tpl-ph">{t('stock.placeholder')}</p>
          <span className="st-cta">{t('stock.cta')}</span>
        </div>
        <span className="st-box" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0L100 100M100 0L0 100" />
          </svg>
        </span>
        <div ref={holderRef} className="st-drop" aria-hidden="true" />

        <h3 id="st-title" className="st-line">
          {list.map((w, i) => (
            <span key={i}>
              {i > 0 && ' '}
              <span className="st-fw">{w}</span>
            </span>
          ))}
        </h3>

        <span className="st-label" aria-hidden="true">
          {t('stock.stockLabel')}
        </span>
        <button
          type="button"
          className="st-hold"
          aria-label={t('stock.holdLabel')}
          aria-pressed={held}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            hold(true)
          }}
          onPointerUp={() => hold(false)}
          onPointerCancel={() => hold(false)}
          onLostPointerCapture={() => hold(false)}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault()
              hold(true)
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') hold(false)
          }}
          onBlur={() => hold(false)}
          onContextMenu={(e) => e.preventDefault()}
        />
        <span className="st-hint" aria-hidden="true">
          {t('stock.hold')}
        </span>

        {PARTS.map((part) => (
          <p key={part} className="st-note" data-part={part}>
            {t(`stock.${part === 'drop' ? 'liquid' : part}`)}
          </p>
        ))}
        <p className="st-borrowed">{t('stock.borrowed').replace('next-intl', 'next‑intl')}</p>
      </div>
    </section>
  )
}
