'use client'

import { Suspense, useEffect, useState } from 'react'

import { Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { ViscousPuddle } from './ViscousPuddle'

export default function HeroScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Delay WebGL initialization to unblock the main thread during hydration.
    // This allows FCP and LCP to fire immediately.
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas
        shadows
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 5, 0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ViscousPuddle />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
