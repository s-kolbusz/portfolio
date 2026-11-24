'use client'

import { type CSSProperties, useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { usePrefersReducedMotion } from '@/hooks/use-media'

import type { Box, GroundState } from './how-i-work-end-ground'
import { createGround } from './how-i-work-end-ground'

import './how-i-work-end.css'

const STRONY = 'https://stronypodhale.pl'
const MAIL = 'office@kolbusz.xyz'
/**
 * The pinned sequence, in screens scrolled since the close took the screen. What is written on the
 * sheet comes in one step at a time: the first group's heading, its two offers and the line they
 * share; the second group's heading comes right after its card is set into the gap (0.76), then its
 * offers, then the line that writes to him.
 */
const S = {
  cover: [0, 0.5], // paper rises over the last frame of screen 3
  steps: [0.42, 0.62, 0.8, 0.95, 0.76, 1.02, 1.16, 1.3],
  written: 1.64, // everything is written; the lift waits a little and starts (site-nav/stops.ts)
  swap: 1.05, // on a phone the second group takes the first one's place
  lift: 1, // then the sheet lifts off stronypodhale.pl: this many screens
} as const
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const glide = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}
const ease = (t: number) => {
  const c = clamp01(t)
  return c * c * c * (c * (c * 6 - 15) + 10)
}

/**
 * What the drawn ground does at each point of the scroll. Left: the card lands, then its structure
 * grows from it. Right: the system is there, and a beat later the card is set into its gap. On a
 * phone the first structure gives way to the system at the swap.
 */
const ground = (s: number, phone: boolean, l: number, foldTo: number): GroundState => {
  const fold = glide(span(l, [0, 0.6])) * foldTo
  // where the cards fold beside each other (a tablet), their structures are built again around them
  const refit = phone ? 0 : glide(span(l, [0.5, 0.85])) * foldTo
  // the structures stay if the cards do not have to fold
  const leave = glide(span(l, [0, 0.25])) * Math.min(1, foldTo * 5)
  if (phone) {
    const w = span(s, [0.98, 1.12])
    const lift = glide(span(l, [0, 0.3]))
    return {
      fold,
      leave,
      refit,
      sweep: ease(span(s, [0.96, 1.08])),
      land: ease(span(s, [0.28, 0.44])),
      grow: span(s, [0.5, 0.94]),
      mine: Math.max(1 - w, lift),
      slot: Math.max(ease(span(s, [1.04, 1.16])), lift),
    }
  }
  return {
    fold,
    leave,
    refit,
    sweep: 0,
    land: ease(span(s, [0.28, 0.44])),
    grow: span(s, [0.52, 1.04]),
    mine: 1,
    slot: ease(span(s, [0.56, 0.72])),
  }
}

const nb = (text: string) => text.replace(/ /g, '\u00a0')

/** one offer: its name, its price and unit, one line of what you get, and how a mail names it */
type Offer = [name: string, price: string, unit: string, line: string, about: string]
/** two facts beside an offer: a short label and its value */
type Facts = [label: string, value: string][]

/** the stronypodhale.pl wordmark as its logo: two weights, the accent on "strony" and ".pl" */
function Mark() {
  return (
    <span className="cl-mark">
      <span className="acc">strony</span>
      <span className="str">podhale</span>
      <span className="acc">.pl</span>
    </span>
  )
}

/** text that rises word by word from under its own line, once its block is in view */
function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className="cl-m">
            <span className="cl-w" style={{ '--i': from + i } as CSSProperties}>
              {w.startsWith('stronypodhale.pl') ? (
                <>
                  <Mark />
                  {w.slice('stronypodhale.pl'.length)}
                </>
              ) : (
                w
              )}
            </span>
          </span>
        </span>
      ))}
    </>
  )
}

/**
 * Act 4, the close: the price list (owner, 2026-11-24). Two plain cards of one family: "I build it
 * for you" (the app and the creative site) and "I work with you" (consulting and contract). Each
 * offer is a name, a green price, one line of what you get and two facts. What surrounds the cards
 * says how he works (how-i-work-end-ground.ts): on the left the paper starts empty, the card lands
 * and a structure of tiles grows from it; on the right a system of tiles is there from the start
 * and the card is set into its gap. No liquid here.
 * A sheet of paper rises over screen 3's last frame; on a phone the second group takes the first
 * one's place. Then the sheet lifts and uncovers stronypodhale.pl on its own dark green as a band
 * under his offer: his two cards keep most of the screen, and fold to names and prices only as far
 * as they must (on a phone). Everything is a function of the scroll, so it plays back when
 * scrolled up; with reduced motion the final state stands in the page's flow.
 */
