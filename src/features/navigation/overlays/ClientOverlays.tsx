'use client'

import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

const CustomCursor = dynamic(() => import('@/features/navigation/overlays/CustomCursor'), {
  ssr: false,
})
const SmoothScroller = dynamic(
  () => import('@/shared/ui/SmoothScroller').then((mod) => mod.SmoothScroller),
  { ssr: false }
)
const DockNav = dynamic(
  () => import('@/features/navigation/components/DockNav').then((mod) => mod.DockNav),
  {
    ssr: false,
  }
)
const SettingsDock = dynamic(
  () => import('@/features/navigation/components/SettingsDock').then((mod) => mod.SettingsDock),
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
