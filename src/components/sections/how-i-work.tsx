'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { Rise, riseAt } from '@/components/ui/rise'
import { useReveal } from '@/hooks/use-reveal'

import './how-i-work.css'

const ROLES = ['design', 'code', 'server', 'maintenance', 'liquid', 'motion', 'speed'] as const
type Role = (typeof ROLES)[number]
const OWN = ['liquid', 'cursor', 'menu', 'r2o', 'plugin'] as const
type Own = (typeof OWN)[number]
const ENGINE = ['Next.js', 'React', 'GSAP', 'Lenis', 'next-intl']
/** the home page in miniature, top to bottom, and which ledger item lives where ('cursor': everywhere) */
const MAP: { id: string; src: string; name: string; holds: Own[] }[] = [
  { id: 'hero', src: '/images/act4/home-hero.webp', name: 'Start', holds: ['liquid'] },
  { id: 'sheet', src: '/images/act4/home-sheet.webp', name: 'stronypodhale.pl', holds: [] },
  { id: 'plugin', src: '/images/act4/home-plugin.webp', name: 'aspect-preview', holds: ['plugin'] },
  { id: 'r2o', src: '/images/act4/home-r2o.webp', name: 'ready2order', holds: ['r2o'] },
  { id: 'menu', src: '/images/act4/home-menu.webp', name: 'Menu', holds: ['menu'] },
]
const PHOTOS = [0, 1, 2].map((i) => `/images/act4/piczura-photo-${i}.webp`)
const SCENES = ['wybiegi', 'verdi', 'miasto', 'jelenie'].map(
  (s) => `/images/act4/piczura-${s}.webp`
)
const STRONY = 'https://stronypodhale.pl'
const PICZURA = 'https://piczura.com'
const BUILT = process.env.BUILD_DATE ?? ''

/** what this visit measured: the first byte and the whole page, from the browser's own timing */
function useVisit() {
  const [visit, setVisit] = useState<{ ms: number | null; s: number | null }>({ ms: null, s: null })
  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined
      if (!nav) return
      setVisit({
        ms: Math.max(1, Math.round(nav.responseStart - nav.startTime)),
        s: nav.loadEventEnd > 0 ? Math.round((nav.loadEventEnd - nav.startTime) / 100) / 10 : null,
      })
    }
    read()
    if (document.readyState !== 'complete') {
      const later = () => setTimeout(read, 0)
      window.addEventListener('load', later, { once: true })
      return () => window.removeEventListener('load', later)
    }
  }, [])
  return visit
}

/** one scene of the act: it rises in when its top comes up the screen (use-reveal) */
function Scene({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref, { at: 0.7 })
  return (
    <div ref={ref} className={`hiw-scene ${className ?? ''}`}>
      {children}
    </div>
  )
}

function Mark() {
  return (
    <span className="hiw-mark">
      <span className="acc">strony</span>
      <span className="str">podhale</span>
      <span className="acc">.pl</span>
    </span>
  )
}

/**
 * Act 4, "don't take my word for it" (owner, 2026-11-20): each of the four lines on how I work comes
 * with proof the visitor can check on this very page. Line 1: the page's roles behind one bracket and
 * one name, each opening a proof, some measured live; under it, the usual relay of four people
 * against one unbroken line. Line 2: what was built for this page, each pointing to where it lives
 * on a map of the page. Line 3: a client's photos and the site they became. The end gathers the
 * proofs and opens the door to stronypodhale.pl. No WebGL: it has to run smoothly on an iPhone 11.
 */
