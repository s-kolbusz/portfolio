import { usePrefersReducedMotion } from '@/shared/hooks/useMedia'

export const ANIMATION = {
  duration: {
    fast: 0.6,
    medium: 1.0,
    slow: 1.4,
    verySlow: 1.8,
  },
  stagger: {
    tight: 0.05,
    normal: 0.1,
    loose: 0.15,
    slow: 0.2,
  },
  delay: {
    none: 0,
    short: 0.2,
    medium: 0.6,
    long: 0.8,
  },
  ease: {
    out: 'power2.out',
    outStrong: 'power3.out',
    outExpo: 'expo.out',
    inOut: 'power3.inOut',
    elastic: 'elastic.out(1, 0.5)',
    back: 'back.out(1.7)',
  },
  scrollTrigger: {
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  },
} as const

/**
 * Helper to get animation values that respect prefers-reduced-motion
 * @param prefersReducedMotion Boolean from useMedia('(prefers-reduced-motion: reduce)')
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
      elastic: 'power2.out',
      back: 'power2.out',
    },
  }
}
