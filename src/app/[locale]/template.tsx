'use client'

import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(() => {
    gsap.from('#page-transition-container', {
      opacity: 0,
      filter: prefersReducedMotion ? 'none' : 'blur(20px)',
      y: prefersReducedMotion ? 0 : 10,
      duration: prefersReducedMotion ? ANIMATION.duration.fast : ANIMATION.duration.slow,
      ease: ANIMATION.ease.out,
      onComplete: () => {
        ScrollTrigger.refresh()
      },
    })
  }, [prefersReducedMotion])

  return (
    <div id="page-transition-container" className="w-full">
      {children}
    </div>
  )
}
