import { RefObject } from 'react'

import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap'

interface UseHeroAnimationProps {
  containerRef: RefObject<HTMLElement | null>
  caretRef: RefObject<HTMLSpanElement | null>
  ctaRef: RefObject<HTMLDivElement | null>
  ctaIconRef: RefObject<SVGSVGElement | null>
  prefersReducedMotion: boolean
}

export function useHeroAnimation({
  containerRef,
  caretRef,
  ctaRef,
  ctaIconRef,
  prefersReducedMotion,
}: UseHeroAnimationProps) {
  useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>('.char')
      if (chars.length === 0) return

      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1 })
        gsap.set(caretRef.current, { opacity: 0 })
        gsap.set(ctaRef.current, { y: 0, opacity: 1 })
        return
      }

      // Initial state
      gsap.set(ctaRef.current, { y: 20, opacity: 0 })

      const tl = gsap.timeline({ delay: 0.1 }) // Just run it, it's at the very top of the page!

      // READ phase: Get all bounding rects before applying any mutations
      const parentRect = caretRef.current?.parentElement?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      }
      const charRects = chars.map((char) => char.getBoundingClientRect())

      // WRITE phase: Now we can safely mutate the DOM without triggering a reflow
      gsap.set(chars, { opacity: 0 })
      gsap.set(caretRef.current, { opacity: 1 })

      chars.forEach((char, i) => {
        const delay = i === 0 ? 0.4 : 0.03 + Math.random() * 0.12
        const charRect = charRects[i]
        const targetX = charRect.right - parentRect.left
        const targetY = charRect.top - parentRect.top

        tl.to(
          char,
          {
            opacity: 1,
            duration: 0.01,
          },
          `+=${delay}`
        )

        tl.set(
          caretRef.current,
          {
            x: targetX,
            y: targetY,
          },
          '<'
        )
      })

      // Reveal CTA after typing
      tl.to(
        ctaRef.current,
        {
          y: 0,
          opacity: 1,
          duration: ANIMATION.duration.medium,
          ease: ANIMATION.ease.out,
        },
        '<0.1'
      )

      // Blinking caret effect loop
      const blinkingCaret = gsap.to(caretRef.current, {
        opacity: 0,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      })

      // Cleanup caret
      tl.add(() => {
        blinkingCaret.kill()
      })
      tl.to(caretRef.current, {
        opacity: 0,
        duration: 0.4,
        delay: ANIMATION.delay.medium,
      })

      // Arrow Bounce
      if (ctaIconRef.current) {
        gsap.to(ctaIconRef.current, {
          y: 6,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        })
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  )
}
