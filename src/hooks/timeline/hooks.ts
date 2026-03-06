'use client'

import type { RefObject } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useSafeAnimation } from '@/hooks/use-safe-animation'
import { useGSAP } from '@/lib/gsap'

import { createReveal, REVEAL } from './reveal-engine'
import { useTimelineStore } from './store'
import type { RevealFn, RevealOptions, TimelineConfig, TimelineSetup } from './types'

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

  useGSAP(
    () => {
      if (!ref.current) return

      if (id) {
        useTimelineStore.getState().register(id)
      }

      const reveal: RevealFn = (target, options = {}) => {
        createReveal(target, options, prefersReducedMotion, anim, start, toggleActions)
      }

      setup(reveal)

      return () => {
        if (id) {
          useTimelineStore.getState().unregister(id)
        }
      }
    },
    {
      scope: ref,
      dependencies: [prefersReducedMotion],
    }
  )
}

export function useStandaloneReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: RevealOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const anim = useSafeAnimation()

  useGSAP(
    () => {
      if (!ref.current) return

      createReveal(
        ref,
        { self: true, ...options },
        prefersReducedMotion,
        anim,
        REVEAL.start,
        REVEAL.toggleActions
      )
    },
    {
      scope: ref,
      dependencies: [prefersReducedMotion],
    }
  )
}
