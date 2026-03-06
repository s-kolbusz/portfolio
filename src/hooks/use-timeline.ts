'use client'

export { useStandaloneReveal, useTimeline } from './timeline/hooks'
export { REVEAL } from './timeline/reveal-engine'
export { useTimelineStore } from './timeline/store'
export type {
  AnimationTarget,
  RevealFn,
  RevealOptions,
  TimelineConfig,
  TimelineSetup,
} from './timeline/types'
