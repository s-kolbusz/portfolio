'use client'

import { useEffect, useRef } from 'react'

import { useCursorInteractions } from '@/features/navigation/hooks/useCursorInteractions'
import { useCursorStore } from '@/features/navigation/lib/cursor-store'
import { useGSAP } from '@/lib/gsap'
import { gsap } from '@/lib/gsap'
import { useMedia, usePrefersReducedMotion } from '@/shared/hooks/useMedia'

export default function CustomCursor() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isEnabled = useMedia('(pointer: fine)') && !prefersReducedMotion

  // Use selectors for actions only to avoid re-renders on state changes
  const setMagneticTarget = useCursorStore((state) => state.setMagneticTarget)

  // Initialize cursor interactions (global listeners)
  useCursorInteractions()

  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  // Transient state for the ticker to read without causing re-renders
  const magneticTargetRef = useRef<HTMLElement | null>(null)
  const targetRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 })
  const mouse = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  useEffect(() => {
    const root = document.documentElement

    if (!isEnabled) {
      root.classList.remove('custom-cursor-active')
      return
    }

    root.classList.add('custom-cursor-active')

    return () => {
      root.classList.remove('custom-cursor-active')
    }
  }, [isEnabled])

  const updateTargetRect = () => {
    if (magneticTargetRef.current && magneticTargetRef.current.isConnected) {
      targetRectRef.current = magneticTargetRef.current.getBoundingClientRect()
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', updateTargetRect, { passive: true })
    window.addEventListener('resize', updateTargetRect)
    return () => {
      window.removeEventListener('scroll', updateTargetRect)
      window.removeEventListener('resize', updateTargetRect)
    }
  }, [])

  // Subscribe to store changes manually to handle visual updates
  useEffect(() => {
    // Initialize mouse position if window is available
    if (typeof window !== 'undefined') {
      mouse.current.x = window.innerWidth / 2
      mouse.current.y = window.innerHeight / 2
    }

    const unsubscribe = useCursorStore.subscribe((state, prevState) => {
      // Handle magnetic target changes
      if (state.magneticTarget !== prevState.magneticTarget) {
        magneticTargetRef.current = state.magneticTarget
        updateTargetRect()

        if (state.magneticTarget && ringRef.current) {
          const style = window.getComputedStyle(state.magneticTarget)
          const targetRadius = parseInt(style.borderRadius)
          const targetHeight = parseInt(style.height)

          // If it's a pill shape (rounded-full), we want to maintain that for the larger ring
          const isPill = targetRadius >= targetHeight / 2
          const newRadius = isPill ? '9999px' : `${targetRadius + 10}px`

          gsap.to(ringRef.current, { borderRadius: newRadius, duration: 0.2 })
        } else if (ringRef.current) {
          gsap.to(ringRef.current, { borderRadius: '50%', duration: 0.2 })
        }
      }

      // Handle variant changes
      if (state.variant !== prevState.variant && ringRef.current && cursorRef.current) {
        if (state.variant === 'button') {
          gsap.to(ringRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', // White for better contrast in difference mode
          })
        } else {
          gsap.to(ringRef.current, {
            backgroundColor: 'transparent',
          })
        }

        if (state.variant === 'hidden') {
          gsap.to([ringRef.current, cursorRef.current], { opacity: 0 })
        } else if (state.variant === 'slider') {
          // Slider active: hide dot immediately, keep ring visible
          gsap.to(cursorRef.current, { opacity: 0, duration: 0.1 })
          gsap.to(ringRef.current, { opacity: 1 })
        } else if (prevState.variant === 'slider') {
          // Coming back FROM slider: delay dot fade-in so GSAP lerps
          // it to the real mouse position first (avoids visible jump)
          gsap.to(cursorRef.current, { opacity: 1, delay: 0.2, duration: 0.15 })
          gsap.to(ringRef.current, { opacity: 1 })
        } else {
          gsap.to([ringRef.current, cursorRef.current], { opacity: 1 })
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Update mouse position
  useGSAP(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (!hasMoved.current) {
        if (cursorRef.current && ringRef.current) {
          hasMoved.current = true
          gsap.to([cursorRef.current, ringRef.current], { opacity: 1, duration: 0.3 })
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Animation Loop
  useGSAP(() => {
    if (!isEnabled || !cursorRef.current || !ringRef.current) return

    const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.1, ease: 'power3' })
    const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.1, ease: 'power3' })

    const ringXTo = gsap.quickTo(ringRef.current, 'x', { duration: 0.25, ease: 'power3' })
    const ringYTo = gsap.quickTo(ringRef.current, 'y', { duration: 0.25, ease: 'power3' })
    const ringWidthTo = gsap.quickTo(ringRef.current, 'width', { duration: 0.25, ease: 'power3' })
    const ringHeightTo = gsap.quickTo(ringRef.current, 'height', { duration: 0.25, ease: 'power3' })

    const DEFAULT_SIZE = 40

    const tickerCallback = () => {
      const currentTarget = magneticTargetRef.current

      let ringTargetX = mouse.current.x
      let ringTargetY = mouse.current.y
      let targetWidth = DEFAULT_SIZE
      let targetHeight = DEFAULT_SIZE

      if (currentTarget) {
        // Check if element is still in DOM
        if (!currentTarget.isConnected) {
          setMagneticTarget(null)
          magneticTargetRef.current = null
        } else {
          const rect = targetRectRef.current
          if (rect.width === 0) {
            setMagneticTarget(null)
            magneticTargetRef.current = null
          } else {
            let centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            let w = rect.width + 20
            let h = rect.height + 20

            // Special handling for range sliders to follow the thumb
            if (
              currentTarget.tagName === 'INPUT' &&
              (currentTarget as HTMLInputElement).type === 'range'
            ) {
              const input = currentTarget as HTMLInputElement
              const min = parseFloat(input.min || '0')
              const max = parseFloat(input.max || '100')
              const val = parseFloat(input.value)
              const percent = (val - min) / (max - min)

              // 12px is a common thumb width, but we'll approximate
              const thumbPadding = 12
              const trackWidth = rect.width - thumbPadding * 2
              centerX = rect.left + thumbPadding + percent * trackWidth
              w = 30
              h = 30
            }

            ringTargetX = centerX
            ringTargetY = centerY
            targetWidth = w
            targetHeight = h
          }
        }
      }

      xTo(mouse.current.x)
      yTo(mouse.current.y)

      ringXTo(ringTargetX)
      ringYTo(ringTargetY)
      ringWidthTo(targetWidth)
      ringHeightTo(targetHeight)
    }

    gsap.ticker.add(tickerCallback)
    return () => gsap.ticker.remove(tickerCallback)
  }, [isEnabled])

  if (!isEnabled) return null

  return (
    <div
      data-testid="custom-cursor"
      className="pointer-events-none fixed inset-0 z-9998 overflow-hidden mix-blend-difference print:hidden"
    >
      {/* Dot */}
      <div
        ref={cursorRef}
        className="bg-cursor pointer-events-none fixed top-0 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 will-change-transform"
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="border-cursor pointer-events-none fixed top-0 left-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0 transition-colors will-change-transform"
      />
    </div>
  )
}
