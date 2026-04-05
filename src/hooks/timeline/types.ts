import type { RefObject } from 'react'

import type { gsap } from '@/lib/gsap-core'

export type AnimationTarget =
  | string
  | HTMLElement
  | Array<HTMLElement | null>
  | RefObject<HTMLElement | null>

export interface RevealOptions {
  y?: number
  x?: number
  stagger?: number
  selector?: string
  duration?: number
  ease?: string
  delay?: number
  clipPath?: string | { from: string; to: string }
  scale?: number
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  self?: boolean
  start?: string
  toggleActions?: string
}

export interface TimelineConfig {
  id?: string
  start?: string
  toggleActions?: string
}

export type RevealFn = (target: AnimationTarget, options?: RevealOptions) => void

export type TimelineSetup = (reveal: RevealFn) => void
