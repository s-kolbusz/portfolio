'use client'

import { useCallback, useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-media'

import { disposePuddleWebGL, lerp, setupPuddleWebGL } from './viscous-puddle/webgl'

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
  isInView: boolean
  lerpScroll: number
  time: number
  colorR: number
  colorG: number
  colorB: number
  scale: number
  opacity: number
  cssTranslateY: number
  cssScale: number
  canvasLeft: number
  canvasTop: number
  canvasWidth: number
  canvasHeight: number
}

function createInitialState(): PuddleState {
  return {
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    pointerInside: false,
    isMobile: false,
    isInView: true,
    lerpScroll: 0,
    time: 0,
    colorR: 0.494,
    colorG: 0.773,
    colorB: 0.557,
    scale: 1,
    opacity: 0,
    cssTranslateY: 0,
    cssScale: 1,
    canvasLeft: 0,
    canvasTop: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  }
}

export function ViscousPuddle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const stateRef = useRef<PuddleState>(createInitialState())
  const reducedMotionRef = useRef(prefersReducedMotion)

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion
  }, [prefersReducedMotion])

  const syncCanvasMetrics = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    stateRef.current.canvasLeft = rect.left
    stateRef.current.canvasTop = rect.top + window.scrollY - stateRef.current.cssTranslateY
    stateRef.current.canvasWidth = width
    stateRef.current.canvasHeight = height
    stateRef.current.isMobile = width < 768
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const webgl = setupPuddleWebGL(canvas)
    if (!webgl) {
      console.warn('WebGL2 not supported')
      return
    }

    const { gl, vao, uniforms } = webgl

    syncCanvasMetrics(canvas)
    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.isInView = entry.isIntersecting
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    const onMouseMove = (event: MouseEvent) => {
      const state = stateRef.current
      if (!state.isInView || state.canvasWidth === 0 || state.canvasHeight === 0) return

      const canvasTop = state.canvasTop - window.scrollY + state.cssTranslateY

      stateRef.current.pointerInside = true
      stateRef.current.targetMouseX = Math.min(
        1,
        Math.max(0, (event.clientX - state.canvasLeft) / state.canvasWidth)
      )
      stateRef.current.targetMouseY = Math.min(
        1,
        Math.max(0, 1 - (event.clientY - canvasTop) / state.canvasHeight)
      )
    }

    const onMouseLeave = () => {
      stateRef.current.pointerInside = false
    }

    const onMouseEnter = () => {
      stateRef.current.pointerInside = true
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasMetrics(canvas)
    })
    resizeObserver.observe(canvas)

    const onResize = () => syncCanvasMetrics(canvas)
    window.addEventListener('resize', onResize)

    let raf = 0
    let lastTime = performance.now()

    const render = (now: number) => {
      raf = requestAnimationFrame(render)

      const state = stateRef.current
      if (!state.isInView) {
        lastTime = now
        return
      }

      const rawDelta = (now - lastTime) / 1000
      const delta = Math.min(rawDelta, 0.05)
      lastTime = now

      if (!reducedMotionRef.current) {
        state.time += delta
      }

      state.opacity = lerp(state.opacity, 1, 0.025)

      const targetScale = state.isMobile ? 0.6 : 1
      state.scale = lerp(state.scale, targetScale, 0.1)

      const targetColor = getPrimaryRgb()
      state.colorR = lerp(state.colorR, targetColor[0], 0.05)
      state.colorG = lerp(state.colorG, targetColor[1], 0.05)
      state.colorB = lerp(state.colorB, targetColor[2], 0.05)

      const pointerLerp = state.pointerInside && !reducedMotionRef.current ? 0.06 : 0.02
      if (state.isMobile || !state.pointerInside || reducedMotionRef.current) {
        state.targetMouseX = 0.5
        state.targetMouseY = 0.5
      }
      state.mouseX = lerp(state.mouseX, state.targetMouseX, pointerLerp)
      state.mouseY = lerp(state.mouseY, state.targetMouseY, pointerLerp)

      if (!reducedMotionRef.current) {
        const rawScroll = window.scrollY
        const clampedScroll = Math.min(rawScroll, state.canvasHeight * 1.5)

        state.lerpScroll = lerp(state.lerpScroll, clampedScroll, 0.15)
        if (Math.abs(state.lerpScroll - clampedScroll) < 0.1) {
          state.lerpScroll = clampedScroll
        }

        const targetTranslateY = state.lerpScroll * 1.5
        const targetCssScale = 1 + state.lerpScroll * 0.0025

        state.cssTranslateY = lerp(state.cssTranslateY, targetTranslateY, 0.2)
        state.cssScale = lerp(state.cssScale, targetCssScale, 0.2)

        canvas.style.transform = `translateY(${state.cssTranslateY}px) scale(${state.cssScale})`
      }

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uniforms.uTime, state.time)
      gl.uniform2f(uniforms.uMouse, state.mouseX, state.mouseY)
      gl.uniform2f(uniforms.uResolution, state.canvasWidth, state.canvasHeight)
      gl.uniform3f(uniforms.uColor, state.colorR, state.colorG, state.colorB)
      gl.uniform1f(uniforms.uScale, state.scale)
      gl.uniform1f(uniforms.uOpacity, state.opacity)

      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindVertexArray(null)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('resize', onResize)
      disposePuddleWebGL(webgl)
    }
  }, [syncCanvasMetrics])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full will-change-transform"
      style={{ opacity: 0, transition: 'opacity 1.5s ease-out' }}
      aria-hidden="true"
    />
  )
}
