'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { CaseStudyBackButton } from '@/components/ui/case-study-back-button'

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

export function ClientOverlays() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Delay loading overlays to free up main thread during initial render
    const timer = setTimeout(() => setMounted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <>
      <CustomCursor />
      <SmoothScroller />
      <CaseStudyBackButton />
      <SettingsDock />
      <DockNav />
    </>
  )
}
