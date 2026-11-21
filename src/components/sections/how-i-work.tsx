'use client'

import { type ReactNode, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { riseAt } from '@/components/ui/rise'
import { useReveal } from '@/hooks/use-reveal'
import { useVisit } from '@/hooks/use-visit'

import { HowIWorkCase } from './how-i-work-case'
import { HowIWorkRelay } from './how-i-work-relay'
import { HowIWorkStock } from './how-i-work-stock'

import './how-i-work.css'

const STRONY = 'https://stronypodhale.pl'

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

  return (
    <>
      <HowIWorkRelay />
      <HowIWorkStock />
      <HowIWorkCase />
      <section className="hiw" aria-label={t('title')}>
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
