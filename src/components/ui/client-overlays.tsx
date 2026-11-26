'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { CaseStudyBackButton } from '@/components/ui/case-study-back-button'
import { ServicesBackButton } from '@/components/ui/services-back-button'

const CustomCursor = dynamic(
  () => import('@/components/ui/custom-cursor').then((mod) => ({ default: mod.CustomCursor })),
  {
    ssr: false,
  }
)
const SmoothScroller = dynamic(
  () => import('@/components/ui/smooth-scroller').then((mod) => ({ default: mod.SmoothScroller })),
  { ssr: false }
)
const SiteNav = dynamic(
  () => import('@/components/ui/site-nav/site-nav').then((mod) => ({ default: mod.SiteNav })),
  { ssr: false }
)

// Load overlays in three staggered phases to avoid a synchronized burst on the main thread.
// Phase 1 (300ms):  SmoothScroller + CustomCursor
// Phase 2 (700ms):  SiteNav — on the home page it stays hidden until the hero's loader is gone
// Phase 3 (1200ms): back buttons
export function ClientOverlays() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 700)
    const t3 = setTimeout(() => setPhase(3), 1200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <>
      {phase >= 1 && <SmoothScroller />}
      {phase >= 1 && <CustomCursor />}
      {phase >= 2 && <SiteNav />}
      {phase >= 3 && <CaseStudyBackButton />}
      {phase >= 3 && <ServicesBackButton />}
    </>
  )
}