export function HowIWork() {
  const t = useTranslations('howIWork')
  const locale = useLocale()
  const visit = useVisit()
  const [open, setOpen] = useState<Role>('server')
  const [lit, setLit] = useState<Own>('liquid')

  const big = (role: Role): string | null => {
    if (role === 'server') return visit.ms === null ? '…' : `${visit.ms}`
    if (role === 'speed') return visit.s === null ? '…' : visit.s.toLocaleString(locale)
    if (role === 'maintenance' && BUILT)
      return new Date(BUILT).toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })
    return null
  }
  const unit = (role: Role) => (role === 'server' ? 'ms' : role === 'speed' ? 's' : '')
  const dateText = BUILT ? new Date(BUILT).toLocaleDateString(locale) : ''
  const proof = (role: Role) =>
    t(`roleProofs.${role}`, {
      ms: visit.ms ?? '…',
      s: visit.s === null ? '…' : visit.s.toLocaleString(locale),
      date: dateText,
    })

  const people = t.raw('relay.people') as string[]
  const sceneNames = t.raw('case.scenes') as string[]

  return (
    <section id="how-i-work" className="hiw" aria-labelledby="hiw-title">
      {/* line 1: one pair of hands */}
      <Scene className="hiw-roles-scene">
        <h2 id="hiw-title" className="hiw-act rv-b">
          {t('title')}
        </h2>
        <p className="hiw-line">
          <Rise text={t('alone')} at={0.1} />
        </p>
        <div className="hiw-credits">
          <ul className="hiw-roles">
            {ROLES.map((role, i) => {
              const on = open === role
              const value = big(role)
              return (
                <li
                  key={role}
                  data-open={on || undefined}
                  className="rv-b"
                  style={riseAt(0.35 + i * 0.06)}
                >
                  <button
                    type="button"
                    className="hiw-role"
                    aria-expanded={on}
                    aria-controls={`hiw-proof-${role}`}
                    onClick={() => setOpen(role)}
                  >
                    {t(`roleNames.${role}`)}
                  </button>
                  <div id={`hiw-proof-${role}`} className="hiw-proof" hidden={!on}>
                    {value !== null && (
                      <p className="hiw-big" aria-hidden="true">
                        {value}
                        {unit(role) && <small>&thinsp;{unit(role)}</small>}
                      </p>
                    )}
                    <p className="hiw-proof-t">{proof(role)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <span className="hiw-brace rv-b" style={riseAt(0.8)} aria-hidden="true" />
          <p className="hiw-who rv-b" style={riseAt(0.9)}>
            Sebastian
            <br />
            Kolbusz
          </p>
          <p className="hiw-hint rv-b" style={riseAt(1)}>
            {t('rolesHint')}
          </p>
        </div>
        <div className="hiw-relay">
          <div className="hiw-relay-row" data-kind="usual">
            <span className="hiw-relay-k rv-b" style={riseAt(0.6)}>
              {t('relay.usual')}
            </span>
            <div className="hiw-relay-track">
              {people.map((who, i) => (
                <span key={who} className="hiw-relay-leg rv-b" style={riseAt(0.7 + i * 0.12)}>
                  <b>{who}</b>
                  {i < people.length - 1 && <i aria-hidden="true">✕</i>}
                </span>
              ))}
            </div>
            <span className="hiw-relay-n rv-b" style={riseAt(1.2)}>
              {t('relay.usualCount')}
            </span>
          </div>
          <div className="hiw-relay-row" data-kind="mine">
            <span className="hiw-relay-k rv-b" style={riseAt(1.3)}>
              {t('relay.mine')}
            </span>
            <div className="hiw-relay-track">
              <span className="hiw-relay-one">
                {(['design', 'code', 'server', 'maintenance'] as const).map((r) => (
                  <b key={r}>{t(`roleNames.${r}`)}</b>
                ))}
                <span className="hiw-relay-bar rv-l" style={riseAt(1.4)} aria-hidden="true" />
              </span>
            </div>
            <span className="hiw-relay-n rv-b" style={riseAt(1.9)}>
              {t('relay.mineCount')}
            </span>
          </div>
        </div>
      </Scene>

      {/* line 2: built for this page, and where to check it */}
      <Scene className="hiw-ledger-scene">
        <p className="hiw-line">
          <Rise text={t('shelf')} />
        </p>
        <div className="hiw-ledger">
          <div>
            <p className="hiw-colh rv-b" style={riseAt(0.3)}>
              {t('ledger.own')}
            </p>
            <ul className="hiw-own">
              {OWN.map((id, i) => {
                const [what, how] = t.raw(`ledger.items.${id}`) as [string, string]
                return (
                  <li key={id} className="rv-b" style={riseAt(0.35 + i * 0.07)}>
                    <button
                      type="button"
                      aria-pressed={lit === id}
                      onPointerEnter={() => setLit(id)}
                      onFocus={() => setLit(id)}
                      onClick={() => setLit(id)}
                    >
                      <span className="hiw-what">{what}</span>
                      <span className="hiw-how">{how}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="hiw-engine rv-b" style={riseAt(0.8)}>
              <span className="hiw-colh">{t('ledger.engine')}</span>
              {ENGINE.join(' · ')}
            </p>
            <p className="hiw-note rv-b" style={riseAt(0.9)}>
              {t('ledger.note')}
            </p>
          </div>
          <div className="hiw-map" aria-hidden="true">
            <p className="hiw-colh rv-b" style={riseAt(0.4)}>
              {t('ledger.map')}
            </p>
            {MAP.map((m, i) => (
              <figure
                key={m.id}
                className="rv-b"
                style={riseAt(0.45 + i * 0.06)}
                data-on={lit === 'cursor' || m.holds.includes(lit) || undefined}
              >
                <Image src={m.src} alt="" width={560} height={350} sizes="168px" />
                <figcaption>{m.name}</figcaption>
              </figure>
            ))}
            <p className="hiw-map-hint">{t('ledger.mapHint')}</p>
          </div>
        </div>
      </Scene>

      {/* line 3: what a client brought, and what he got */}
      <Scene className="hiw-case-scene">
        <p className="hiw-line">
          <Rise text={t('vision')} />
        </p>
        <div className="hiw-case">
          <p className="hiw-case-in rv-b" style={riseAt(0.3)}>
            {t('case.text')}
          </p>
          <div className="hiw-turn">
            <div className="hiw-before">
              <p className="hiw-colh rv-b" style={riseAt(0.45)}>
                {t('case.before')}
              </p>
              <div className="hiw-photos">
                {PHOTOS.map((src, i) => (
                  <Image
                    key={src}
                    className="rv-b"
                    style={riseAt(0.5 + i * 0.08)}
                    src={src}
                    alt=""
                    width={480}
                    height={600}
                    sizes="104px"
                  />
                ))}
              </div>
            </div>
            <span className="hiw-arrow rv-b" style={riseAt(0.8)} aria-hidden="true">
              →
            </span>
            <div className="hiw-after">
              <p className="hiw-colh rv-b" style={riseAt(0.85)}>
                {t('case.after')}
              </p>
              <div className="hiw-shots">
                {SCENES.map((src, i) => (
                  <figure key={src} className="rv-b" style={riseAt(0.9 + i * 0.1)}>
                    <Image
                      src={src}
                      alt={sceneNames[i]}
                      width={1200}
                      height={750}
                      sizes="(max-width: 700px) 45vw, 22vw"
                    />
                    <figcaption>{sceneNames[i]}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
          <a
            className="hiw-case-go rv-b"
            style={riseAt(1.3)}
            href={PICZURA}
            target="_blank"
            rel="noopener"
          >
            {t('case.link')} ↗
          </a>
        </div>
      </Scene>

      {/* the end: the three proofs together, then the door */}
      <Scene className="hiw-end">
        <ol className="hiw-all">
          {(['alone', 'shelf', 'vision'] as const).map((k, i) => (
            <li key={k} className="rv-b" style={riseAt(i * 0.12)}>
              <p>{t(k)}</p>
              <span>{t(`end.${k}`, { ms: visit.ms ?? '…' })}</span>
            </li>
          ))}
        </ol>
        <a
          className="hiw-door rv-b"
          style={riseAt(0.5)}
          href={STRONY}
          target="_blank"
          rel="noopener"
        >
          <span className="hiw-door-q">{t.rich('fixed', { mark: () => <Mark /> })}</span>
          <span className="hiw-door-go">{t('door')} ↗</span>
        </a>
      </Scene>
    </section>
  )
}
