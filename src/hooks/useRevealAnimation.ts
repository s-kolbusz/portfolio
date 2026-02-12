'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { useSafeAnimation } from '@/lib/constants/animations'

interface RevealOptions {
  trigger?: string | HTMLElement | React.RefObject<HTMLElement | null>
  selector?: string
  scope?: string | HTMLElement | React.RefObject<HTMLElement | null>
  start?: string
  delay?: number
  stagger?: number
  y?: number
  x?: number
  duration?: number
  ease?: string
  once?: boolean
}

export function useRevealAnimation<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: RevealOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const anim = useSafeAnimation()

  useGSAP(
    () => {
      if (!ref.current) return

      const {
        trigger = ref.current,
        selector,
        start = anim.scrollTrigger.start,
        delay = 0,
        stagger = anim.stagger.normal,
        y = 30,
        x = 0,
        duration = anim.duration.medium,
        ease = anim.ease.out,
        once = false,
      } = options

      // Handle elements or their children or specific selector
      let targets: HTMLCollection | T[] | T = ref.current
      if (selector) {
        targets = gsap.utils.toArray<T>(selector, ref.current)
      } else if (ref.current.children.length > 0) {
        targets = ref.current.children
      }

      if (Array.isArray(targets)) {
        targets.forEach((target, i) => {
          gsap.fromTo(
            target,
            {
              y: prefersReducedMotion ? 0 : y,
              x: prefersReducedMotion ? 0 : x,
              opacity: 0,
            },
            {
              y: 0,
              x: 0,
              opacity: 1,
              duration,
              delay: delay + i * stagger,
              ease,
              scrollTrigger: {
                trigger: target,
                start,
                toggleActions: once ? 'play none none none' : anim.scrollTrigger.toggleActions,
              },
            }
          )
        })
      } else {
        gsap.fromTo(
          targets,
          {
            y: prefersReducedMotion ? 0 : y,
            x: prefersReducedMotion ? 0 : x,
            opacity: 0,
          },
          {
            y: 0,
            x: 0,
            opacity: 1,
            duration,
            stagger,
            delay,
            ease,
            scrollTrigger: {
              trigger: (trigger as React.RefObject<T>)?.current || trigger,
              start,
              toggleActions: once ? 'play none none none' : anim.scrollTrigger.toggleActions,
            },
          }
        )
      }
    },
    { scope: options.scope || ref, dependencies: [prefersReducedMotion] }
  )
}
