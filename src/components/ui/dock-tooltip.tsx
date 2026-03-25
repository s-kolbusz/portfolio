'use client'

import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/gsap'

type DockTooltipProps = {
  label: string
  isVisible: boolean
}

export function DockTooltip({ label, isVisible }: DockTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (isVisible) {
      gsap.to(tooltipRef.current, {
        x: -10,
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power4.out',
        overwrite: true,
      })
    } else {
      gsap.to(tooltipRef.current, {
        x: -2,
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
      className="border-border/70 bg-card/95 text-foreground shadow-foreground/10 pointer-events-none absolute right-full mr-3 hidden rounded-md border px-3 py-2 font-mono text-[11px] tracking-[0.18em] whitespace-nowrap uppercase opacity-0 shadow-lg lg:block"
    >
      {label}
    </div>
  )
}
