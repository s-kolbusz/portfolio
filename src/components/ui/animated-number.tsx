'use client'

import { useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useSafeAnimation } from '@/hooks/use-safe-animation'
import { gsap, useGSAP } from '@/lib/gsap'

interface AnimatedNumberProps {
  value: number
  formatter?: (v: number) => string | number
  className?: string
}

export const AnimatedNumber = ({
  value,
  formatter = (v) => v.toString(),
  className,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const valueRef = useRef(value)
  const prefersReducedMotion = usePrefersReducedMotion()

  const ANIMATION = useSafeAnimation()

  useGSAP(() => {
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = formatter(value).toString()
      }
      return
    }

    gsap.to(valueRef, {
      current: value,
      duration: ANIMATION.duration.fast,
      ease: ANIMATION.ease.elastic,
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = formatter(valueRef.current).toString()
        }
      },
    })
  }, [value, prefersReducedMotion, formatter])

  return (
    <span ref={ref} className={className}>
      {formatter(value)}
    </span>
  )
}
