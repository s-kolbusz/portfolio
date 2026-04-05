'use client'

import { useEffect, useRef } from 'react'

import { useCursorInteractions } from '@/hooks/use-cursor-interactions'
import { useMedia, usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap, useGSAP } from '@/lib/gsap-core'
import { useCursorStore } from '@/lib/stores'

export function CustomCursor() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isEnabled = useMedia('(pointer: fine)') && !prefersReducedMotion

  const setMagneticTarget = useCursorStore((state) => state.setMagneticTarget)

  useCursorInteractions(isEnabled)

  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

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
    if (!isEnabled) return

    window.addEventListener('scroll', updateTargetRect, { passive: true })
    window.addEventListener('resize', updateTargetRect)
    return () => {
      window.removeEventListener('scroll', updateTargetRect)
      window.removeEventListener('resize', updateTargetRect)
    }
  }, [isEnabled])

  useGSAP(() => {
    if (!isEnabled) return

    mouse.current.x = window.innerWidth / 2
    mouse.current.y = window.innerHeight / 2

    const unsubscribe = useCursorStore.subscribe((state, prevState) => {
      if (state.magneticTarget !== prevState.magneticTarget) {
        magneticTargetRef.current = state.magneticTarget
        updateTargetRect()

        if (state.magneticTarget && ringRef.current) {
          const style = window.getComputedStyle(state.magneticTarget)
          const targetRadius = parseInt(style.borderRadius)
          const targetHeight = parseInt(style.height)

          const isPill = targetRadius >= targetHeight / 2
          const newRadius = isPill ? '9999px' : `${targetRadius + 10}px`

          gsap.to(ringRef.current, { borderRadius: newRadius, duration: 0.2 })
        } else if (ringRef.current) {
          gsap.to(ringRef.current, { borderRadius: '50%', duration: 0.2 })
        }
      }

      if (state.variant !== prevState.variant && ringRef.current && cursorRef.current) {
        if (state.variant === 'button') {
          gsap.to(ringRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          })
        } else {
          gsap.to(ringRef.current, {
            backgroundColor: 'transparent',
          })
        }

        if (state.variant === 'hidden') {
          gsap.to([ringRef.current, cursorRef.current], { opacity: 0 })
        } else if (state.variant === 'slider') {
          gsap.to(cursorRef.current, { opacity: 0, duration: 0.1 })
          gsap.to(ringRef.current, { opacity: 1 })
        } else if (prevState.variant === 'slider') {
          gsap.to(cursorRef.current, { opacity: 1, delay: 0.2, duration: 0.15 })
          gsap.to(ringRef.current, { opacity: 1 })
        } else {
          gsap.to([ringRef.current, cursorRef.current], { opacity: 1 })
        }
      }
    })

    return () => unsubscribe()
  }, [isEnabled])

  useGSAP(() => {
    if (!isEnabled) return

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
  }, [isEnabled])

  useGSAP(() => {
    if (!isEnabled || !cursorRef.current || !ringRef.current) return

    const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.1, ease: 'power3' })
    const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.1, ease: 'power3' })

    const ringXTo = gsap.quickTo(ringRef.current, 'x', { duration: 0.25, ease: 'power3' })
    const ringYTo = gsap.quickTo(ringRef.current, 'y', { duration: 0.25, ease: 'power3' })
    const ringWidthTo = gsap.quickTo(ringRef.current, 'width', { duration: 0.25, ease: 'power3' })
    const ringHeightTo = gsap.quickTo(ringRef.current, 'height', { duration: 0.25, ease: 'power3' })

    const DEFAULT_SIZE = 40

    let lastMouseX = mouse.current.x
    let lastMouseY = mouse.current.y
    let lastRingX = mouse.current.x
    let lastRingY = mouse.current.y
    let lastRingW = DEFAULT_SIZE
    let lastRingH = DEFAULT_SIZE
    let lastHasTarget = false

    const POSITION_THRESHOLD = 0.5
    const SIZE_THRESHOLD = 0.5

    const CONNECTIVITY_CHECK_INTERVAL = 30
    let frameCount = 0

    const tickerCallback = () => {
      const currentTarget = magneticTargetRef.current
      const mouseX = mouse.current.x
      const mouseY = mouse.current.y

      let ringTargetX = mouseX
      let ringTargetY = mouseY
      let targetWidth = DEFAULT_SIZE
      let targetHeight = DEFAULT_SIZE
      let hasTarget = false

      if (currentTarget) {
        frameCount++
        if (frameCount % CONNECTIVITY_CHECK_INTERVAL === 0) {
          if (!currentTarget.isConnected || targetRectRef.current.width === 0) {
            setMagneticTarget(null)
            magneticTargetRef.current = null
            frameCount = 0
          }
        }

        if (magneticTargetRef.current) {
          const rect = targetRectRef.current
          hasTarget = rect.width > 0
          let centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          let w = rect.width + 20
          let h = rect.height + 20

          if (
            currentTarget.tagName === 'INPUT' &&
            (currentTarget as HTMLInputElement).type === 'range'
          ) {
            const input = currentTarget as HTMLInputElement
            const min = parseFloat(input.min || '0')
            const max = parseFloat(input.max || '100')
            const val = parseFloat(input.value)
            const percent = (val - min) / (max - min)

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

      if (
        mouseX === lastMouseX &&
        mouseY === lastMouseY &&
        ringTargetX === lastRingX &&
        ringTargetY === lastRingY &&
        targetWidth === lastRingW &&
        targetHeight === lastRingH
      ) {
        return
      }

      if (Math.abs(mouseX - lastMouseX) > POSITION_THRESHOLD) {
        xTo(mouseX)
        lastMouseX = mouseX
      }
      if (Math.abs(mouseY - lastMouseY) > POSITION_THRESHOLD) {
        yTo(mouseY)
        lastMouseY = mouseY
      }

      if (hasTarget !== lastHasTarget) {
        ringXTo(ringTargetX)
        ringYTo(ringTargetY)
        ringWidthTo(targetWidth)
        ringHeightTo(targetHeight)
        lastRingX = ringTargetX
        lastRingY = ringTargetY
        lastRingW = targetWidth
        lastRingH = targetHeight
        lastHasTarget = hasTarget
      } else {
        if (Math.abs(ringTargetX - lastRingX) > POSITION_THRESHOLD) {
          ringXTo(ringTargetX)
          lastRingX = ringTargetX
        }
        if (Math.abs(ringTargetY - lastRingY) > POSITION_THRESHOLD) {
          ringYTo(ringTargetY)
          lastRingY = ringTargetY
        }
        if (Math.abs(targetWidth - lastRingW) > SIZE_THRESHOLD) {
          ringWidthTo(targetWidth)
          lastRingW = targetWidth
        }
        if (Math.abs(targetHeight - lastRingH) > SIZE_THRESHOLD) {
          ringHeightTo(targetHeight)
          lastRingH = targetHeight
        }
      }
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
      <div
        ref={cursorRef}
        className="bg-cursor pointer-events-none fixed top-0 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 will-change-transform"
      />

      <div
        ref={ringRef}
        className="border-cursor pointer-events-none fixed top-0 left-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0 transition-colors will-change-transform"
      />
    </div>
  )
}
