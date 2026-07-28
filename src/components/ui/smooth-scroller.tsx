'use client'

import { useEffect } from 'react'

import Lenis from 'lenis'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useScrollStore } from '@/lib/stores'

import '../../app/deferred.css'

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
      // Same-page #hash links go through Lenis. Without this the Next router
      // swallows the click and refuses to re-scroll when the URL already
      // carries that hash, so every repeat click is a no-op.
      anchors: true,
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

  // Without Lenis there is nothing to honour `anchors: true`, so the same
  // repeat-click no-op comes back. Jump instantly — smooth is off by request.
  useEffect(() => {
    if (!prefersReducedMotion) return

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href*="#"]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const url = new URL(anchor.href)
      if (url.host !== location.host || url.pathname !== location.pathname || !url.hash) return

      document.getElementById(url.hash.slice(1))?.scrollIntoView()
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [prefersReducedMotion])

  return null
}
