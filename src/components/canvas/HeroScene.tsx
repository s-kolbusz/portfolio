'use client'

import { Suspense } from 'react'

import { Environment, Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { ViscousPuddle } from './ViscousPuddle'

export default function HeroScene() {
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
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          <ViscousPuddle />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
