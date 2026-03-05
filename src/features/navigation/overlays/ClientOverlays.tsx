'use client'

import { useEffect, useState } from 'react'

import { dynamicClientOnly, dynamicClientOnlyNamed } from '@/shared/lib/loadable'

const CustomCursor = dynamicClientOnly(() => import('@/features/navigation/overlays/CustomCursor'))
const SmoothScroller = dynamicClientOnlyNamed(
  () => import('@/shared/ui/SmoothScroller'),
  (module) => module.SmoothScroller
)
const DockNav = dynamicClientOnlyNamed(
  () => import('@/features/navigation/components/DockNav'),
  (module) => module.DockNav
)
const SettingsDock = dynamicClientOnlyNamed(
  () => import('@/features/navigation/components/SettingsDock'),
  (module) => module.SettingsDock
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
