'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation-v2'
import { useScrollStore } from '@/lib/stores'

export interface DoorTarget {
  href: string
  title: string
  /** the quiet end of the title, in the lighter ink (" z agentami") */
  tail?: string
  line: string
  /** a page not built yet shows its door, but the door does not open */
  built: boolean
}

/** how far past the end the band stretches before it gives way, in screen heights */
const RUN = 0.6
/** a pull released past this share goes through; anything less springs back */
const GIVE = 0.82

/**
 * The door at the end of every subpage (owner's idea, 2026-11-26): scrolling past the contact stretches a
 * band that shows the next page's title. Let go early and the band springs back; pull it all the way and
 * you are on the next page. The band is a runway under a sticky door: the space between its top edge and
 * the door's content is the stretch. The title is also a plain link (keyboard, reduced motion).
 */
export function Door({ next, peek }: { next: DoorTarget; peek: ReactNode }) {
  const t = useTranslations('subpage')
  const router = useRouter()
  const lenis = useScrollStore((state) => state.lenis)
  const runRef = useRef<HTMLElement>(null)
  const [pull, setPull] = useState(0)
  const left = useRef(false)

  useEffect(() => {
    const run = runRef.current
    if (!run) return
    // with reduced motion the door is a plain section (subpage.css): no stretch, no spring
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let idle = 0
    const bounds = () => {
      const vh = window.innerHeight
      const door = run.querySelector<HTMLElement>('.sp-door')?.offsetHeight ?? vh * 0.6
      const top = run.getBoundingClientRect().top + window.scrollY
      const start = top + door - vh
      return { start, length: RUN * vh }
    }
    const to = (y: number, duration: number) => {
      if (lenis) lenis.scrollTo(y, { duration, force: true })
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }
    const settle = () => {
      const { start, length } = bounds()
      const p = (window.scrollY - start) / length
      if (p <= 0.01 || left.current) return
      if (next.built && p >= GIVE) {
        left.current = true
        to(start + length, 0.4)
        window.setTimeout(() => router.push(next.href), 380)
        return
      }
      if (p < 1.01) to(start, 0.9) // the band springs back to the door at rest
    }
    const measure = () => {
      raf = 0
      const { start, length } = bounds()
      const p = Math.min(Math.max((window.scrollY - start) / length, 0), 1)
      setPull((prev) => (Math.abs(prev - p) < 0.004 ? prev : p))
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, 220)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    measure()
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(idle)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [lenis, next.built, next.href, router])

  const title = (
    <>
      {next.title}
      {next.tail && <span className="sp-door__tail">{next.tail}</span>}
    </>
  )

  return (
    <section
      ref={runRef}
      className="sp-door-run"
      style={{ '--pull': pull.toFixed(4), '--run': RUN } as CSSProperties}
    >
      <div className="sp-door" data-pulled={pull > 0.5 || undefined}>
        <p className="sp-label">{t('next')}</p>
        {next.built ? (
          <Link href={next.href} className="sp-door__next">
            {title}
          </Link>
        ) : (
          <p className="sp-door__next">{title}</p>
        )}
        <p className="sp-door__line">{next.line}</p>
        <div className="sp-door__peek" aria-hidden="true">
          {peek}
        </div>
        <p className="sp-door__pull" aria-hidden="true">
          <span>{next.built || pull < 0.5 ? t('pull') : t('soon')}</span>
          <b />
        </p>
      </div>
    </section>
  )
}
