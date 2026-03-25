import { usePrefersReducedMotion } from '@/hooks/use-media'
import { ANIMATION } from '@/lib/constants/animations'

/**
 * Helper to get animation values that respect prefers-reduced-motion
 */
export const useSafeAnimation = () => {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!prefersReducedMotion) return ANIMATION

  return {
    ...ANIMATION,
    duration: {
      fast: 0.3,
      medium: 0.4,
      slow: 0.5,
      verySlow: 0.6,
    },
    stagger: {
      tight: 0,
      normal: 0,
      loose: 0,
      slow: 0,
    },
    ease: {
      ...ANIMATION.ease,
    },
  }
}
