'use client'

import { useGSAP } from '@gsap/react'

import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { useSafeAnimation } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

/**
 * Valid targets for reveal animations.
 */
export type RevealTarget =
  | string
  | HTMLElement
  | (HTMLElement | null)[]
  | React.RefObject<HTMLElement | null>

/**
 * Valid scope for GSAP animations.
 */
export type RevealScope = string | HTMLElement | React.RefObject<HTMLElement | null>

/**
 * Options for a single reveal animation.
 */
export interface RevealOptions {
  /** The element that triggers the scroll animation. Defaults to the target element. */
  trigger?: RevealTarget
  /** A selector string to find child elements to animate within the target. */
  selector?: string
  /** The GSAP scope for the animation. */
  scope?: RevealScope
  /** ScrollTrigger start position (e.g., 'top 80%'). */
  start?: string
  /** Delay before the animation starts. */
  delay?: number
  /** Stagger time between multiple targets. */
  stagger?: number
  /** Initial Y-axis offset. */
  y?: number
  /** Initial X-axis offset. */
  x?: number
  /** Animation duration in seconds. */
  duration?: number
  /** GSAP easing function. */
  ease?: string
  /** Whether the animation should only play once. */
  once?: boolean
  /** An existing GSAP timeline to add this animation to. */
  timeline?: gsap.core.Timeline | null
  /** Position in the timeline (if provided). */
  position?: string | number
  /** Optional clipPath reveal effect. */
  clipPath?: string | { from: string; to: string }
}

/**
 * Represents a single animation step within a timeline group.
 */
export interface RevealAnimationItem {
  /** The target element(s) or ref to animate. */
  target: RevealTarget
  /** Animation options for this specific item. */
  options?: Omit<RevealOptions, 'timeline' | 'trigger' | 'start' | 'once'> & {
    /** Position in the timeline group. */
    position?: string | number
  }
}

/**
 * Configuration for a group of animations sharing a single timeline and ScrollTrigger.
 */
export interface RevealTimelineGroup {
  /** The element that triggers the timeline. Defaults to the hook's primary ref. */
  trigger?: RevealTarget
  /** ScrollTrigger start position for the whole timeline. */
  start?: string
  /** Whether the timeline should play once. */
  once?: boolean
  /** Custom ScrollTrigger toggleActions. */
  toggleActions?: string
  /** Array of animation items to include in this timeline. */
  animations: RevealAnimationItem[]
}

/**
 * Type guard to check if a value is a React RefObject.
 */
function isRefObject(val: unknown): val is React.RefObject<HTMLElement | null> {
  return typeof val === 'object' && val !== null && 'current' in val
}

/**
 * Resolves a RevealTarget into a GSAP-compatible target.
 */
function resolveTarget(target: RevealTarget): gsap.TweenTarget {
  if (isRefObject(target)) {
    return target.current
  }
  return target as gsap.TweenTarget
}

/**
 * Core reveal animation logic. Animates elements from a hidden state (opacity 0, offset)
 * to their natural visible state.
 *
 * @param target - The element(s) to animate.
 * @param options - Configuration options including motion preferences and animation constants.
 */
export function reveal<T extends HTMLElement>(
  target: RevealTarget,
  options: RevealOptions & {
    prefersReducedMotion: boolean
    anim: ReturnType<typeof useSafeAnimation>
  }
) {
  const {
    trigger,
    selector,
    start = options.anim.scrollTrigger.start,
    delay = 0,
    stagger = options.anim.stagger.normal,
    y = 30,
    x = 0,
    duration = options.anim.duration.medium,
    ease = options.anim.ease.out,
    once = false,
    timeline,
    position,
    clipPath,
    prefersReducedMotion,
    anim,
  } = options

  // Resolve targets
  const resolvedTarget = resolveTarget(target)

  if (!resolvedTarget) return

  let targets: gsap.TweenTarget = resolvedTarget

  if (selector) {
    // If selector is used, 'resolvedTarget' acts as the scope for the selector
    targets = gsap.utils.toArray(selector, resolvedTarget as HTMLElement)
  } else if (resolvedTarget instanceof HTMLElement && resolvedTarget.children.length > 0) {
    targets = Array.from(resolvedTarget.children) as HTMLElement[]
  }

  const fromVars: gsap.TweenVars = {
    y: prefersReducedMotion ? 0 : y,
    x: prefersReducedMotion ? 0 : x,
    opacity: 0,
  }

  if (clipPath) {
    fromVars.clipPath = typeof clipPath === 'string' ? clipPath : clipPath.from
  }

  const toVars: gsap.TweenVars = {
    y: 0,
    x: 0,
    opacity: 1,
    duration,
    ease,
    stagger: timeline ? stagger : undefined,
    delay: timeline ? undefined : delay,
  }

  if (clipPath) {
    toVars.clipPath = typeof clipPath === 'string' ? 'none' : clipPath.to
    if (prefersReducedMotion) {
      fromVars.clipPath = 'none'
      toVars.clipPath = 'none'
    }
  }

  // Chained timeline behavior
  if (timeline) {
    return timeline.fromTo(targets, fromVars, toVars, position ?? `+=${delay}`)
  }

  // Standalone ScrollTrigger behavior
  if (Array.isArray(targets)) {
    targets.forEach((t, i) => {
      if (!t) return
      gsap.fromTo(t, fromVars, {
        ...toVars,
        delay: delay + i * stagger,
        scrollTrigger: {
          trigger: t as HTMLElement,
          start,
          toggleActions: once ? 'play none none none' : anim.scrollTrigger.toggleActions,
        },
      })
    })
  } else {
    const resolvedTrigger = trigger ? resolveTarget(trigger) : targets
    gsap.fromTo(targets, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: (resolvedTrigger as gsap.DOMTarget) || (targets as gsap.DOMTarget),
        start,
        toggleActions: once ? 'play none none none' : anim.scrollTrigger.toggleActions,
      },
    })
  }
}

/**
 * Hook that returns a memoized 'reveal' function pre-bound with current motion preferences.
 * Useful for building complex timelines inside a useGSAP block.
 */
export function useReveal() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const anim = useSafeAnimation()

  return (target: RevealTarget, options: RevealOptions = {}) => {
    return reveal(target, {
      ...options,
      prefersReducedMotion,
      anim,
    })
  }
}

/**
 * Primary hook for reveal animations. Supports both simple standalone animations
 * and complex, configuration-driven timeline groups.
 *
 * @param ref - The primary element ref used as scope and default trigger.
 * @param config - Either standard RevealOptions or an array of RevealTimelineGroup.
 */
export function useRevealAnimation<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  config: RevealOptions | RevealTimelineGroup[] = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const revealFn = useReveal()
  const anim = useSafeAnimation()

  useGSAP(
    () => {
      if (Array.isArray(config)) {
        config.forEach((group) => {
          const resolvedTrigger = group.trigger ? resolveTarget(group.trigger) : ref.current
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: (resolvedTrigger as gsap.DOMTarget) || (ref.current as gsap.DOMTarget),
              start: group.start || anim.scrollTrigger.start,
              toggleActions:
                group.toggleActions ||
                (group.once ? 'play none none none' : anim.scrollTrigger.toggleActions),
            },
          })

          group.animations.forEach((item) => {
            revealFn(item.target, {
              ...item.options,
              timeline: tl,
            })
          })
        })
      } else {
        // Only auto-run if no external timeline is provided
        if (!config.timeline) {
          revealFn(ref, config)
        }
      }
    },
    {
      scope: (config as RevealOptions).scope || ref,
      // Re-run animations if motion preferences change
      dependencies: [prefersReducedMotion],
    }
  )
}
