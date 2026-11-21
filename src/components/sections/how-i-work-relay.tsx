'use client'

import { useEffect, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  type DropsStage,
  startDropsStage,
  supportsDrops,
} from '@/components/canvas/liquid-hero/drops-stage'
import { Rise, WORD_STEP } from '@/components/ui/rise'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useReveal } from '@/hooks/use-reveal'
import { useVisit } from '@/hooks/use-visit'

import './how-i-work-relay.css'

const ROLES = ['design', 'code', 'server', 'maintenance'] as const
type Role = (typeof ROLES)[number]
const BUILT = process.env.BUILD_DATE ?? ''
/** where a proof can be checked by hand */
const LINKS: Partial<Record<Role, string>> = {
  design: 'https://piczura.com',
  code: 'https://www.npmjs.com/package/payload-plugin-aspect-preview',
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const span = (p: number, from: number, to: number) => clamp01((p - from) / (to - from))
/** smooth in and out: everything here moves at the scroll's own steady pace */
const glide = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

/** the scroll through the track, 0..1: where each beat begins */
const T = {
  fall: 0.1, // the full stop leaves the line and lands on the project's line
  crack: 0.2, // how it is usually organised: four crafts, four teams
  open: 0.42, // fully cracked
  heal: 0.54, // here: the cracks close, one person
  whole: 0.74, // healed: the drop is whole again
  check: 0.8, // the drop sits on a craft, and its proof shows under it
  leave: 0.95, // the drop runs out under the screen, into the next one
}

type Pt = { x: number; y: number }

/**
 * Act 4, line 1: "the seams" (owner, 2026-11-20; concept by the Fable and Sonnet agents, merged).
 * One line, one drop. The line's full stop is a drop of the hero's liquid: the visitor's project.
 * It lands on one unbroken line under the four words of the sentence (design, code, server,
 * maintenance). Scrolling, the line cracks into four segments, four holders (designer, developer,
 * host, support): the drop, spread across them, tears into four, and at every crack a bead of it
 * falls in and drains away, named where it is lost (details, time, accountability). Scrolling on,
 * the cracks close, the holders become one name, the beads rise back and the drop is whole again;
 * the three words settle under the healed line in ink, as what stays. Then the drop sits on the
 * server and this visit's first byte is counted live; a click on any word moves it there.
 * Every position is a function of the scroll, so it plays back exactly when scrolled up.
 */
export function HowIWorkRelay() {
  const t = useTranslations('howIWork')
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const { visit, again } = useVisit()
  const [open, setOpen] = useState<Role>('server')
  const [shown, setShown] = useState(0)
  const [counting, setCounting] = useState(false)
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<Role>('server')
  const checkRef = useRef(false)
  // the line comes in word by word, as the narrow lines of the first act 4 did (owner, 2026-11-20)
  useReveal(trackRef, { at: 0.6 })

  useEffect(() => {
    openRef.current = open
  }, [open])

  // once the drop has landed, the proofs turn over by themselves, word by word, with the drop
  // moving along (owner, 2026-11-20: like a carousel); the visitor's own hover or tap stops it
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!counting || !auto || reduced) return
    const id = window.setInterval(() => {
      setOpen((o) => ROLES[(ROLES.indexOf(o) + 1) % ROLES.length])
    }, 4200)
    return () => window.clearInterval(id)
  }, [counting, auto, reduced])

  // the first byte counts up to what this visit measured, once the drop sits on the server
  useEffect(() => {
    if (!counting || visit.ms === null) return
    const to = visit.ms
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = 1 - Math.pow(1 - clamp01((now - t0) / 900), 3)
      setShown(Math.round(to * k))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [counting, visit.ms])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    const holder = holderRef.current
    if (!track || !stage || !holder) return

    const segs = Array.from(stage.querySelectorAll<HTMLElement>('[data-seg]'))
    const holders = Array.from(stage.querySelectorAll<HTMLElement>('[data-holder]'))
    const proof = stage.querySelector<HTMLElement>('[data-proof]')
    const tag = stage.querySelector<HTMLElement>('[data-tag]')
    const who = stage.querySelector<HTMLElement>('[data-who]')
    const stop = stage.querySelector<HTMLElement>('.rl-stop')

    // --- the geometry, px of the stage
    let W = 0
    let H = 0
    let R = 40
    let phone = false
    let lineY = 0
    let x0 = 0
    let L = 0
    let C = 0
    let dot: Pt = { x: 0, y: 0 }
    const line = stage.querySelector<HTMLElement>('.rl-track')
    const sentence = stage.querySelector<HTMLElement>('.rl-line')
    const measure = () => {
      W = stage.clientWidth
      H = stage.clientHeight
      phone = W <= 700
      // the text keeps the site's own margin, as the header and every act above it do; only the line
      // is centred between the margins, at most 1500px long (longer, the cracked drop crumbles)
      const margin = W * 0.0667
      const inner = W - margin * 2
      L = phone ? inner : Math.min(inner * (W >= 1100 ? 0.78 : 1), 1500)
      x0 = (W - L) / 2
      // a big drop, low in the frame: the paper above the line is the room it splits and merges in
      R = phone ? Math.min(W * 0.11, 46) : Math.max(34, Math.min(120, H * 0.105, L * 0.085))
      // the line sits under the sentence (once it has stepped back to the top) with room for the name
      // above the drop, and leaves room under it for the proof; the sentence decides, not a fixed %
      const headTop = phone ? 120 : 144
      const headBottom = headTop + (sentence?.offsetHeight ?? 0) * (phone ? 0.62 : 0.56)
      lineY = Math.max(H * (phone ? 0.56 : 0.66), headBottom + R * 3.05 + 36)
      // the proof needs about 190px under the line; on a short screen the drop shrinks to make room
      const over = lineY + 190 - H
      if (over > 0) {
        R = Math.max(22, R - over / 3)
        lineY = Math.max(headBottom + R * 3.05 + 36, H - 190)
      }
      if (line) {
        line.style.left = `${x0}px`
        line.style.width = `${L}px`
        line.style.top = `${lineY}px`
      }
      // narrow cracks: the cracked line still reads as one line, not as four cards
      C = phone ? 14 : 48
      stage.style.setProperty('--R', `${R}px`)
      readDot()
    }
    const readDot = () => {
      if (!stop) return
      const sr = stage.getBoundingClientRect()
      const r = stop.getBoundingClientRect()
      // the drop is far bigger than a full stop: it sits just after the last letter, on the baseline
      dot = { x: r.left - sr.left + R * 1.1, y: r.top - sr.top + r.height * 0.8 - R }
      // never squeezed against the screen's edge: past the margin it waits just inside it
      dot.x = Math.min(dot.x, sr.width - sr.width * 0.0667 - R)
    }

    let p = 0
    // how far the line is cracked, 0..1
    const gapAt = (q: number) =>
      q < T.heal ? glide(span(q, T.crack, T.open)) : 1 - glide(span(q, T.heal, T.whole))
    // the line keeps its ends; the cracks open inside it and the segments shorten to make room
    const segW = (g: number) => (L - 3 * C * g) / 4
    const segX = (i: number, g: number) => x0 + segW(g) / 2 + i * (segW(g) + C * g)
    const centre = (): Pt => ({ x: x0 + L / 2, y: lineY - R * 1.05 })
    const targets = (): Pt[] => {
      const g = gapAt(p)
      const rest = centre()
      // before the line: the drop is the sentence's full stop
      if (p < T.fall) {
        readDot()
        return Array<Pt>(4).fill(dot)
      }
      const land = glide(span(p, T.fall, T.crack))
      const at = { x: lerp(dot.x, rest.x, land), y: lerp(dot.y, rest.y, land) }
      if (land < 1) return Array<Pt>(4).fill(at)
      // healed: the whole drop goes to the craft the visitor asks about (the server at first)
      if (p >= T.check) {
        const i = ROLES.indexOf(openRef.current)
        // at the very end the drop runs out through the bottom: it rises again under the next
        // screen's template (how-i-work-stock.tsx)
        const out = glide(span(p, T.leave, 1))
        return Array<Pt>(4).fill({ x: segX(i, 0), y: lerp(rest.y, H + R * 4, out) })
      }
      // cracked: four equal parts, one resting on each segment; nothing is lost
      return [0, 1, 2, 3].map((i) => ({
        x: lerp(rest.x, segX(i, g), g),
        y: lerp(rest.y, lineY - R * 0.62, g),
      }))
    }

    // the text follows the same scroll, every frame, so it never runs ahead of the liquid
    const place = () => {
      const g = gapAt(p)
      const on = p >= T.crack - 0.02 && p < T.check
      segs.forEach((el, i) => {
        el.style.left = `${segX(i, g) - segW(g) / 2 - x0}px`
        el.style.width = `${segW(g)}px`
      })
      holders.forEach((el) => {
        el.style.opacity = String(p < T.heal ? g : 0)
      })
      if (who) {
        const k = p >= T.heal ? 1 - g : 0
        who.style.opacity = String(k)
        who.style.translate = `${x0 + L / 2}px ${lineY - R * 3.05}px`
      }
      if (tag) {
        tag.style.opacity = String(p >= T.fall + 0.04 && g < 0.25 && p < T.check ? 1 : 0)
        tag.style.translate = `${x0 + L / 2}px ${lineY - R * 2.35}px`
      }
      // the proof stands in the open word's own column, in a row under the words
      // the proof stands under its word, at least wide enough to read, and never past the line's ends
      if (proof) {
        const i = ROLES.indexOf(openRef.current)
        const w = phone ? L : Math.min(L, Math.max(segW(0), 280))
        const left = Math.min(Math.max(segX(i, 0) - w / 2, x0), x0 + L - w)
        proof.style.width = `${w}px`
        // under the words, whatever size they are set in
        const words = stage.querySelector<HTMLElement>('.rl-word')?.offsetHeight ?? 50
        proof.style.translate = `${left}px ${lineY + words + 20}px`
      }
      stage.toggleAttribute('data-on', on)
      stage.style.setProperty('--g', g.toFixed(3))
    }

    let liquid: DropsStage | null = null
    const canDrops = supportsDrops() && !reduced
    const free = () => {
      liquid?.stop()
      liquid = null
      holder.replaceChildren()
      stage.removeAttribute('data-liquid')
    }
    const start = () => {
      free()
      if (!canDrops) return
      // a fresh canvas each time: a stopped stage has given up its WebGL context for good
      const canvas = document.createElement('canvas')
      canvas.className = 'rl-liquid'
      canvas.setAttribute('aria-hidden', 'true')
      holder.replaceChildren(canvas)
      stage.setAttribute('data-liquid', '')
      const part = R * 0.5
      liquid = startDropsStage({
        canvas,
        groups: [part, part, part, part],
        start: targets()[0],
        paper: true,
        frame: () => {
          place()
          return { targets: targets(), rects: [] }
        },
        onFail: free,
      })
    }
    // the liquid runs only while the scene is near the screen
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !liquid) start()
        else if (!entry.isIntersecting && liquid) free()
      },
      { rootMargin: '50% 0px' }
    )
    seen.observe(track)

    let frame = 0
    let beat = ''
    const draw = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      p = reduced ? 1 : clamp01(-rect.top / Math.max(1, travel))
      place()
      const now = p < T.fall ? 'line' : p < T.heal ? 'usual' : p < T.check ? 'mine' : 'check'
      if (now === beat) return
      beat = now
      stage.dataset.beat = now
      const check = now === 'check'
      if (check !== checkRef.current) {
        checkRef.current = check
        setCounting(check)
        // leaving the proofs and coming back starts the carousel again
        if (!check) setAuto(true)
      }
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw)
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
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      seen.disconnect()
      free()
      clearTimeout(restart)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  const teams = t.raw('relay.teams') as string[]
  const value = (role: Role): string | null => {
    if (role === 'server') return visit.ms === null ? '…' : `${counting ? shown : visit.ms}`
    if (role === 'maintenance' && BUILT)
      return new Date(BUILT).toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })
    return null
  }
  // two sentences: how it is usually done (said while the line is cracked), and how I do it (said
  // once it has healed); the last full stop is the drop, and it stands there before it falls
  const line = t('relay.line').replace(/[.。]$/, '')
  const cut = line.search(/[.:]\s/) + 1
  const head = cut > 0 ? line.slice(0, cut) : ''
  const rest = cut > 0 ? line.slice(cut).trim() : line
  const headWords = head ? head.split(/\s+/).length : 0

  return (
    <section ref={trackRef} id="how-i-work" className="rl" aria-labelledby="rl-title">
      <div ref={stageRef} className="rl-stage" data-beat="line">
        <div ref={holderRef} className="rl-drop" aria-hidden="true" />
        <h2 id="rl-title" className="rl-act">
          {t('title')}
        </h2>
        <p className="rl-line">
          {head && (
            <>
              <span className="rl-usual">
                <Rise text={head} />
              </span>
              <br />
            </>
          )}
          <span className="rl-mine">
            <Rise text={rest} at={headWords * WORD_STEP + 0.1} />
          </span>
          <span className="rl-stop">.</span>
        </p>

        {/* the one line: four segments, each under one word of the sentence */}
        <ol className="rl-track">
          {ROLES.map((role, i) => (
            <li key={role} data-seg data-open={open === role || undefined}>
              <button
                type="button"
                className="rl-word"
                aria-expanded={open === role}
                aria-controls="rl-proof"
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'mouse') return
                  setAuto(false)
                  setOpen(role)
                }}
                onClick={() => {
                  setAuto(false)
                  if (role === 'server' && open === 'server') void again()
                  setOpen(role)
                }}
              >
                {t(`roleNames.${role}`)}
              </button>
              <span className="rl-holder" data-holder aria-hidden="true">
                {teams[i]}
              </span>
            </li>
          ))}
        </ol>
        <span className="rl-who" data-who aria-hidden="true">
          Sebastian Kolbusz
        </span>
        <span className="rl-tag" data-tag aria-hidden="true">
          {t('relay.project')}
        </span>
        <p className="rl-count" aria-live="polite">
          <span data-n="usual">{t('relay.usualCount')}</span>
          <span data-n="mine">{t('relay.mineCount')}</span>
        </p>

        <div id="rl-proof" className="rl-proof" data-proof aria-live="polite">
          {ROLES.map((role) => (
            <div key={role} className="rl-proof-one" hidden={open !== role}>
              {value(role) !== null && (
                <p className="rl-big">
                  {value(role)}
                  {role === 'server' && <small>ms</small>}
                </p>
              )}
              <p className="rl-proof-t">
                {t(`roleProofs.${role}`, {
                  ms: visit.ms ?? '…',
                  s: visit.s === null ? '…' : visit.s.toLocaleString(locale),
                  date: BUILT ? new Date(BUILT).toLocaleDateString(locale) : '',
                })}
                {/* the link reads as part of the sentence: the same type, only underlined */}
                {LINKS[role] && (
                  <>
                    {' '}
                    <a className="rl-proof-a" href={LINKS[role]} target="_blank" rel="noopener">
                      {t(`roleLinks.${role}`)}&nbsp;↗
                    </a>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
        <p className="rl-hint" data-hint>
          {t('rolesHint')}
        </p>
      </div>
    </section>
  )
}
