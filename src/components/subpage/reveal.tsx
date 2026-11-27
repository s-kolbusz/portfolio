'use client'

import { type ReactNode, useEffect, useRef } from 'react'

/**
 * Parts of a subpage come in once, when they reach the screen: every element marked `data-rv` gets
 * `data-in` the first time its top passes the lower eighth of the screen. The hidden state applies only once this has run
 * (`data-rv-ready`), so without scripts nothing stays hidden; with reduced motion the CSS leaves
 * everything standing.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    // measured on scroll, not with an IntersectionObserver: a part hidden by its own clip-path (the
    // printer's layers, the readout's rows) has no visible area, so an observer never reports it
    let waiting = Array.from(root.querySelectorAll<HTMLElement>('[data-rv]'))
    let raf = 0
    const check = () => {
      raf = 0
      const line = window.innerHeight * 0.88
      waiting = waiting.filter((el) => {
        const r = el.getBoundingClientRect()
        const seen = r.top < line && r.bottom > 0
        if (seen) el.setAttribute('data-in', '')
        return !seen
      })
      if (!waiting.length) stop()
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    const stop = () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
    root.setAttribute('data-rv-ready', '')
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(raf)
      stop()
    }
  }, [])

  return (
    <div ref={ref} className="sp-reveal">
      {children}
    </div>
  )
}
