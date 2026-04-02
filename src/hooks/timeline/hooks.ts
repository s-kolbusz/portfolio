'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useSafeAnimation } from '@/hooks/use-safe-animation'
import { useGSAP } from '@/lib/gsap'

import { createReveal, REVEAL } from './reveal-engine'
import { useTimelineStore } from './store'
import type { RevealFn, TimelineConfig, TimelineSetup } from './types'

export function useTimeline<T extends HTMLElement>(
  ref: RefObject<T | null>,
  config: TimelineConfig,
  setup: TimelineSetup
): void
export function useTimeline<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: TimelineSetup
): void
export function useTimeline<T extends HTMLElement>(
  ref: RefObject<T | null>,
  configOrSetup: TimelineConfig | TimelineSetup,
  maybeSetup?: TimelineSetup
) {
  const config: TimelineConfig = typeof configOrSetup === 'function' ? {} : configOrSetup
  const setup: TimelineSetup = typeof configOrSetup === 'function' ? configOrSetup : maybeSetup!

  const { id, start = REVEAL.start, toggleActions = REVEAL.toggleActions } = config

  const prefersReducedMotion = usePrefersReducedMotion()
  const anim = useSafeAnimation()

  const { contextSafe } = useGSAP({ scope: ref })

  useEffect(() => {
    if (!ref.current) return

    if (id) {
      useTimelineStore.getState().register(id)
    }

    const init = contextSafe(() => {
      const reveal: RevealFn = (target, options = {}) => {
        createReveal(target, options, prefersReducedMotion, anim, start, toggleActions)
      }
      setup(reveal)
    })

    // Defer to the next animation frame to unblock the main thread during hydration
    // This prevents forced synchronous layout thrashing when multiple components mount
    const rafId = requestAnimationFrame(init)

    return () => {
      cancelAnimationFrame(rafId)
      if (id) {
        useTimelineStore.getState().unregister(id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])
}
