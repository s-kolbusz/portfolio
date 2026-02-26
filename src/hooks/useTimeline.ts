'use client'

import { create } from 'zustand'

import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { ANIMATION, useSafeAnimation } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap'

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type AnimationTarget =
  | string
  | HTMLElement
  | (HTMLElement | null)[]
  | React.RefObject<HTMLElement | null>

export interface RevealOptions {
  /** Y offset (default: 40) */
  y?: number
  /** X offset (default: 0) */
  x?: number
  /** Stagger between children (default: ANIMATION.stagger.normal) */
  stagger?: number
  /** A child selector — animate matching children instead of the target itself */
  selector?: string
  /** Duration override */
  duration?: number
  /** Ease override */
  ease?: string
  /** Delay before this reveal starts (seconds) */
  delay?: number
  /** clipPath reveal effect */
  clipPath?: string | { from: string; to: string }
  /** Scale from (default: 1 = no scale) */
  scale?: number
  /** Custom fromVars to merge */
  from?: gsap.TweenVars
  /** Custom toVars to merge */
  to?: gsap.TweenVars
  /**
   * If true, animate the resolved target element itself rather than its children.
   * By default, if a ref resolves to an element with children, those children are animated.
   */
  self?: boolean
  /**
   * ScrollTrigger start override for this specific reveal.
   * Default: inherits from ANIMATION.scrollTrigger.start
   */
  start?: string
  /**
   * ScrollTrigger toggleActions override for this specific reveal.
   * Default: inherits from ANIMATION.scrollTrigger.toggleActions
   */
  toggleActions?: string
}

export interface TimelineConfig {
  /** Unique section identifier for the store */
  id?: string
  /**
   * ScrollTrigger start position applied to all reveals unless overridden.
   * Default: ANIMATION.scrollTrigger.start
   */
  start?: string
  /** toggleActions override. Default: ANIMATION.scrollTrigger.toggleActions */
  toggleActions?: string
}

/**
 * Callback that receives a `reveal` function for adding animation steps.
 * Runs inside the GSAP effect — safe to access refs here.
 */
export type TimelineSetup = (reveal: RevealFn) => void

type RevealFn = (target: AnimationTarget, options?: RevealOptions) => void

// ────────────────────────────────────────────────────────────────────────────
// Zustand Store — lightweight registry for cross-section coordination
// ────────────────────────────────────────────────────────────────────────────

interface TimelineStore {
  sections: Set<string>
  register: (id: string) => void
  unregister: (id: string) => void
  has: (id: string) => boolean
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  sections: new Set(),
  register: (id) =>
    set((state) => {
      const next = new Set(state.sections)
      next.add(id)
      return { sections: next }
    }),
  unregister: (id) =>
    set((state) => {
      const next = new Set(state.sections)
      next.delete(id)
      return { sections: next }
    }),
  has: (id) => get().sections.has(id),
}))

// ────────────────────────────────────────────────────────────────────────────
// Consistent timing tokens — same element class = same timing everywhere
// ────────────────────────────────────────────────────────────────────────────

export const REVEAL = {
  /** Default Y travel distance */
  y: 40,
  /** Default stagger for children */
  stagger: ANIMATION.stagger.normal,
  /** Default duration */
  duration: ANIMATION.duration.medium,
  /** Default ease — smooth deceleration */
  ease: ANIMATION.ease.out,
  /** Scroll trigger start — from ANIMATION constants */
  start: ANIMATION.scrollTrigger.start,
  /** toggleActions — from ANIMATION constants */
  toggleActions: ANIMATION.scrollTrigger.toggleActions,
} as const

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function resolveTarget(target: AnimationTarget): gsap.TweenTarget | null {
  if (typeof target === 'object' && target !== null && 'current' in target) {
    return target.current
  }
  return target as gsap.TweenTarget
}

/**
 * Creates a single reveal animation with its own ScrollTrigger.
 * Each element triggers when IT enters the viewport — not when the section does.
 */
