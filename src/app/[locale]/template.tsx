'use client'

import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap-core'

// Module-level flag: false on the initial hard load, true after the first mount.
// Resets on full page reload (module re-evaluates), persists across client navigations.
let clientHasBooted = false

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Captured at render time — false on initial load, true on subsequent navigations.
  const isNavigation = clientHasBooted

  useGSAP(
    () => {
      // On the initial page load, skip the animation entirely so content is
      // visible at full opacity immediately. This decouples LCP from JS
      // execution time — on slow connections Lighthouse was recording LCP
      // when GSAP transitioned opacity from ~0 to 1, not at initial paint.
      // GSAP only runs for client-side navigations (JS already loaded).
      if (!isNavigation || !containerRef.current) return

      const duration = prefersReducedMotion ? ANIMATION.duration.fast : ANIMATION.duration.medium
      const y = prefersReducedMotion ? 0 : 24

      gsap.fromTo(
        containerRef.current,
        { opacity: 0.01, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: ANIMATION.ease.outStrong,
          delay: 0.1,
          onComplete: () => {
            import('@/lib/gsap-scroll').then(({ ScrollTrigger }) => {
              ScrollTrigger.refresh()
            })
          },
        }
      )
    },
    { scope: containerRef, dependencies: [isNavigation, prefersReducedMotion] }
  )

  useEffect(() => {
    // setTimeout so React StrictMode's cleanup on the first (synthetic) unmount
    // cancels the timer before it fires. Only the real final mount sets the flag.
    const t = setTimeout(() => {
      clientHasBooted = true
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return (
    // opacity: 0.01 only during client navigation (prevents flash before GSAP runs).
    // On initial load isNavigation is false, so no opacity — content is immediately visible.
    <div
      ref={containerRef}
      id="page-transition-container"
      style={isNavigation ? { opacity: 0.01 } : undefined}
    >
      {children}
    </div>
  )
}
