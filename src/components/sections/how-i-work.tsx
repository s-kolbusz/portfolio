'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  type DropsStage,
  startDropsStage,
  supportsDrops,
} from '@/components/canvas/liquid-hero/drops-stage'
import { Rise } from '@/components/ui/rise'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { reverseDelays } from '@/hooks/use-reveal'

import './how-i-work.css'

const LINES = ['alone', 'shelf', 'vision', 'fixed'] as const
/** where each line becomes the one being read, as scroll progress through the section */
const STEPS = [0, 0.25, 0.5, 0.72]
const SITE = 'https://stronypodhale.pl'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** a line's text with its <mark> part as the stronypodhale.pl wordmark, a link that rises whole */
function Line({ text }: { text: string }) {
  const m = /^(.*?)<mark>(.*?)<\/mark>(.*)$/.exec(text)
  if (!m) return <Rise text={text} />
  const before = m[1].trim()
  const after = m[3].trim()
  const words = before ? before.split(/\s+/).length : 0
  const out: ReactNode[] = []
  if (before) out.push(<Rise key="b" text={before} />, ' ')
  out.push(
    <a
      key="m"
      href={SITE}
      target="_blank"
      rel="noopener"
      className="hiw-mark rv-b"
      style={{ ['--d' as string]: words * 0.04 }}
    >
      <span className="acc">strony</span>
      <span className="str">podhale</span>
      <span className="acc">.pl</span>
    </a>
  )
  if (after) {
    if (/^\s/.test(m[3])) out.push(' ')
    out.push(<Rise key="a" text={after} at={(words + 1) * 0.04} />)
  }
  return <>{out}</>
}

/**
 * Act 4, the breath: after the dense act 3 the page slows down to the four lines on how I work
 * (agreed by the owner, 2026-11-15). One line at a time takes the stage as the page scrolls;
 * a read line fades to grey and stays, so at the end all four stand together. A small drop of the
 * hero's liquid (the attention, concept section 8) waits beside the line being read and flows to
 * the next; at the last line it takes the dark green of the stronypodhale.pl sheet.
 */
export function HowIWork() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const stage = stageRef.current
    const holder = liquidRef.current
    if (!track || !stage || !holder) return
    const lines = Array.from(stage.querySelectorAll<HTMLElement>('[data-line]'))
    // each line is a reveal of its own (rise.css): its words leave last-in first-out, 1.4x faster
    for (const line of lines) {
      const items = Array.from(line.querySelectorAll<HTMLElement>('.rv-i, .rv-b'))
      const delays = items.map((el) => parseFloat(el.style.getPropertyValue('--d')) || 0)
      reverseDelays(delays).forEach((d, i) => items[i].style.setProperty('--dr', d.toFixed(3)))
      line.setAttribute('data-rv', '')
    }

    let p = -1
    let now = -1
    let first = true
    let frame = 0
    // where the drop waits for each line, in the stage's px, and its size
    let spots: { x: number; y: number }[] = []
    let radius = 0
    const measure = () => {
      const sr = stage.getBoundingClientRect()
      const phone = sr.width <= 700
      radius = phone ? 13 : Math.max(16, Math.min(30, sr.height * 0.03))
      spots = lines.map((line) => {
        const text = line.querySelector<HTMLElement>('.hiw-text') ?? line
        const r = text.getBoundingClientRect()
        const right = line.dataset.side === 'right'
        const firstRow = parseFloat(getComputedStyle(text).lineHeight) || r.height
        if (phone)
          return {
            x: right ? r.right - sr.left - radius : r.left - sr.left + radius,
            y: r.top - sr.top - radius - 12,
          }
        return {
          // always ahead of the line's first word: in the page margin for a line on the left,
          // in the open space before a line set to the right
          x: right ? r.left - sr.left - radius * 2.6 : (r.left - sr.left) / 2,
          y: r.top - sr.top + firstRow / 2,
        }
      })
    }
    measure()

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
    }
    const start = () => {
      free()
      if (!canDrops || !near()) return
      // a fresh canvas each time: a stopped stage has given up its WebGL context for good
      const canvas = document.createElement('canvas')
      canvas.className = 'hiw-liquid'
      canvas.setAttribute('aria-hidden', 'true')
      holder.replaceChildren(canvas)
      const at = spots[Math.max(0, now)] ?? spots[0]
      liquid = startDropsStage({
        canvas,
        groups: [radius],
        start: at,
        paper: true,
        frame: () => ({
          targets: [spots[Math.max(0, now)] ?? spots[0]],
          rects: [],
          tint: clamp01((p - STEPS[3]) / 0.08),
        }),
        onFail: free,
      })
    }

    const draw = () => {
      frame = 0
      const isNear = near()
      if (isNear && !liquid && canDrops) start()
      else if (!isNear && liquid) free()
      const rect = track.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = rect.height - vh
      // the first line comes up while the stage is still half a screen below its place
      p = (vh * 0.5 - rect.top) / (travel + vh * 0.5)
      let at = -1
      STEPS.forEach((s, i) => {
        if (p >= s) at = i
      })
      if (at === now && !first) return
      now = at
      lines.forEach((line, i) => {
        const state = i === now ? 'now' : i < now ? 'past' : 'next'
        if (line.dataset.state === state) return
        // a reload in the middle of the section sets the lines in place: nothing plays
        if (first) line.setAttribute('data-rv-now', '')
        line.dataset.state = state
        line.toggleAttribute('data-in', state !== 'next')
      })
      if (first)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => lines.forEach((l) => l.removeAttribute('data-rv-now')))
        )
      first = false
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    // a new size: new places for the drop, and a new canvas for the new size
    let restart = 0
    const onResize = () => {
      measure()
      request()
      clearTimeout(restart)
      restart = window.setTimeout(() => liquid && start(), 200)
    }
    draw()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      free()
      clearTimeout(restart)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
      for (const line of lines) {
        line.removeAttribute('data-rv')
        line.removeAttribute('data-in')
        delete line.dataset.state
      }
    }
  }, [reduced])

  return (
    <section ref={trackRef} id="how-i-work" className="hiw" aria-labelledby="hiw-title">
      <div ref={stageRef} className="hiw-stage">
        <div ref={liquidRef} className="hiw-drop" aria-hidden="true" />
        <h2 id="hiw-title" className="sr-only">
          {t('title')}
        </h2>
        {LINES.map((key, i) => (
          <p key={key} className="hiw-line" data-line={key} data-side={i % 2 ? 'right' : 'left'}>
            <span className="hiw-text">
              <Line text={t.raw(key) as string} />
            </span>
          </p>
        ))}
      </div>
    </section>
  )
}
