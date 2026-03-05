import { gsap } from '@/lib/gsap'
import { ANIMATION } from '@/shared/config/animations'

import type { AnimationTarget, RevealOptions } from './types'

export interface RevealAnimationTokens {
  duration: {
    medium: number
  }
  ease: {
    out: string
  }
  stagger: {
    normal: number
  }
}

export const REVEAL = {
  y: 40,
  stagger: ANIMATION.stagger.normal,
  duration: ANIMATION.duration.medium,
  ease: ANIMATION.ease.out,
  start: ANIMATION.scrollTrigger.start,
  toggleActions: ANIMATION.scrollTrigger.toggleActions,
} as const

function resolveTarget(target: AnimationTarget): gsap.TweenTarget | null {
  if (typeof target === 'object' && target !== null && 'current' in target) {
    return target.current
  }

  return target as gsap.TweenTarget
}

export function createReveal(
  target: AnimationTarget,
  options: RevealOptions,
  prefersReducedMotion: boolean,
  anim: RevealAnimationTokens,
  globalStart: string,
  globalToggleActions: string
) {
  const resolved = resolveTarget(target)
  if (!resolved) return

  let targets: gsap.TweenTarget = resolved
  let triggerElement: gsap.DOMTarget = resolved as gsap.DOMTarget

  if (options.self) {
    targets = resolved
  } else if (options.selector && resolved instanceof HTMLElement) {
    targets = gsap.utils.toArray(options.selector, resolved)
  } else if (!options.selector && resolved instanceof HTMLElement && resolved.children.length > 0) {
    targets = Array.from(resolved.children) as HTMLElement[]
  }

  if (resolved instanceof HTMLElement) {
    triggerElement = resolved
  }

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
