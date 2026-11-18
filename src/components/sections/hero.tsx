'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { preload } from 'react-dom'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import {
  startLiquidStage,
  supportsLiquid,
  HOLD_FROM,
  TRACK_SCREENS,
  WORK_AT,
} from '@/components/canvas/liquid-hero/liquid-stage'
import { usePrefersReducedMotion } from '@/hooks/use-media'

import '@/components/canvas/liquid-hero/liquid-hero.css'

/** The stronypodhale.pl logo: "strony" and ".pl" in the accent, "podhale" heavier in the text colour. */
const WORDMARK = [
  ['acc', 'strony'],
  ['str', 'podhale'],
  ['acc', '.pl'],
] as const

/**
 * Pins on the screenshot: where (fractions of its width and height) and which way the note opens.
 * mu/mv: the same facts on the phone screenshot (stronypodhale.pl as seen on a phone), used on phones.
 */
const PINS = [
  { key: 'rosette', u: 0.13, v: 0.05, mu: 0.1, mv: 0.057, d: 'b' },
  { key: 'price', u: 0.372, v: 0.05, mu: 0.88, mv: 0.057, d: 'r' },
  { key: 'upfront', u: 0.39, v: 0.43, mu: 0.95, mv: 0.36, d: 'r' },
  { key: 'piczura', u: 0.66, v: 0.4, mu: 0.49, mv: 0.78, d: 'r' },
  { key: 'free', u: 0.215, v: 0.745, mu: 0.93, mv: 0.505, d: 'b' },
] as const

const SITE_URL = 'https://stronypodhale.pl'
const SCREENSHOT = '/images/projects/stronypodhale.avif'
const SCREENSHOT_PHONE = '/images/projects/stronypodhale-mobile.avif'

const FONT_FILES = [
  '/fonts/mattone/Mattone-Black.woff2',
  '/fonts/mattone/Mattone-Bold.woff2',
  '/fonts/mattone/Mattone-Regular.woff2',
  '/fonts/cabinet/cabinet-grotesk-variable.woff2',
]

const noop = () => () => {}
let liquidSupport: boolean | null = null
const canRunLiquid = () => (liquidSupport ??= supportsLiquid())

/**
 * The home hero and the first scene after it, as accepted on the test page
 * (cook/ciecz-czastki): a loader, the liquid hero, a scroll transition where
 * the liquid spreads into a dark water sheet and the stronypodhale.pl
 * screenshot surfaces, and a timed act (wordmark, copy, link, pinned notes).
 *
 * Until the client knows what it can run, both versions are in the page and
 * CSS picks one (reduced motion: static). With reduced motion, without
 * WebGL2 or if setup fails, the static version is a plain readable section.
 */
