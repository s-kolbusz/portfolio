'use client'

import { useEffect, useRef } from 'react'

import { useCursorInteractions } from '@/hooks/use-cursor-interactions'
import { useMedia, usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap, useGSAP } from '@/lib/gsap-core'
import { useCursorStore } from '@/lib/stores'

import './custom-cursor.css'

type Shape = 'dot' | 'text' | 'cross'

/** the dot's shape for what is under the pointer: a crosshair where you place a point, a text bar over selectable text */
function shapeFor(el: Element | null): Shape {
  if (!(el instanceof HTMLElement)) return 'dot'
  if (el.closest('[data-cursor-shape="cross"], .focal-editor__image-wrapper')) return 'cross'
  if (el.closest('a[href], button, [role="button"], label, input, select, textarea, [inert]'))
    return 'dot'
  const hasText = Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0
  )
  if (!hasText) return 'dot'
  return getComputedStyle(el).userSelect === 'none' ? 'dot' : 'text'
}

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

  // The ring wraps the element's whole box exactly where the keyboard focus ring sits (2 px at an 8 px offset,
  // so 10 px out on each side), measured every frame: elements move (menus reveal, pages scroll, Lenis eases).
  const updateTargetRect = () => {
    const el = magneticTargetRef.current
    if (el && el.isConnected) targetRectRef.current = el.getBoundingClientRect()
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
          const targetRadius = parseFloat(style.borderRadius) || 0
          const targetHeight = state.magneticTarget.getBoundingClientRect().height || 1

          const isPill = targetRadius >= targetHeight / 2
          const newRadius = isPill ? '9999px' : `${targetRadius + 10}px`

          gsap.to(ringRef.current, { borderRadius: newRadius, duration: 0.2 })
          // on a target the ring is the focus ring: same colour, same weight
          ringRef.current.style.borderColor = 'var(--color-ring)'
          ringRef.current.style.borderWidth = '2px'
          ringRef.current.style.mixBlendMode = 'normal'
        } else if (ringRef.current) {
          gsap.to(ringRef.current, { borderRadius: '50%', duration: 0.2 })
          ringRef.current.style.borderColor = ''
          ringRef.current.style.borderWidth = ''
          ringRef.current.style.mixBlendMode = ''
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

    let shape: Shape = 'dot'
    let pending: EventTarget | null = null
    let shapeFrame = 0
    const applyShape = () => {
      shapeFrame = 0
      const next = magneticTargetRef.current ? 'dot' : shapeFor(pending as Element | null)
      if (next === shape || !cursorRef.current || !ringRef.current) return
      shape = next
      cursorRef.current.dataset.shape = next
      // one cursor at a time: when the dot becomes a crosshair or a text bar, the ring steps back
      gsap.to(ringRef.current, {
        opacity: next === 'dot' ? 1 : 0,
        scale: next === 'dot' ? 1 : 0.5,
        duration: 0.22,
        ease: 'power3.out',
      })
    }
    const onMouseDown = () => {
      if (!cursorRef.current || !ringRef.current) return
      gsap.to(cursorRef.current, { scale: 0.7, duration: 0.12, ease: 'power2.out' })
      if (shape === 'dot')
        gsap.to(ringRef.current, { scale: 0.86, duration: 0.12, ease: 'power2.out' })
    }
    const onMouseUp = () => {
      if (!cursorRef.current || !ringRef.current) return
      gsap.to(cursorRef.current, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
      if (shape === 'dot')
        gsap.to(ringRef.current, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      pending = e.target
      if (!shapeFrame) shapeFrame = requestAnimationFrame(applyShape)
      if (!hasMoved.current) {
        if (cursorRef.current && ringRef.current) {
          hasMoved.current = true
          gsap.to([cursorRef.current, ringRef.current], { opacity: 1, duration: 0.3 })
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => {
      cancelAnimationFrame(shapeFrame)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
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
          updateTargetRect()
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
      data-adapt-theme="pointer"
      className="pointer-events-none fixed inset-0 z-9998 overflow-hidden print:hidden"
    >
      {/* the dot is two bars that morph: both round = a dot, both tall = a text bar, crossed = a crosshair */}
      <div
        ref={cursorRef}
        data-shape="dot"
        className="cc-dot pointer-events-none fixed top-0 left-0 opacity-0 will-change-transform"
      >
        <i data-bar="h" />
        <i data-bar="v" />
      </div>

      <div
        ref={ringRef}
        className="cc-ring pointer-events-none fixed top-0 left-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0 transition-colors will-change-transform"
      />
    </div>
  )
}
