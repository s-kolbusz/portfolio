'use client'

import { type ReactNode, useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Rise, riseAt } from '@/components/ui/rise'
import { useReveal } from '@/hooks/use-reveal'
import { useVisit } from '@/hooks/use-visit'

import { HowIWorkRelay } from './how-i-work-relay'
import { HowIWorkStock } from './how-i-work-stock'

import './how-i-work.css'

const PHOTOS = [0, 1, 2].map((i) => `/images/act4/piczura-photo-${i}.webp`)
const SCENES = ['wybiegi', 'verdi', 'miasto', 'jelenie'].map(
  (s) => `/images/act4/piczura-${s}.webp`
)
const STRONY = 'https://stronypodhale.pl'
const PICZURA = 'https://piczura.com'

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
  const { visit } = useVisit()
  const sceneNames = t.raw('case.scenes') as string[]

  return (
    <>
      <HowIWorkRelay />
      <HowIWorkStock />
      <section className="hiw" aria-label={t('title')}>
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
    </>
  )
}
