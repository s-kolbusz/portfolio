'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'

import { choreograph, type StageLayout } from './viscous-puddle/choreography'
import {
  publishSignature,
  SIGNATURE_FRAME_SELECTOR,
  SIGNATURE_REVEAL_VAR,
  SIGNATURE_STAGE_SELECTOR,
  SIGNATURE_STATIC_ATTR,
  SIGNATURE_TRACK_SELECTOR,
} from './viscous-puddle/signature-bus'
import {
  averageColour,
  createImageTexture,
  disposePuddleWebGL,
  lerp,
  setupPuddleWebGL,
} from './viscous-puddle/webgl'

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

interface SignatureElements {
  track: HTMLElement
  stage: HTMLElement
  frame: HTMLElement
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
  targetColour: [number, number, number]
  hasImage: boolean
  scale: number
  opacity: number
  dpr: number
  canvasWidth: number
  canvasHeight: number
  elements: SignatureElements | null
  stage: StageLayout | null
  lastScrollY: number
  flow: number
  dropOffsetX: number
  dropOffsetY: number
  /** Droplet spring state: it follows its scripted path with a little inertia. */
  dropReady: boolean
  dropX: number
  dropY: number
  dropVX: number
  dropVY: number
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
    targetColour: [0.19, 0.27, 0.22],
    hasImage: false,
    scale: 1,
    opacity: 0,
    dpr: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    elements: null,
    stage: null,
    lastScrollY: 0,
    flow: 0,
    dropOffsetX: 0,
    dropOffsetY: 0,
    dropReady: false,
    dropX: 0,
    dropY: 0,
    dropVX: 0,
    dropVY: 0,
  }
}

function findSignatureElements(): SignatureElements | null {
  const track = document.querySelector<HTMLElement>(SIGNATURE_TRACK_SELECTOR)
  const stage = track?.querySelector<HTMLElement>(SIGNATURE_STAGE_SELECTOR)
  const frame = stage?.querySelector<HTMLElement>(SIGNATURE_FRAME_SELECTOR)
  return track && stage && frame ? { track, stage, frame } : null
}

function measureStage({ track, stage, frame }: SignatureElements): StageLayout {
  const trackRect = track.getBoundingClientRect()
  const stageRect = stage.getBoundingClientRect()
  const frameRect = frame.getBoundingClientRect()
  return {
    trackDocTop: trackRect.top + window.scrollY,
    pinDistance: Math.max(1, track.offsetHeight - stage.offsetHeight),
    box: {
      left: frameRect.left,
      offsetTop: frameRect.top - stageRect.top,
      width: frameRect.width,
      height: frameRect.height,
      radius: parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0,
    },
  }
}

