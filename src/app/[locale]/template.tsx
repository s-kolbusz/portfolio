'use client'

import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap-core'

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(() => {
    gsap.to('#page-transition-container', {
      opacity: 1,
      filter: 'none',
      y: 0,
      duration: prefersReducedMotion ? ANIMATION.duration.fast : ANIMATION.duration.slow,
      ease: ANIMATION.ease.out,
      onComplete: () => {
        import('@/lib/gsap').then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh()
        })
      },
    })
  }, [prefersReducedMotion])

  return (
    <div
      id="page-transition-container"
      style={{
        width: '100%',
        opacity: 0,
        filter: 'blur(20px)',
        y: 16,
      }}
    >
      {children}
    </div>
  )
}
