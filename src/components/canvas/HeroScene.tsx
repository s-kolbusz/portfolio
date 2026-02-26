'use client'

import { useEffect, useState } from 'react'

import { usePrefersReducedMotion } from '@/hooks/useMedia'

import { ViscousPuddle } from './ViscousPuddle'

export default function HeroScene() {
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    // Delay WebGL initialization to unblock the main thread during hydration.
    // This allows FCP and LCP to fire immediately.
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <ViscousPuddle />
    </div>
  )
}