function createReveal(
  target: AnimationTarget,
  options: RevealOptions,
  prefersReducedMotion: boolean,
  anim: ReturnType<typeof useSafeAnimation>,
  globalStart: string,
  globalToggleActions: string
) {
  const resolved = resolveTarget(target)
  if (!resolved) return

  // Determine what to animate and what to use as trigger
  let targets: gsap.TweenTarget = resolved
  let triggerElement: gsap.DOMTarget = resolved as gsap.DOMTarget

  if (options.self) {
    targets = resolved
  } else if (options.selector && resolved instanceof HTMLElement) {
    targets = gsap.utils.toArray(options.selector, resolved)
  } else if (!options.selector && resolved instanceof HTMLElement && resolved.children.length > 0) {
    targets = Array.from(resolved.children) as HTMLElement[]
  }

  // The trigger is always the resolved parent element (the ref target)
  if (resolved instanceof HTMLElement) {
    triggerElement = resolved
  }

  // Build from/to vars using consistent tokens
  const y = prefersReducedMotion ? 0 : (options.y ?? REVEAL.y)
  const x = prefersReducedMotion ? 0 : (options.x ?? 0)
  const duration = options.duration ?? anim.duration.medium
  const ease = options.ease ?? anim.ease.out
  const stagger = options.stagger ?? anim.stagger.normal
  const scale = options.scale ?? 1
  const delay = options.delay ?? 0

  const fromVars: gsap.TweenVars = {
    y,
    x,
    opacity: 0,
    pointerEvents: 'none',
    ...(scale !== 1 && { scale }),
    ...options.from,
  }

  const toVars: gsap.TweenVars = {
    y: 0,
    x: 0,
    opacity: 1,
    pointerEvents: 'auto',
    ...(scale !== 1 && { scale: 1 }),
    duration,
    ease,
    stagger,
    delay,
    scrollTrigger: {
      trigger: triggerElement,
      start: options.start ?? globalStart,
      toggleActions: options.toggleActions ?? globalToggleActions,
    },
    ...options.to,
  }

  // clipPath handling
  if (options.clipPath) {
    if (prefersReducedMotion) {
      fromVars.clipPath = 'none'
      toVars.clipPath = 'none'
    } else if (typeof options.clipPath === 'string') {
      fromVars.clipPath = options.clipPath
      toVars.clipPath = 'none'
    } else {
      fromVars.clipPath = options.clipPath.from
      toVars.clipPath = options.clipPath.to
    }
  }

  gsap.fromTo(targets, fromVars, toVars)
}

// ────────────────────────────────────────────────────────────────────────────
// useTimeline — the primary hook
// ────────────────────────────────────────────────────────────────────────────

/**
 * Sets up scroll-triggered reveal animations scoped to a section element.
 * Each reveal() call creates its own independent ScrollTrigger, so elements
 * only animate when THEY enter the viewport — not when the section does.
 *
 * @example
 * ```tsx
 * const sectionRef = useRef<HTMLElement>(null)
 * const headerRef = useRef<HTMLDivElement>(null)
 * const contentRef = useRef<HTMLDivElement>(null)
 *
 * useTimeline(sectionRef, { id: 'about' }, (reveal) => {
 *   reveal(headerRef)
 *   reveal(contentRef, { stagger: 0.15 })
 *   reveal(imageRef, { clipPath: { from: 'inset(0 0 100% 0)', to: 'inset(0)' } })
 * })
 * ```
 */
export function useTimeline<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  config: TimelineConfig,
  setup: TimelineSetup
): void
export function useTimeline<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  setup: TimelineSetup
): void
export function useTimeline<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
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

      // Register in store
      if (id) {
        useTimelineStore.getState().register(id)
      }

      // Each reveal() creates its own ScrollTrigger
      const reveal: RevealFn = (target, options = {}) => {
        createReveal(target, options, prefersReducedMotion, anim, start, toggleActions)
      }

      setup(reveal)

      // Cleanup
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

// ────────────────────────────────────────────────────────────────────────────
// useStandaloneReveal — shorthand for a single element
// ────────────────────────────────────────────────────────────────────────────

/**
 * Reveals a single element with its own ScrollTrigger.
 * Use when an element isn't part of a section's useTimeline flow.
 *
 * @example
 * ```tsx
 * const cardRef = useRef<HTMLDivElement>(null)
 * useStandaloneReveal(cardRef, { y: 30 })
 * ```
 */
export function useStandaloneReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
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
