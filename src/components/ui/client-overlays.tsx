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
const DockNav = dynamic(
  () => import('@/components/ui/dock-nav').then((mod) => ({ default: mod.DockNav })),
  {
    ssr: false,
  }
)
const SettingsDock = dynamic(
  () => import('@/components/ui/settings-dock').then((mod) => ({ default: mod.SettingsDock })),
  { ssr: false }
)

// Load overlays in three staggered phases to avoid a synchronized burst on the main thread.
// Phase 1 (300ms):  SmoothScroller + back buttons — needed early for scroll/navigation
// Phase 2 (700ms):  CustomCursor — interactive, but not blocking
// Phase 3 (1200ms): DockNav + SettingsDock — decorative UI, load last
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
      {phase >= 2 && <DockNav />}
      {phase >= 2 && <SettingsDock />}
      {phase >= 3 && <CaseStudyBackButton />}
      {phase >= 3 && <ServicesBackButton />}
    </>
  )
}