export function HowIWorkEnd() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!root || !stage || !canvas) return
    const q = <E extends HTMLElement = HTMLElement>(sel: string) => stage.querySelector<E>(sel)
    const all = (sel: string) => Array.from(stage.querySelectorAll<HTMLElement>(sel))
    const paper = q('.cl-paper')
    const view = q('.cl-view')
    const top = q('.cl-top')
    const end = q('.cl-end')
    const list = q('.cl-list')
    const groups = q('.cl-groups')
    const two = q('.cl-two')
    const big = q('.cl-big')
    const foot = q('.cl-foot')
    const build = q('.cl-group[data-kind="build"]')
    const withYou = q('.cl-group[data-kind="with"]')
    const steps = all('[data-step]').sort((a, b) => +(a.dataset.step ?? 0) - +(b.dataset.step ?? 0))
    const folds = all('[data-fold]')
    const heads = all('.cl-gh')
    const blocks = all('.cl-end [data-block]')
    if (!paper || !view || !top || !end || !list || !groups || !two || !foot) return
    if (!build || !withYou) return
    root.dataset.ground =
      new URLSearchParams(location.search).get('ground') === 'paper' ? 'paper' : 'green'
    const on = (el: Element | null | undefined, yes: boolean) => el?.toggleAttribute('data-on', yes)
    const set = (name: string, px: number) => stage.style.setProperty(name, `${px.toFixed(2)}px`)
    /** the font size at which a one-line text is `width` wide, at most `cap` */
    const fit = (el: HTMLElement, width: number, cap: number) => {
      el.style.fontSize = '100px'
      const w = el.scrollWidth
      el.style.fontSize = ''
      return Math.min(cap, (100 * width) / Math.max(1, w))
    }
    // tiles answer a mouse only; a finger scrolls
    const interactive = !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const drawn = createGround(canvas, { build, with: withYou, foot }, { interactive })
    const liftSpan = [S.written + 0.2, S.written + 0.2 + S.lift] as const
    let H = 0
    let edge = 100
    let seam = 400
    let phone = false
    /**
     * How far the offers have to fold to stand between the bar and the sheet's edge, in whole steps
     * (never through a line of text): nothing; the lines and facts (--c); the headings too (--c2).
     */
    let foldTo = 1
    let foldHeads = 1
    const measure = () => {
      const W = stage.clientWidth
      H = reduced ? window.innerHeight : stage.clientHeight
      phone = W <= 700
      const wide = W >= 1000 && W / H > 1.15
      const inner = W - W * 0.0667 * 2
      edge = Math.min(140, Math.max(70, H * 0.1))
      set('--edge', edge)
      stage.style.setProperty('--lift', '0px')
      // what folds away as the sheet lifts: each its own height, to fold from
      stage.setAttribute('data-measure', '')
      stage.style.setProperty('--c', '0')
      stage.style.setProperty('--c2', '0')
      for (const el of folds) el.style.setProperty('--fh', `${el.offsetHeight}px`)
      stage.removeAttribute('data-measure')
      // both headings in one size: the largest at which each stays on one line in its card
      stage.style.removeProperty('--gh')
      const first = heads[0]
      if (first) {
        const size = parseFloat(getComputedStyle(first).fontSize)
        const k = Math.min(
          1,
          ...heads.map((el) => (el.clientWidth - 30) / Math.max(1, el.scrollWidth))
        )
        if (k < 1) set('--gh', Math.floor(size * k * 10) / 10)
      }
      // the seam is measured with the offers folded and both groups in place
      const bar = phone ? 64 : 84
      stage.style.setProperty('--c', '1')
      stage.style.setProperty('--c2', '1')
      stage.setAttribute('data-lifting', '')
      // his own offer keeps most of the screen in the final state; stronypodhale.pl is an add-on
      // under it: a band that takes what is left, never more than about a third
      const least = Math.max(H * 0.3, bar + (H - list.offsetTop) + 8)
      const pad = parseFloat(getComputedStyle(end).paddingBottom) + (wide ? 40 : 26)
      const target = Math.max(least, H * (phone ? 0.64 : 0.68))
      set('--seam', target)
      let wm = big ? fit(big, inner * (wide ? 0.46 : 1), H * (wide ? 0.12 : 0.085)) : 100
      for (let i = 0; i < 14; i++) {
        set('--wm', wm)
        if (reduced || two.offsetHeight + pad <= H - target) break
        wm *= 0.93
      }
      seam = reduced ? target : Math.max(least, Math.min(H * 0.74, H - two.offsetHeight - pad))
      set('--seam', seam)
      // the offers fold only as far as they must: not at all where both cards fit whole, else to
      // headings, names and prices, else to names and prices (still laid out as in the lift: on a
      // phone one group above the other)
      const room = seam - (parseFloat(getComputedStyle(list).bottom) || 0) - bar - 12
      stage.style.setProperty('--c2', '0')
      const withHeads = list.offsetHeight
      stage.style.setProperty('--c', '0')
      const whole = list.offsetHeight
      foldTo = whole <= room ? 0 : 1
      foldHeads = whole <= room || withHeads <= room ? 0 : 1
      // where the two cards stand once folded, for the structures that are built around them then
      let folded: { build: Box; with: Box } | undefined
      if (foldTo && !phone && !reduced) {
        stage.style.setProperty('--c', '1')
        stage.style.setProperty('--c2', String(foldHeads))
        const c = canvas.getBoundingClientRect()
        const box = (el: HTMLElement): Box => {
          const r = el.getBoundingClientRect()
          const l = r.left - c.left
          const t = r.top - c.top
          return { l, t, r: l + r.width, b: t + r.height, w: r.width, h: r.height }
        }
        folded = { build: box(build), with: box(withYou) }
        stage.style.setProperty('--c', '0')
        stage.style.setProperty('--c2', '0')
      }
      stage.removeAttribute('data-lifting')
      // the drawn ground is laid out with every group standing where it is read
      if (reduced) set('--rv', view.offsetHeight)
      drawn?.layout(folded)
    }
    if (reduced) {
      steps.forEach((el) => on(el, true))
      blocks.forEach((el) => on(el, true))
      top.removeAttribute('inert')
      end.removeAttribute('inert')
      const still = () => {
        measure()
        // the final state: both structures standing, both cards in place
        drawn?.draw({ land: 1, grow: 1, mine: 1, slot: 1, sweep: 0, fold: 0, leave: 0, refit: 0 })
      }
      still()
      void document.fonts.ready.then(still)
      window.addEventListener('resize', still)
      return () => {
        window.removeEventListener('resize', still)
        drawn?.destroy()
      }
    }

    let frame = 0
    let near = true
    let alive = true
    /** the cards are still moving into place on their own (a CSS transition): keep drawing till then */
    let settle = 0
    const request = () => {
      if (alive && !frame && near) frame = requestAnimationFrame(draw)
    }
    function draw() {
      frame = 0
      const rect = root!.getBoundingClientRect()
      const s = -rect.top / Math.max(1, window.innerHeight)
      // paper over screen 3
      const a = glide(span(s, S.cover))
      const y = H + edge - (H + edge * 2) * a
      paper!.style.setProperty('--y', `${y.toFixed(1)}px`)
      paper!.toggleAttribute('data-full', a >= 1)
      stage!.toggleAttribute('data-over', a > 0.5)
      stage!.toggleAttribute('data-covered', a >= 1)
      // what is written on it, one step after another; on a phone the groups take turns
      steps.forEach((el, i) => on(el, s > (S.steps[i] ?? S.written)))
      const shown = s > S.swap ? '2' : '1'
      if (groups!.dataset.g !== shown) settle = performance.now() + 700
      groups!.dataset.g = shown
      // the sheet lifts off what lies under it; the offers fold only as far as they must
      const l = glide(span(s, liftSpan))
      set('--lift', -(H - seam) * l)
      const g = glide(span(l, [0, 0.6]))
      stage!.style.setProperty('--c', (g * foldTo).toFixed(3))
      stage!.style.setProperty('--c2', (g * foldHeads).toFixed(3))
      const lifting = l > 0 && foldTo > 0
      if (stage!.hasAttribute('data-lifting') !== lifting) settle = performance.now() + 700
      stage!.toggleAttribute('data-lifting', lifting)
      // what is not there yet takes no focus and no pointer
      top!.toggleAttribute('inert', s < 0.4)
      end!.toggleAttribute('inert', l < 0.6)
      foot!.toggleAttribute('inert', !foot!.hasAttribute('data-on'))
      const e = [0.3, 0.42, 0.72, 0.92]
      blocks.forEach((el, i) => on(el, l >= (e[i] ?? 1)))
      // the ground under it; a tile the pointer moved keeps asking for frames until it has settled
      if (drawn?.draw(ground(s, phone, l, foldTo)) || performance.now() < settle) request()
    }
    const onResize = () => {
      measure()
      request()
    }
    // nothing is drawn while the close is far from the screen
    const seen = new IntersectionObserver(
      ([entry]) => {
        near = !!entry?.isIntersecting
        if (near) request()
      },
      { rootMargin: '25% 0px' }
    )
    seen.observe(root)
    void document.fonts.ready.then(onResize)
    measure()
    draw()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    if (interactive) window.addEventListener('pointermove', request, { passive: true })
    return () => {
      alive = false
      cancelAnimationFrame(frame)
      seen.disconnect()
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', request)
      drawn?.destroy()
    }
  }, [reduced])

  const offers = t.raw('offer.offers') as Offer[]
  const facts = t.raw('offer.more') as Facts[]
  const subs = t.raw('offer.subs') as string[]
  const studio = t.raw('estimate.studioPrices') as [string, string][]
  const heads = [t.raw('offer.build') as [string, string], t.raw('offer.with') as [string, string]]

  /** the order things write in: heading, offer, offer, (shared line), heading, offer, offer, foot */
  const stepOf = (group: number, item: number) => (group === 0 ? item : 4 + item)

  return (
    <section ref={rootRef} id="prices" className="cl" aria-label={t('offer.label')}>
      <div ref={stageRef} className="cl-stage">
        {/* under the sheet: stronypodhale.pl on its own ground */}
        <div className="cl-end" inert>
          <article className="cl-two" aria-label="stronypodhale.pl">
            <p className="cl-label cl-head2" data-block>
              {t('estimate.head2')}
            </p>
            <div className="cl-big-row" data-block>
              <a
                className="cl-big"
                href={STRONY}
                target="_blank"
                rel="noopener"
                aria-hidden="true"
                tabIndex={-1}
              >
                <span className="cl-m">
                  <span className="cl-w">
                    <Mark />
                  </span>
                </span>
              </a>
            </div>
            <div className="cl-two-row">
              <p className="cl-fixed" data-block>
                <Words text={(t.raw('fixed') as string).replace(/<\/?mark>/g, '')} />
              </p>
              <div className="cl-two-side" data-block>
                <ul className="cl-studio">
                  {studio.map(([price, per]) => (
                    <li key={price}>
                      <span className="cl-pp">{nb(price)}</span>
                      <span className="cl-pu">{per}</span>
                    </li>
                  ))}
                </ul>
                <a className="cl-see" href={STRONY} target="_blank" rel="noopener">
                  {t('estimate.studioGo')}&nbsp;↗
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* the sheet: paper with its drawn ground, rising over screen 3; at the end it lifts */}
        <div className="cl-sheet">
          <div className="cl-paper" aria-hidden="true">
            <canvas ref={canvasRef} className="cl-ground" />
          </div>
        </div>
        {/* what is written on the sheet moves with it and fades under the site's bar */}
        <div className="cl-view">
          <div className="cl-top" inert>
            <div className="cl-list">
              <div className="cl-groups" data-g="1">
                {heads.map(([lead, tail], g) => (
                  <section
                    key={lead}
                    className="cl-group"
                    data-kind={g === 0 ? 'build' : 'with'}
                    aria-labelledby={`cl-gh-${g}`}
                    data-step={stepOf(g, 0)}
                  >
                    <h2 id={`cl-gh-${g}`} className="cl-gh" data-fold>
                      <Words text={lead} />{' '}
                      <em>
                        <Words text={tail} from={3} />
                      </em>
                    </h2>
                    <p className="cl-sub" data-fold>
                      {subs[g]}
                    </p>
                    <ul className="cl-offers">
                      {offers.slice(g * 2, g * 2 + 2).map(([name, price, unit, line], k) => (
                        <li key={name} className="cl-offer" data-step={stepOf(g, k + 1)}>
                          <div className="cl-pick">
                            <span className="cl-on">{name}</span>
                            <span className="cl-pr">
                              {nb(price)}
                              {unit && <small> {unit}</small>}
                            </span>
                          </div>
                          <div className="cl-more" data-fold>
                            <p className="cl-s">{line}</p>
                            <dl className="cl-d">
                              {(facts[g * 2 + k] ?? []).map(([label, value]) => (
                                <div key={label}>
                                  <dt>{label}</dt>
                                  <dd>{value}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {g === 0 && (
                      <p className="cl-shared" data-fold data-step={3}>
                        {t('offer.shared')}
                      </p>
                    )}
                  </section>
                ))}
              </div>
              <div className="cl-foot" data-step={7}>
                <a className="cl-go" href={`mailto:${MAIL}`}>
                  {t('offer.contact')}&nbsp;→
                </a>
                <p className="cl-note" data-fold>
                  {t('offer.note')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
