'use client'

import { useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap-core'

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (!containerRef.current) return

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
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  )

  return (
    <div ref={containerRef} id="page-transition-container" style={{ opacity: 0.01 }}>
      {children}
    </div>
  )
}
