'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useSafeAnimation } from '@/hooks/use-safe-animation'
import { useGSAP } from '@/lib/gsap'

import { createReveal, REVEAL } from './reveal-engine'
import { useTimelineStore } from './store'
import type { RevealFn, TimelineConfig, TimelineSetup } from './types'

// Global queue to stagger ScrollTrigger initializations across multiple frames
const timelineQueue: Array<() => void> = []
let isProcessingQueue = false

function processTimelineQueue() {
  if (timelineQueue.length === 0) {
    isProcessingQueue = false
    return
  }

  // Process one timeline setup per frame to prevent long tasks
  const init = timelineQueue.shift()
  if (init) init()

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(processTimelineQueue, { timeout: 100 })
  } else {
    requestAnimationFrame(processTimelineQueue)
  }
}

function enqueueTimeline(init: () => void) {
  timelineQueue.push(init)
  if (!isProcessingQueue) {
    isProcessingQueue = true
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(processTimelineQueue, { timeout: 100 })
    } else {
      requestAnimationFrame(processTimelineQueue)
    }
  }
}

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

    let isMounted = true

    const init = contextSafe(() => {
      if (!isMounted) return
      const reveal: RevealFn = (target, options = {}) => {
        createReveal(target, options, prefersReducedMotion, anim, start, toggleActions)
      }
      setup(reveal)
    })

    // Stagger timeline setup across multiple frames/idle callbacks
    // This totally eliminates the massive ~1000ms Layout Thrashing task when 20+ hooks mount simultaneously
    enqueueTimeline(init)

    return () => {
      isMounted = false
      if (id) {
        useTimelineStore.getState().unregister(id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])
}
