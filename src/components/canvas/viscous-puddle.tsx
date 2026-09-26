'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'

import { choreograph, type HeroLayout, type StageLayout } from './viscous-puddle/choreography'
import { renderNameMask, type NameMask } from './viscous-puddle/name-mask'
import { MAX_DRIPS } from './viscous-puddle/shaders'
import {
  HERO_CHAR_SELECTOR,
  HERO_NAME_SELECTOR,
  HERO_STAGE_SELECTOR,
  HERO_STATIC_ATTR,
  HERO_TRACK_SELECTOR,
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
  createNameTexture,
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

/**
 * The page's text colour as sRGB floats: the ink the name's letters turn
 * into. Resolved through a 2D canvas so any CSS colour syntax (oklch) works.
 */
function readInkRgb(): [number, number, number] {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return [0.1, 0.1, 0.1]
  context.fillStyle = getComputedStyle(document.body).color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

let cachedInkRgb: [number, number, number] | null = null

function getInkRgb(): [number, number, number] {
  if (!cachedInkRgb) {
    cachedInkRgb = readInkRgb()
  }
  return cachedInkRgb
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
    cachedInkRgb = null
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

interface SignatureElements {
  track: HTMLElement
  stage: HTMLElement
  frame: HTMLElement
}

interface PuddleState {
  /** Cursor ball, stored relative to the box so it rides along with scrolling. */
  ballReady: boolean
  ballRelX: number
  ballRelY: number
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
  hero: HeroLayout | null
  lastScrollY: number
  flow: number
}

function createInitialState(): PuddleState {
  return {
    ballReady: false,
    ballRelX: 0,
    ballRelY: 0,
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
    hero: null,
    lastScrollY: 0,
    flow: 0,
  }
}

function findSignatureElements(): SignatureElements | null {
  const track = document.querySelector<HTMLElement>(SIGNATURE_TRACK_SELECTOR)
  const stage = track?.querySelector<HTMLElement>(SIGNATURE_STAGE_SELECTOR)
  const frame = stage?.querySelector<HTMLElement>(SIGNATURE_FRAME_SELECTOR)
  return track && stage && frame ? { track, stage, frame } : null
}

/**
 * The hero at rest: the hero scales and blurs its name while it plays, so
 * that is lifted for the instant of measuring the letters.
 */
function measureHero(pixelRatio: number): { layout: HeroLayout; mask: NameMask } | null {
  const track = document.querySelector<HTMLElement>(HERO_TRACK_SELECTOR)
  const stage = track?.querySelector<HTMLElement>(HERO_STAGE_SELECTOR)
  const name = stage?.querySelector<HTMLElement>(HERO_NAME_SELECTOR)
  if (!track || !stage || !name) return null

  const saved = [name.style.transform, name.style.filter]
  name.style.transform = 'none'
  name.style.filter = 'none'

  const stageTop = stage.getBoundingClientRect().top
  const nameRect = name.getBoundingClientRect()
  const chars = Array.from(name.querySelectorAll<HTMLElement>(HERO_CHAR_SELECTOR))
  const mask = renderNameMask(chars, stageTop, pixelRatio)
  const glyphHeight = Math.max(0, ...chars.map((char) => char.getBoundingClientRect().height))

  name.style.transform = saved[0]
  name.style.filter = saved[1]
  if (!mask) return null

  return {
    mask,
    layout: {
      trackDocTop: track.getBoundingClientRect().top + window.scrollY,
      pinDistance: Math.max(1, track.offsetHeight - stage.offsetHeight),
      nameCenterX: nameRect.left + nameRect.width / 2,
      nameCenterY: nameRect.top + nameRect.height / 2 - stageTop,
      nameBox: { left: mask.left, top: mask.top, width: mask.width, height: mask.height },
      glyphHeight,
      drips: mask.drips.slice(0, MAX_DRIPS),
    },
  }
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
      document.querySelector(HERO_TRACK_SELECTOR)?.setAttribute(HERO_STATIC_ATTR, '')
      return
    }

    const { gl, vao, uniforms } = webgl
    const drips = new Float32Array(MAX_DRIPS * 4)
    const dripNecks = new Float32Array(MAX_DRIPS)
    gl.uniform1i(uniforms.uImage, 0)
    gl.uniform1i(uniforms.uName, 1)
    let nameTexture: WebGLTexture | null = null

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
      const hero = measureHero(state.dpr)
      state.hero = hero?.layout ?? null
      if (nameTexture) gl.deleteTexture(nameTexture)
      nameTexture = hero ? createNameTexture(gl, hero.mask.image) : null
    }

    syncLayout()
    // The name mask needs the real font; draw it again once fonts are in.
    void document.fonts.ready.then(() => {
      if (!disposed) syncLayout()
    })
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
        hero: state.hero,
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

      // The cursor ball moves exactly as in the hero: it chases the pointer,
      // or rests (inside the blob, later beside the image) without one.
      const followPointer =
        state.pointerInside && state.targetMouseX >= 0 && !state.isMobile && !reduced
      const ball = step.ball
      const targetX = (followPointer ? state.targetMouseX : ball.restX) - step.box.left
      const targetY = (followPointer ? state.targetMouseY : ball.restY) - step.box.top
      if (!state.ballReady) {
        state.ballReady = true
        state.ballRelX = targetX
        state.ballRelY = targetY
      }
      const ballLerp = followPointer ? 0.06 : 0.02 + 0.04 * ball.detach
      state.ballRelX = lerp(state.ballRelX, targetX, ballLerp)
      state.ballRelY = lerp(state.ballRelY, targetY, ballLerp)
      const ballX = state.ballRelX + step.box.left
      const ballY = state.ballRelY + step.box.top

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.disable(gl.SCISSOR_TEST)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Once the DOM image has taken over only the ball is left: draw
      // just its neighbourhood.
      if (!step.body) {
        const pad = ball.radius * 1.6
        const x = (ballX - pad) * state.dpr
        const y = (state.canvasHeight - (ballY + pad)) * state.dpr
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
      gl.uniform4f(uniforms.uBall, ballX, ballY, ball.radius, ball.merge)
      const name = step.name
      gl.uniform1f(uniforms.uNameOn, name && nameTexture ? 1 : 0)
      if (name) {
        gl.uniform4f(uniforms.uNameRect, name.left, name.top, name.width, name.height)
        gl.uniform1f(uniforms.uNameSag, name.sag)
        gl.uniform1f(uniforms.uNameSoften, name.soften)
        gl.uniform1f(uniforms.uNameSoftRadius, name.softRadius)
        gl.uniform1f(uniforms.uNameTint, name.tint)
        gl.uniform1f(uniforms.uNameFade, name.fade)
        const dripCount = Math.min(name.drips.length, MAX_DRIPS)
        name.drips.slice(0, dripCount).forEach((drip, index) => {
          drips.set([drip.x, drip.y, drip.length, drip.head], index * 4)
          dripNecks[index] = drip.neck
        })
        gl.uniform4fv(uniforms.uDrips, drips)
        gl.uniform1fv(uniforms.uDripNecks, dripNecks)
        gl.uniform1i(uniforms.uDripCount, dripCount)
      }
      gl.uniform3f(uniforms.uInk, ...getInkRgb())

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
      if (nameTexture) gl.deleteTexture(nameTexture)
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
