'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'

import { choreograph, type FrameRect } from './viscous-puddle/choreography'
import { disposePuddleWebGL, lerp, setupPuddleWebGL } from './viscous-puddle/webgl'

/** Marks the DOM frame the blob pours into (first scene on the home page). */
export const SIGNATURE_FRAME_SELECTOR = '[data-signature-frame]'
/** CSS custom property on the frame: opacity of its real image, 0–1. */
export const SIGNATURE_REVEAL_VAR = '--signature-reveal'

/** Read `--primary-rgb` CSS custom property → [r, g, b] floats (0-1). */
function readPrimaryRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim()
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts as [number, number, number]
  }
  return [0.494, 0.773, 0.557]
}

// Cached color value — recomputed only when the theme class on <html> changes,
// not on every animation frame (avoids forcing a style recalculation at 60fps).
let cachedPrimaryRgb: [number, number, number] | null = null

function getPrimaryRgb(): [number, number, number] {
  if (!cachedPrimaryRgb) {
    cachedPrimaryRgb = readPrimaryRgb()
  }
  return cachedPrimaryRgb
}

// Stored so it can be disconnected if needed and to prevent duplicate registration.
let themeObserver: MutationObserver | null = null

if (typeof document !== 'undefined' && !themeObserver) {
  themeObserver = new MutationObserver(() => {
    cachedPrimaryRgb = null
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

interface PuddleState {
  mouseX: number
  mouseY: number
  targetMouseX: number
  targetMouseY: number
  pointerInside: boolean
  isMobile: boolean
  time: number
  colorR: number
  colorG: number
  colorB: number
  scale: number
  opacity: number
  dpr: number
  canvasWidth: number
  canvasHeight: number
  frameElement: HTMLElement | null
  frame: FrameRect | null
  lastScrollY: number
  flow: number
}

function createInitialState(): PuddleState {
  return {
    mouseX: -1,
    mouseY: -1,
    targetMouseX: -1,
    targetMouseY: -1,
    pointerInside: false,
    isMobile: false,
    time: 0,
    colorR: 0.494,
    colorG: 0.773,
    colorB: 0.557,
    scale: 1,
    opacity: 0,
    dpr: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    frameElement: null,
    frame: null,
    lastScrollY: 0,
    flow: 0,
  }
}

function measureFrame(element: HTMLElement): FrameRect {
  const rect = element.getBoundingClientRect()
  return {
    left: rect.left,
    docTop: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
    radius: parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0,
  }
}

/**
 * Hero blob on a fixed, viewport-sized canvas behind the page. On scroll it
 * solidifies into a rounded rectangle that lands exactly on the first scene's
 * frame, where the real image fades in over it. Once the image covers it the
 * canvas stops rendering until the user scrolls back up.
 */
export function ViscousPuddle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const stateRef = useRef<PuddleState>(createInitialState())
  const reducedMotionRef = useRef(prefersReducedMotion)

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion
  }, [prefersReducedMotion])

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return
    const canvas: HTMLCanvasElement = canvasElement

    const webgl = setupPuddleWebGL(canvas)
    if (!webgl) {
      console.warn('WebGL2 not supported')
      return
    }

    const { gl, vao, uniforms } = webgl
    const state = stateRef.current

    const syncLayout = () => {
      const rect = canvas.getBoundingClientRect()
      state.isMobile = rect.width < 768
      // Phones get the same idea in a lighter form: lower resolution, no
      // cursor, calmer surface.
      state.dpr = Math.min(window.devicePixelRatio, state.isMobile ? 1 : 1.5)
      state.canvasWidth = rect.width
      state.canvasHeight = rect.height
      canvas.width = Math.round(rect.width * state.dpr)
      canvas.height = Math.round(rect.height * state.dpr)

      state.frameElement = document.querySelector<HTMLElement>(SIGNATURE_FRAME_SELECTOR)
      state.frame = state.frameElement ? measureFrame(state.frameElement) : null
    }

    syncLayout()
    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    const onMouseMove = (event: MouseEvent) => {
      state.pointerInside = true
      state.targetMouseX = event.clientX
      state.targetMouseY = event.clientY
    }
    const onMouseLeave = () => {
      state.pointerInside = false
    }
    const onMouseEnter = () => {
      state.pointerInside = true
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    const resizeObserver = new ResizeObserver(() => syncLayout())
    resizeObserver.observe(canvas)
    resizeObserver.observe(document.body)

    let awake = false
    let lastTime = performance.now()

    const setReveal = (value: number | null) => {
      const element = state.frameElement
      if (!element) return
      if (value === null) element.style.removeProperty(SIGNATURE_REVEAL_VAR)
      else element.style.setProperty(SIGNATURE_REVEAL_VAR, value.toFixed(3))
    }

    const sleep = () => {
      if (!awake) return
      awake = false
      gsap.ticker.remove(render)
      canvas.style.visibility = 'hidden'
    }

    const wake = () => {
      if (awake) return
      awake = true
      lastTime = performance.now()
      state.lastScrollY = window.scrollY
      canvas.style.visibility = 'visible'
      // Appended after Lenis on the same ticker, so the scroll position read
      // below is the one painted this frame and the rectangle never trails.
      gsap.ticker.add(render)
    }

    function render() {
      const now = performance.now()
      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const reduced = reducedMotionRef.current
      if (!reduced) state.time += delta

      state.opacity = lerp(state.opacity, 1, 0.025)
      state.scale = lerp(state.scale, state.isMobile ? 0.6 : 1, 0.1)

      const targetColor = getPrimaryRgb()
      state.colorR = lerp(state.colorR, targetColor[0], 0.05)
      state.colorG = lerp(state.colorG, targetColor[1], 0.05)
      state.colorB = lerp(state.colorB, targetColor[2], 0.05)

      const step = choreograph({
        scrollY: window.scrollY,
        viewportWidth: state.canvasWidth,
        viewportHeight: window.innerHeight,
        frame: state.frame,
        scale: state.scale,
      })

      setReveal(step.reveal)

      // Scroll speed stirs the surface (0–1), then eases off when it stops.
      const scrollY = window.scrollY
      const speed = delta > 0 ? Math.abs(scrollY - state.lastScrollY) / delta : 0
      state.lastScrollY = scrollY
      const targetFlow = reduced ? 0 : Math.min(speed / 2500, 1)
      state.flow = lerp(state.flow, targetFlow, targetFlow > state.flow ? 0.2 : 0.04)

      if (step.settled) {
        sleep()
        return
      }

      const followPointer = state.pointerInside && !state.isMobile && !reduced
      if (!followPointer || state.targetMouseX < 0) {
        state.targetMouseX = step.centerX
        state.targetMouseY = step.centerY
      }
      if (state.mouseX < 0) {
        state.mouseX = state.targetMouseX
        state.mouseY = state.targetMouseY
      }
      const pointerLerp = followPointer ? 0.06 : 0.02
      state.mouseX = lerp(state.mouseX, state.targetMouseX, pointerLerp)
      state.mouseY = lerp(state.mouseY, state.targetMouseY, pointerLerp)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uniforms.uTime, state.time)
      gl.uniform2f(uniforms.uViewport, state.canvasWidth, state.canvasHeight)
      gl.uniform1f(uniforms.uDpr, state.dpr)
      gl.uniform2f(uniforms.uMouse, state.mouseX, state.mouseY)
      gl.uniform3f(uniforms.uColor, state.colorR, state.colorG, state.colorB)
      gl.uniform1f(uniforms.uScale, state.scale)
      gl.uniform1f(uniforms.uOpacity, state.opacity)
      gl.uniform1f(uniforms.uDetail, state.isMobile ? 0.5 : 1)
      gl.uniform2f(uniforms.uCenter, step.centerX, step.centerY)
      gl.uniform2f(uniforms.uHalfSize, step.halfWidth, step.halfHeight)
      gl.uniform1f(uniforms.uCorner, step.cornerRadius)
      gl.uniform1f(uniforms.uFluid, step.fluid)
      gl.uniform1f(uniforms.uFlow, state.flow)

      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindVertexArray(null)
    }

    // Scrolling back above the frame wakes the canvas; the render loop itself
    // decides when it can go back to sleep.
    const onScroll = () => {
      if (awake) return
      const settled = choreograph({
        scrollY: window.scrollY,
        viewportWidth: state.canvasWidth,
        viewportHeight: window.innerHeight,
        frame: state.frame,
        scale: state.scale,
      }).settled
      if (!settled) wake()
    }
    const onResize = () => {
      syncLayout()
      wake()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    wake()

    return () => {
      sleep()
      setReveal(null)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      disposePuddleWebGL(webgl)
    }
  }, [])

  // Client-only (HeroScene mounts it after hydration). Rendered into <body> so
  // no transformed ancestor (page transitions) turns `fixed` into `absolute`.
  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 -z-10 h-lvh w-full"
      style={{ opacity: 0, transition: 'opacity 1.5s ease-out' }}
      aria-hidden="true"
    />,
    document.body
  )
}