/**
 * Hero blob on a fixed, viewport-sized canvas behind the page. Across the
 * pinned signature scene it sets into the stronypodhale.pl page: it takes the
 * page's proportions and colour, the page surfaces inside it and solidifies
 * from the centre, and the final frame matches the DOM image pixel for pixel
 * before that image takes over. A droplet breaks off and stays liquid.
 * Script: docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
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
    const state = stateRef.current

    const webgl = setupPuddleWebGL(canvas)
    if (!webgl) {
      console.warn('WebGL2 not supported')
      // Without the canvas a 2.5-screen pin would just be a long static image.
      findSignatureElements()?.track.setAttribute(SIGNATURE_STATIC_ATTR, '')
      return
    }

    const { gl, vao, uniforms } = webgl
    gl.uniform1i(uniforms.uImage, 0)

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

      state.elements = findSignatureElements()
      state.stage = state.elements ? measureStage(state.elements) : null
    }

    syncLayout()
    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    // The page image becomes a texture once the browser is idle. It is the
    // DOM image itself (same responsive source), so the last canvas frame and
    // the image that replaces it are the same pixels.
    let texture: WebGLTexture | null = null
    let disposed = false
    const loadTexture = async () => {
      const image = state.elements?.frame.querySelector('img')
      if (!image) return
      image.loading = 'eager'
      try {
        await image.decode()
      } catch {
        return
      }
      if (disposed) return
      texture = createImageTexture(gl, image)
      state.targetColour = averageColour(image) ?? state.targetColour
      state.hasImage = texture !== null
    }
    // Safari has no requestIdleCallback.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle
      ? window.requestIdleCallback(() => void loadTexture(), { timeout: 1500 })
      : setTimeout(() => void loadTexture(), 300)

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
      const frame = state.elements?.frame
      if (!frame) return
      if (value === null) frame.style.removeProperty(SIGNATURE_REVEAL_VAR)
      else frame.style.setProperty(SIGNATURE_REVEAL_VAR, value.toFixed(3))
    }

    const currentStep = () =>
      choreograph({
        scrollY: window.scrollY,
        viewportWidth: state.canvasWidth,
        viewportHeight: window.innerHeight,
        stage: state.stage,
        scale: state.scale,
      })

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
      // below is the one painted this frame and the shape never trails.
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

      const primary = getPrimaryRgb()
      state.colorR = lerp(state.colorR, primary[0], 0.05)
      state.colorG = lerp(state.colorG, primary[1], 0.05)
      state.colorB = lerp(state.colorB, primary[2], 0.05)

      const step = currentStep()
      setReveal(step.reveal)
      publishSignature({
        step,
        startColour: [state.colorR, state.colorG, state.colorB],
        targetColour: state.targetColour,
      })

      // Scroll speed stirs the surface (0–1), then eases off when it stops.
      const scrollY = window.scrollY
      const speed = delta > 0 ? Math.abs(scrollY - state.lastScrollY) / delta : 0
      state.lastScrollY = scrollY
      const targetFlow = reduced ? 0 : Math.min(speed / 2500, 1)
      state.flow = lerp(state.flow, targetFlow, targetFlow > state.flow ? 0.2 : 0.04)

      if (!step.active) {
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

      // The droplet leans towards a nearby cursor, the way the blob does.
      const drop = step.droplet
      let dropTargetX = 0
      let dropTargetY = 0
      if (drop && followPointer) {
        const dx = state.mouseX - drop.x
        const dy = state.mouseY - drop.y
        const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 200) * 0.25
        dropTargetX = dx * pull
        dropTargetY = dy * pull
      }
      state.dropOffsetX = lerp(state.dropOffsetX, dropTargetX, 0.08)
      state.dropOffsetY = lerp(state.dropOffsetY, dropTargetY, 0.08)

      // Once free, the droplet chases its scripted spot on an underdamped
      // spring: it overshoots a touch, wobbles and settles. While still
      // attached it stays exactly on the path so the neck holds together.
      let dropX = 0
      let dropY = 0
      let dropStretch = 1
      let dropTowardX = 1
      let dropTowardY = 0
      if (drop) {
        const targetX = drop.x + state.dropOffsetX
        const targetY = drop.y + state.dropOffsetY
        if (!state.dropReady) {
          state.dropReady = true
          state.dropX = targetX
          state.dropY = targetY
          state.dropVX = 0
          state.dropVY = 0
        }
        const stiffness = 90
        const damping = 11
        state.dropVX += ((targetX - state.dropX) * stiffness - state.dropVX * damping) * delta
        state.dropVY += ((targetY - state.dropY) * stiffness - state.dropVY * damping) * delta
        state.dropX += state.dropVX * delta
        state.dropY += state.dropVY * delta

        const attached = drop.radius > 0 ? Math.min(1, drop.merge / (drop.radius * 3)) : 0
        dropX = lerp(state.dropX, targetX, attached)
        dropY = lerp(state.dropY, targetY, attached)

        // Free drops squash along their motion; attached ones along the neck.
        const speed = Math.hypot(state.dropVX, state.dropVY)
        const freeStretch = 1 + Math.min(speed / 1500, 0.35)
        const moving = speed > 1
        dropStretch = lerp(freeStretch, drop.stretch, attached)
        dropTowardX = attached > 0.5 || !moving ? drop.towardX : -state.dropVX / speed
        dropTowardY = attached > 0.5 || !moving ? drop.towardY : -state.dropVY / speed
      } else {
        state.dropReady = false
      }

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.disable(gl.SCISSOR_TEST)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Once the DOM image has taken over only the droplet is left: draw
      // just its neighbourhood.
      if (!step.body && drop) {
        const pad = drop.radius * 3
        const x = (dropX - pad) * state.dpr
        const y = (state.canvasHeight - (dropY + pad)) * state.dpr
        gl.enable(gl.SCISSOR_TEST)
        gl.scissor(
          Math.floor(x),
          Math.floor(y),
          Math.ceil(pad * 2 * state.dpr),
          Math.ceil(pad * 2 * state.dpr)
        )
      }

      gl.uniform1f(uniforms.uTime, state.time)
      gl.uniform2f(uniforms.uViewport, state.canvasWidth, state.canvasHeight)
      gl.uniform1f(uniforms.uDpr, state.dpr)
      gl.uniform2f(uniforms.uMouse, state.mouseX, state.mouseY)
      gl.uniform1f(uniforms.uScale, state.scale)
      gl.uniform1f(uniforms.uOpacity, state.opacity)
      gl.uniform1f(uniforms.uDetail, state.isMobile ? 0.5 : 1)
      gl.uniform3f(uniforms.uColor, state.colorR, state.colorG, state.colorB)
      gl.uniform3f(uniforms.uTargetColor, ...state.targetColour)
      gl.uniform1f(uniforms.uSolid, step.solid)
      gl.uniform1f(uniforms.uBody, step.body ? 1 : 0)
      gl.uniform2f(uniforms.uCenter, step.centerX, step.centerY)
      gl.uniform2f(uniforms.uHalfSize, step.halfWidth, step.halfHeight)
      gl.uniform1f(uniforms.uCorner, step.cornerRadius)
      gl.uniform1f(uniforms.uFluid, step.fluid)
      gl.uniform1f(uniforms.uFlow, state.flow)
      gl.uniform1f(uniforms.uHasImage, state.hasImage ? 1 : 0)
      gl.uniform4f(
        uniforms.uImageRect,
        step.box.left,
        step.box.top,
        step.box.width,
        step.box.height
      )
      gl.uniform1f(uniforms.uImageIn, step.imageIn)
      gl.uniform1f(uniforms.uClarity, step.clarity)
      gl.uniform4f(uniforms.uDrop, dropX, dropY, drop ? drop.radius : 0, drop ? drop.merge : 0)
      gl.uniform3f(uniforms.uDropShape, dropStretch, dropTowardX, dropTowardY)

      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindVertexArray(null)
    }

    // Scrolling back into the scene (or to the droplet) wakes the canvas; the
    // render loop itself decides when it can sleep again.
    const onScroll = () => {
      if (!awake && currentStep().active) wake()
    }
    const onResize = () => {
      syncLayout()
      wake()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    wake()

    return () => {
      disposed = true
      if (hasIdle) window.cancelIdleCallback(idle as number)
      else clearTimeout(idle)
      sleep()
      setReveal(null)
      publishSignature(null)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      if (texture) gl.deleteTexture(texture)
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
