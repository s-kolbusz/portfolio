'use client'

import { useEffect } from 'react'

import Lenis from 'lenis'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useScrollStore } from '@/lib/stores'

import '../../app/deferred.css'

/**
 * Where the scroll is heavier (see below). The attribute's value is the
 * scroll factor (default 0.6). On a pinned track it applies while the track
 * is pinned; with `data-scroll-range="box"` while the scroll position is
 * within the element's own box (a hold marker inside a track).
 */
const HEAVY_SCROLL_SELECTOR = '[data-scroll-heavy]'
const HEAVY_SCROLL_FACTOR = 0.6

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
      // Touch stays native: on phones the page must follow the finger 1:1
      // with the system's own momentum (running touch through Lenis, and
      // braking it, made swipes feel detached). The brake below is wheel-only.
      touchMultiplier: 2,
      // Same-page #hash links go through Lenis. Without this the Next router
      // swallows the click and refuses to re-scroll when the URL already
      // carries that hash, so every repeat click is a no-op.
      anchors: true,
    })

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Scroll is heavier inside the pinned, scroll-driven scenes, and braked
    // hard where a finished scene holds, so a fling does not carry past the
    // part worth watching.
    let factor = 1
    lenis.on('scroll', () => {
      const y = window.scrollY
      let next = 1
      for (const element of document.querySelectorAll<HTMLElement>(HEAVY_SCROLL_SELECTOR)) {
        const top = element.getBoundingClientRect().top + y
        const end =
          element.dataset.scrollRange === 'box'
            ? top + element.offsetHeight
            : top + element.offsetHeight - window.innerHeight
        if (y >= top - 1 && y < end) {
          next = Math.min(next, Number(element.dataset.scrollHeavy) || HEAVY_SCROLL_FACTOR)
        }
      }
      if (next === factor) return
      factor = next
      lenis.options.wheelMultiplier = next
    })

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
