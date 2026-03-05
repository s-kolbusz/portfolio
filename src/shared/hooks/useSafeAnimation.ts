import { ANIMATION } from '@/shared/config/animations'
import { usePrefersReducedMotion } from '@/shared/hooks/useMedia'

export function useSafeAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!prefersReducedMotion) {
    return ANIMATION
  }

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
      elastic: 'power2.out',
      back: 'power2.out',
    },
  }
}
