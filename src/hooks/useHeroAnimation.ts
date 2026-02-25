import { RefObject } from 'react'

import { useReveal } from '@/hooks/useRevealAnimation'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap'

interface UseHeroAnimationProps {
  containerRef: RefObject<HTMLElement | null>
  caretRef: RefObject<HTMLSpanElement | null>
  roleRef: RefObject<HTMLDivElement | null>
  ctaRef: RefObject<HTMLDivElement | null>
  ctaIconRef: RefObject<SVGSVGElement | null>
  prefersReducedMotion: boolean
}

export function useHeroAnimation({
  containerRef,
  caretRef,
  roleRef,
  ctaRef,
  ctaIconRef,
  prefersReducedMotion,
}: UseHeroAnimationProps) {
  const reveal = useReveal()

  useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>('.char')
      if (chars.length === 0) return

      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1 })
        gsap.set(caretRef.current, { opacity: 0 })
        reveal(roleRef)
        reveal(ctaRef, { y: 20 })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      })

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

      // Reveal role and CTA after typing
      reveal(roleRef, { timeline: tl, delay: 0.3 })
      reveal(ctaRef, { timeline: tl, delay: 0.2, y: 20, position: '<0.1' })

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
