'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Template({ children }: { children: React.ReactNode }) {
  useGSAP(() => {
    // Start from hidden state
    gsap.fromTo(
      '#page-transition-container',
      {
        opacity: 0,
        filter: 'blur(20px)',
        y: 10,
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1.6,
        ease: 'power2.out',
        clearProps: 'filter,y',
        onComplete: () => {
          ScrollTrigger.refresh()
        },
      }
    )
  }, [])

  return (
    <div id="page-transition-container" className="w-full" style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
