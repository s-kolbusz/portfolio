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
  { ssr: false }
)
const SettingsDock = dynamic(
  () => import('@/features/navigation/components/SettingsDock').then((mod) => mod.SettingsDock),
  { ssr: false }
)

export function ClientOverlays() {
  const [enhancementsReady, setEnhancementsReady] = useState(false)

  useEffect(() => {
    // Delay non-essential visual enhancements to keep the main thread free.
    const timer = setTimeout(() => setEnhancementsReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <SettingsDock />
      <DockNav />
      {enhancementsReady ? (
        <>
          <CustomCursor />
          <SmoothScroller />
        </>
      ) : null}
    </>
  )
}
