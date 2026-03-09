'use client'

import { useEffect } from 'react'

import Lenis from 'lenis'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useScrollStore } from '@/lib/stores'

export function SmoothScroller() {
  const setLenis = useScrollStore((state) => state.setLenis)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Add Lenis's requestAnimationFrame call to GSAP's ticker
    // This ensures they stay perfectly in sync
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)

    setLenis(lenis)

    // Disable lag smoothing in GSAP to prevent jumps during heavy scrolls
    gsap.ticker.lagSmoothing(0)

    return () => {
      setLenis(null)
      lenis.destroy()
      gsap.ticker.remove(tickerCallback)
    }
  }, [setLenis, prefersReducedMotion])

  return null
}
