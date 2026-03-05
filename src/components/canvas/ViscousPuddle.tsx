'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useTheme } from 'next-themes'

import { usePrefersReducedMotion } from '@/shared/hooks/useMedia'

import { disposePuddleWebGL, hexToRgb, lerp, setupPuddleWebGL } from './viscous-puddle/webgl'

const LIGHT_COLOR = hexToRgb('#7ec58e')
const DARK_COLOR = hexToRgb('#135534')

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
    colorR: LIGHT_COLOR[0],
    colorG: LIGHT_COLOR[1],
    colorB: LIGHT_COLOR[2],
    scale: 1,
    opacity: 0,
    cssTranslateY: 0,
    cssScale: 1,
  }
}

export function ViscousPuddle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  const stateRef = useRef<PuddleState>(createInitialState())
  const themeRef = useRef(resolvedTheme)
  const reducedMotionRef = useRef(prefersReducedMotion)

  useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion
  }, [prefersReducedMotion])

  const handleResize = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
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

    handleResize(canvas)
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
      stateRef.current.pointerInside = true
      const rect = canvas.getBoundingClientRect()
      stateRef.current.targetMouseX = (event.clientX - rect.left) / rect.width
      stateRef.current.targetMouseY = 1 - (event.clientY - rect.top) / rect.height
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

    const onResize = () => handleResize(canvas)
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

      const targetColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR
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
        const clampedScroll = Math.min(rawScroll, canvas.clientHeight * 1.5)

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
      gl.uniform2f(uniforms.uResolution, canvas.clientWidth, canvas.clientHeight)
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
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('resize', onResize)
      disposePuddleWebGL(webgl)
    }
  }, [handleResize])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full will-change-transform"
      style={{ opacity: 0, transition: 'opacity 1.5s ease-out' }}
      aria-hidden="true"
    />
  )
}
