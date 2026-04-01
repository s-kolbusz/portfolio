import { useEffect } from 'react'

import { gsap } from '@/lib/gsap'

type Axis = 'x' | 'y'

interface IndicatorConfig {
  activeItemIndex: number
  axis: Axis
  container: HTMLElement | null
  indicator: HTMLElement | null
  getOffset: (index: number) => number
}

function isVisible(element: HTMLElement | null) {
  if (!element) return false

  const style = window.getComputedStyle(element)
  return style.display !== 'none'
}

function getAxisTweenVars(axis: Axis, value: number) {
  return axis === 'x' ? { x: value } : { y: value }
}

export function animateIndicator({
  activeItemIndex,
  axis,
  container,
  indicator,
  getOffset,
}: IndicatorConfig) {
  if (!indicator) return

  if (activeItemIndex === -1) {
    gsap.to(indicator, {
      duration: 0.2,
      opacity: 0,
    })
    return
  }

  if (!isVisible(container)) return

  const offset = getOffset(activeItemIndex)
  const currentOpacity = Number(gsap.getProperty(indicator, 'opacity') ?? 0)

  if (currentOpacity === 0) {
    gsap.set(indicator, getAxisTweenVars(axis, offset))
    gsap.to(indicator, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
    return
  }

  gsap.to(indicator, {
    duration: 0.4,
    ease: 'power3.out',
    opacity: 1,
    ...getAxisTweenVars(axis, offset),
  })
}

export function syncIndicatorPosition({
  activeItemIndex,
  axis,
  container,
  indicator,
  getOffset,
}: IndicatorConfig) {
  if (!indicator) return

  if (activeItemIndex === -1) {
    gsap.set(indicator, { opacity: 0 })
    return
  }

  if (!isVisible(container)) {
    gsap.set(indicator, { opacity: 0 })
    return
  }

  gsap.set(indicator, {
    opacity: 1,
    ...getAxisTweenVars(axis, getOffset(activeItemIndex)),
  })
}

export function useWindowResize(handler: () => void) {
  useEffect(() => {
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [handler])
}
