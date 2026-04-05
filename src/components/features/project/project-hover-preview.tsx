'use client'

import { useRef } from 'react'
import { createPortal } from 'react-dom'

import Image from 'next/image'

import { gsap, useGSAP } from '@/lib/gsap-core'

interface ProjectHoverPreviewProps {
  image: string | null
  isActive: boolean
  isVisible: boolean
}

export function ProjectHoverPreview({ image, isActive, isVisible }: ProjectHoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for fine pointer (mouse)
  const isListening = isVisible && isActive

  // 1. Mouse Follow Logic - Using useGSAP for automatic cleanup and scoping
  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) return

      if (isListening) {
        // Spring physics for smooth follow
        const xTo = gsap.quickTo(container, 'x', { duration: 0.6, ease: 'power3.out' })
        const yTo = gsap.quickTo(container, 'y', { duration: 0.6, ease: 'power3.out' })

        // Initialize position to center of screen (approximate dimensions to avoid reading layout)
        const centerX = window.innerWidth / 2 - 150
        const centerY = window.innerHeight / 2 - 100
        gsap.set(container, { x: centerX, y: centerY })

        const onMove = (e: MouseEvent) => {
          xTo(e.clientX + 20)
          yTo(e.clientY + 20)
        }

        window.addEventListener('mousemove', onMove)

        gsap.to(container, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })

        return () => {
          window.removeEventListener('mousemove', onMove)
        }
      } else {
        gsap.to(container, {
          autoAlpha: 0,
          scale: 0.8,
          duration: 0.3,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            // Only kill tweens when we are SURE the element is hidden and interactions stopped
            // But checking isListening here might be stale closure if not careful.
            // Safest is to just let it finish.
            // If we really want to stop ticker, we can kill everything.
            gsap.killTweensOf(container)
          },
        })
      }
    },
    { dependencies: [isListening], scope: containerRef }
  )

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-none invisible fixed top-0 left-0 z-9999 h-48 w-72 overflow-hidden rounded-lg opacity-0 shadow-2xl shadow-zinc-950/20 md:h-64 md:w-96 dark:shadow-black/40"
    >
      {image && (
        <Image
          src={image}
          alt="Project preview"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />
      )}
    </div>,
    document.body
  )
}
