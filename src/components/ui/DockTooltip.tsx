'use client'

import { useRef } from 'react'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

type DockTooltipProps = {
  label: string
  isVisible: boolean
}

export function DockTooltip({ label, isVisible }: DockTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (isVisible) {
      gsap.to(tooltipRef.current, {
        x: -8, // Slide slightly left to its final position
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
        overwrite: true,
      })
    } else {
      gsap.to(tooltipRef.current, {
        x: 0, // Don't move right
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.in',
        overwrite: true,
      })
    }
  }, [isVisible])

  return (
    <div
      ref={tooltipRef}
      className="border-border pointer-events-none absolute right-full mr-2 hidden rounded-lg border bg-white px-3 py-1.5 font-mono text-sm whitespace-nowrap text-neutral-800 opacity-0 lg:block dark:bg-black dark:text-neutral-200"
    >
      {label}
    </div>
  )
}