export function Hero() {
  const t = useTranslations('liquidHero')
  const tHero = useTranslations('hero')
  const tScene = useTranslations('signature')
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  const reducedMotion = usePrefersReducedMotion()
  const webgl = useSyncExternalStore(noop, canRunLiquid, () => true)
  const [failed, setFailed] = useState(false)
  const [generation, setGeneration] = useState(0)
  const mode = !hydrated ? 'pending' : reducedMotion || !webgl || failed ? 'static' : 'live'

  for (const href of FONT_FILES) preload(href, { as: 'font', type: 'font/woff2', crossOrigin: '' })

  const name = tHero('name')
  const space = name.indexOf(' ')
  const first = space > 0 ? name.slice(0, space) : name
  const last = space > 0 ? name.slice(space + 1) : ''
  const role = t('role')
  const lines = [t('lines.shelf'), t('lines.apart'), t('lines.together')] as const
  const cta = t('cta')
  const sceneLines = [tScene('lines.first'), tScene('lines.second')] as const
  const link = tScene('link')
  const pins = PINS.map((pin) => ({
    ...pin,
    title: tScene(`pins.${pin.key}.title`),
    note: tScene(`pins.${pin.key}.note`),
  }))

  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loaderRef = useRef<HTMLCanvasElement>(null)
  const selRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLButtonElement>(null)

  // Only the scene being read holds WebGL: once the page is 1.5 screens past the hero, its stage is
  // stopped (context, textures and physics thread freed) and a fresh canvas waits; it is built again
  // a screen before the hero comes back (owner, iPhone 11 Pro, 2026-11-18). The rebuilt stage starts
  // where the page is, with no loader show (liquid-stage skip / shift).
  const [far, setFar] = useState(false)
  useEffect(() => {
    if (mode !== 'live') return
    let was = false
    let frame = 0
    const check = () => {
      frame = 0
      const track = trackRef.current
      if (!track) return
      const bottom = track.getBoundingClientRect().bottom
      const next = was ? bottom < -window.innerHeight : bottom < -1.5 * window.innerHeight
      if (next === was) return
      was = next
      setFar(next)
      // a stopped stage has lost its WebGL context for good: the next one gets a new canvas
      if (next) setGeneration((g) => g + 1)
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [mode])

  const [line0, line1, line2] = lines
  useEffect(() => {
    if (mode !== 'live' || far) return
    const track = trackRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    const loaderCanvas = loaderRef.current
    const sel = selRef.current
    const scene = sceneRef.current
    const pinsEl = pinsRef.current
    const tilt = tiltRef.current
    if (!track || !stage || !canvas || !loaderCanvas || !sel || !scene || !pinsEl || !tilt) return
    // a page opened far below the hero does not build it at all (the check above flips `far` next)
    if (track.getBoundingClientRect().bottom < -1.5 * window.innerHeight) return
    return startLiquidStage(
      { track, stage, canvas, loaderCanvas, sel, scene, pins: pinsEl, tilt },
      {
        copy: { first, last, role, lines: [line0, line1, line2], cta },
        onFail: () => setFailed(true),
        onRemount: () => setGeneration((g) => g + 1),
      }
    )
  }, [mode, far, generation, first, last, role, line0, line1, line2, cta])

  const wordmark = (letters: boolean) =>
    WORDMARK.map(([cls, text]) => (
      <span key={text} className={cls}>
        {letters
          ? Array.from(text).map((char, index) => (
              <span key={index} className="m">
                <span className="i ch">{char}</span>
              </span>
            ))
          : text}
      </span>
    ))

  return (
    <section id="hero" className="lq w-full" data-mode={mode}>
      <noscript>
        <style>{`.lq-track { display: none !important; } .lq-static { display: block !important; }`}</style>
      </noscript>

      {mode !== 'static' && (
        <div
          key={generation}
          ref={trackRef}
          className="lq-track"
          style={{ height: `${TRACK_SCREENS * 100}lvh` }}
        >
          {/* "See the work" lands where the act has started */}
          <div
            id={mode === 'live' ? 'work' : undefined}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 h-px w-px"
            style={{ top: `${(WORK_AT / TRACK_SCREENS) * 100}%` }}
          />
          {/* the finished scene holds: wheel scroll is braked from the act's start until the stage unpins */}
          <div
            aria-hidden="true"
            data-scroll-heavy="0.45"
            data-scroll-range="box"
            className="pointer-events-none absolute left-0 w-px"
            style={{
              top: `${(HOLD_FROM / TRACK_SCREENS) * 100}%`,
              height: `${((TRACK_SCREENS - 1 - HOLD_FROM) / TRACK_SCREENS) * 100}%`,
            }}
          />
          <div ref={stageRef} className="lq-stage">
            <canvas ref={canvasRef} aria-hidden="true" />
            <canvas ref={loaderRef} className="ld" aria-hidden="true" />
            <div ref={selRef} className="sel" aria-hidden="true" />
            <div className="sr-only">
              <h1>{name}</h1>
              <p>{role}</p>
              <p>{lines.join(' ')}</p>
              <a href="#work">{cta}</a>
            </div>
            <div ref={sceneRef} className="scene">
              <h2 className="wm" aria-label="stronypodhale.pl">
                {wordmark(true)}
              </h2>
              <div className="row">
                <p className="say">
                  <span className="m">
                    <span className="i">{sceneLines[0]}</span>
                  </span>
                  <br />
                  <span className="m">
                    <span className="i">{sceneLines[1]}</span>
                  </span>
                </p>
                <a href={SITE_URL} target="_blank" rel="noopener">
                  <span className="m">
                    <span className="i">
                      {link} <b aria-hidden="true">↗</b>
                    </span>
                  </span>
                </a>
              </div>
            </div>
            <div ref={pinsRef} className="pins">
              {pins.map((pin, index) => (
                <div
                  key={pin.key}
                  className="pin"
                  data-d={pin.d}
                  data-u={pin.u}
                  data-v={pin.v}
                  data-mu={pin.mu}
                  data-mv={pin.mv}
                >
                  <button
                    type="button"
                    aria-expanded="false"
                    aria-label={`${pin.title}: ${pin.note}`}
                  >
                    {index + 1}
                  </button>
                  <span className="ln" />
                  <p>
                    <strong>{pin.title}</strong>
                    <span>{pin.note}</span>
                  </p>
                </div>
              ))}
            </div>
            <button ref={tiltRef} type="button" className="tilt" aria-pressed="false">
              <i />
              {t('tilt')}
            </button>
          </div>
        </div>
      )}

      {mode !== 'live' && (
        <div className="lq-static">
          <div className="flex min-h-svh flex-col justify-between gap-16 bg-[#fbf9f4] px-[6.67vw] pt-[6vh] pb-[7vh] text-[#2b2620]">
            <h1 className="lq-name">
              <span className="block">{first}</span> <span className="block">{last}</span>
            </h1>
            <div className="flex max-w-[34rem] flex-col gap-4">
              <p className="lq-role opacity-70">{role}</p>
              <p className="lq-lines">
                {lines[0]}
                <br />
                {lines[1]}
                <br />
                {lines[2]}
              </p>
              <a
                href="#work"
                className="mt-4 font-mono text-xs tracking-[0.3em] uppercase underline-offset-4 hover:underline"
              >
                {cta} ↓
              </a>
            </div>
          </div>
          <div
            id={mode === 'static' ? 'work' : undefined}
            className="bg-[#15301f] px-[6.67vw] py-24 text-[#f3efe6]"
          >
            <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
              <h2 className="lq-wm" aria-label="stronypodhale.pl">
                {wordmark(false)}
              </h2>
              {/* on phones the site as seen on a phone, as in the live scene */}
              <div className="relative mx-auto aspect-[390/844] w-[min(100%,20rem)] overflow-hidden rounded-2xl sm:hidden">
                <Image
                  src={SCREENSHOT_PHONE}
                  alt={tScene('alt')}
                  fill
                  sizes="20rem"
                  className="object-cover"
                />
              </div>
              <div className="relative hidden aspect-video w-full overflow-hidden rounded-2xl sm:block">
                <Image
                  src={SCREENSHOT}
                  alt={tScene('alt')}
                  fill
                  sizes="(min-width: 1400px) 1240px, 88vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <p className="lq-say">
                  {sceneLines[0]}
                  <br />
                  {sceneLines[1]}
                </p>
                <a
                  href={SITE_URL}
                  target="_blank"
                  rel="noopener"
                  className="lq-say lq-accent font-bold whitespace-nowrap"
                >
                  {link} <span aria-hidden="true">↗</span>
                </a>
              </div>
              {/* the notes are what kolbusz.xyz adds: paper and ink, as on the live scene's pins */}
              <ol className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                {pins.map((pin, index) => (
                  <li
                    key={pin.key}
                    className="flex gap-4 rounded-[2px] bg-[#fbf9f4] px-[18px] py-4 text-[#2b2620]"
                  >
                    <span className="lq-fact opacity-50">{index + 1}</span>
                    <div>
                      <p className="lq-fact mb-2.5">{pin.title}</p>
                      <p className="lq-note max-w-[24ch] opacity-80">{pin.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
