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
  },
  scrollTrigger: {
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  },
} as const
