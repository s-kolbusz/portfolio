'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { usePrefersReducedMotion } from '@/hooks/useMedia'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(() => {
    // Start from hidden state
    gsap.fromTo(
      '#page-transition-container',
      {
        opacity: 0,
        filter: prefersReducedMotion ? 'none' : 'blur(20px)',
        y: prefersReducedMotion ? 0 : 10,
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: prefersReducedMotion ? 0.4 : 1.6,
        ease: 'power2.out',
        clearProps: 'filter,y',
        onComplete: () => {
          ScrollTrigger.refresh()
        },
      }
    )
  }, [prefersReducedMotion])

  return (
    <div id="page-transition-container" className="w-full" style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
