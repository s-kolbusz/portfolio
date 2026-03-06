'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

const CustomCursor = dynamic(() => import('@/components/ui/custom-cursor').then((mod) => mod.CustomCursor), {
  ssr: false,
})
const SmoothScroller = dynamic(
  () => import('@/components/ui/smooth-scroller').then((mod) => mod.SmoothScroller),
  { ssr: false }
)
const DockNav = dynamic(() => import('@/components/ui/dock-nav').then((mod) => mod.DockNav), {
  ssr: false,
})
const SettingsDock = dynamic(
  () => import('@/components/ui/settings-dock').then((mod) => mod.SettingsDock),
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
      <SettingsDock />
      <DockNav />
    </>
  )
}
