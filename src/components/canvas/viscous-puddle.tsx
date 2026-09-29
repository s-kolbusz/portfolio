'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { usePrefersReducedMotion } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'

import { choreograph, mix, type HeroLayout, type StageLayout } from './viscous-puddle/choreography'
import { measureName } from './viscous-puddle/name-mask'
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
  SIGNATURE_TEXT_SELECTOR,
  SIGNATURE_TRACK_SELECTOR,
} from './viscous-puddle/signature-bus'
import {
  createImageTexture,
  disposePuddleWebGL,
  lerp,
  pageColour,
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
  /** The scene's text blocks (heading, readouts, link). */
  texts: HTMLElement[]
}

/** Time constant (s) of the story's glide after the scroll, on top of Lenis. */
const STORY_SMOOTHING = 0.12

/** Reused to measure the scene text's line boxes each frame. */
const textRange = typeof document !== 'undefined' ? document.createRange() : null!

function smoothstepJs(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
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
  lastBallX: number
  lastBallY: number
  ballVX: number
  ballVY: number
  /** How far the ball has faded back under the scene's text, 0–1. */
  ballSink: number
  /** The smoothed scroll position the story runs on; null until the first frame. */
  timeY: number | null
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
    lastBallX: 0,
    lastBallY: 0,
    ballVX: 0,
    ballVY: 0,
    ballSink: 0,
    timeY: null,
  }
}

function findSignatureElements(): SignatureElements | null {
  const track = document.querySelector<HTMLElement>(SIGNATURE_TRACK_SELECTOR)
  const stage = track?.querySelector<HTMLElement>(SIGNATURE_STAGE_SELECTOR)
  const frame = stage?.querySelector<HTMLElement>(SIGNATURE_FRAME_SELECTOR)
  if (!track || !stage || !frame) return null
  const texts = Array.from(stage.querySelectorAll<HTMLElement>(SIGNATURE_TEXT_SELECTOR))
  return { track, stage, frame, texts }
}

/**
 * The hero at rest: the fly-in zooms the name with a CSS transform, so that
 * is lifted for the instant of measuring the letters.
 */
function measureHero(): HeroLayout | null {
  const track = document.querySelector<HTMLElement>(HERO_TRACK_SELECTOR)
  const stage = track?.querySelector<HTMLElement>(HERO_STAGE_SELECTOR)
  const name = stage?.querySelector<HTMLElement>(HERO_NAME_SELECTOR)
  if (!track || !stage || !name) return null

  const transform = name.style.transform
  name.style.transform = ''
  const stageRect = stage.getBoundingClientRect()
  const chars = Array.from(name.querySelectorAll<HTMLElement>(HERO_CHAR_SELECTOR))
  // The blob rests mid-stage; that is where it first touches the name.
  const contact = { x: stageRect.left + stageRect.width / 2, y: stageRect.height / 2 }
  const measure = measureName(chars, stageRect.top, contact)
  name.style.transform = transform
  if (!measure) return null

  const trackDocTop = track.getBoundingClientRect().top + window.scrollY
  const stickDistance = Math.max(1, track.offsetHeight - stage.offsetHeight)
  // The story ends where the signature pin starts; the stage stays pinned a
  // little past that (see HeroLayout.stickDistance).
  const signature = document.querySelector<HTMLElement>(SIGNATURE_TRACK_SELECTOR)
  const signatureTop = signature ? signature.getBoundingClientRect().top + window.scrollY : null
  return {
    trackDocTop,
    pinDistance:
      signatureTop !== null
        ? Math.max(1, Math.min(stickDistance, signatureTop - trackDocTop))
        : stickDistance,
    stickDistance,
    nameBox: measure.box,
    letterStarts: measure.starts,
    zoomX: measure.zoom.x,
    zoomY: measure.zoom.y,
    zoomStroke: measure.zoom.stroke,
  }
}

function measureStage({ track, stage, frame }: SignatureElements): StageLayout {
  // The scene moves the frame while it plays; measure its place in the layout.
  const transform = frame.style.transform
  frame.style.transform = ''
  const trackRect = track.getBoundingClientRect()
  const stageRect = stage.getBoundingClientRect()
  const frameRect = frame.getBoundingClientRect()
  frame.style.transform = transform
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
 * pinned signature scene the matter filling the frame darkens to the
 * stronypodhale.pl colour and becomes a sheet of water over the whole stage;
 * the page surfaces from it and the water clears until the final frame
 * matches the DOM image pixel for pixel and that image takes over. The sheet
 * leaves with the section on a liquid edge; the cursor ball stays liquid.
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

    const { gl, vao, uniforms, program } = webgl
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
      state.hero = measureHero()
    }

    syncLayout()
    // The letters need the real font; measure them again once fonts are in.
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
      state.targetColour = pageColour(image) ?? state.targetColour
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
        timeY: state.timeY ?? window.scrollY,
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

      // Eased by time, not frames, so a slow device fades in at the same pace.
      const ease = (seconds: number) => 1 - Math.exp(-delta / seconds)
      state.opacity = lerp(state.opacity, 1, ease(0.6))
      state.scale = lerp(state.scale, state.isMobile ? 0.6 : 1, ease(0.15))

      // The story eases after the scroll, like everything Lenis moves: a
      // short glide on start and stop. A long jump (anchor, resize) lands at once.
      const scrollNow = window.scrollY
      if (
        reduced ||
        state.timeY === null ||
        Math.abs(scrollNow - state.timeY) > window.innerHeight * 1.5
      ) {
        state.timeY = scrollNow
      } else {
        state.timeY = lerp(state.timeY, scrollNow, ease(STORY_SMOOTHING))
        if (Math.abs(scrollNow - state.timeY) < 0.1) state.timeY = scrollNow
      }
      const catchingUp = state.timeY !== scrollNow

      const primary = getPrimaryRgb()
      state.colorR = lerp(state.colorR, primary[0], ease(0.3))
      state.colorG = lerp(state.colorG, primary[1], ease(0.3))
      state.colorB = lerp(state.colorB, primary[2], ease(0.3))

      const step = currentStep()
      setReveal(step.reveal)

      // Scroll speed stirs the surface (0–1), then eases off when it stops.
      const scrollY = window.scrollY
      const speed = delta > 0 ? Math.abs(scrollY - state.lastScrollY) / delta : 0
      state.lastScrollY = scrollY
      const targetFlow = reduced ? 0 : Math.min(speed / 2500, 1)
      state.flow = lerp(state.flow, targetFlow, targetFlow > state.flow ? 0.2 : 0.04)

      if (!step.active && !catchingUp) {
        publishSignature({
          step,
          startColour: [state.colorR, state.colorG, state.colorB],
          targetColour: state.targetColour,
          ball: { x: -1e4, y: -1e4, radius: 0 },
        })
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
      // In the water the blob floats: it follows with more drag than in the hero.
      // The same follow as in the hero everywhere (0.27 s, i.e. 0.06 a
      // frame at 60 fps), so it is one and the same ball.
      const ballLerp = ease(followPointer ? 0.27 : mix(0.8, 0.27, ball.detach))
      state.ballRelX = lerp(state.ballRelX, targetX, ballLerp)
      state.ballRelY = lerp(state.ballRelY, targetY, ballLerp)
      const ballX = state.ballRelX + step.box.left
      const ballY = state.ballRelY + step.box.top

      // The ball's velocity in the stage's frame (so scrolling the sheet
      // away is not movement), smoothed: it parts and drags the swell.
      const stageTop = step.box.top - step.boxShift - (state.stage?.box.offsetTop ?? 0)
      if (delta > 0) {
        const vx = (ballX - state.lastBallX) / delta
        const vy = (ballY - stageTop - state.lastBallY) / delta
        state.ballVX = lerp(state.ballVX, vx, ease(0.15))
        state.ballVY = lerp(state.ballVY, vy, ease(0.15))
      }
      state.lastBallX = ballX
      state.lastBallY = ballY - stageTop

      publishSignature({
        step,
        startColour: [state.colorR, state.colorG, state.colorB],
        targetColour: state.targetColour,
        ball: { x: ballX, y: ballY, radius: ball.radius },
      })

      gl.useProgram(program)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.disable(gl.SCISSOR_TEST)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Once the water sheet has left the screen only the ball is left:
      // draw just its neighbourhood.
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
      gl.uniform1f(uniforms.uSurface, step.surface)
      gl.uniform1f(uniforms.uLiquidEdge, step.liquidEdge)
      gl.uniform1f(uniforms.uImageRadius, step.boxRadius)
      gl.uniform2f(uniforms.uBallVelocity, state.ballVX, state.ballVY)
      // Over the scene's text the whole ball fades back into the water, so
      // the text stays legible: judged from the letters' own line boxes,
      // not from the blocks around them.
      let sink = 0
      if (step.liquidEdge > 0) {
        for (const text of state.elements?.texts ?? []) {
          const opacity = parseFloat(text.style.opacity || '1')
          if (!(opacity > 0.01)) continue
          textRange.selectNodeContents(text)
          for (const line of textRange.getClientRects()) {
            if (line.width === 0) continue
            const dx = Math.max(line.left - ballX, 0, ballX - line.right)
            const dy = Math.max(line.top - ballY, 0, ballY - line.bottom)
            const distance = Math.hypot(dx, dy)
            sink = Math.max(
              sink,
              Math.min(1, opacity) * smoothstepJs(ball.radius * 1.05, ball.radius * 0.35, distance)
            )
          }
        }
        // The page screenshot too: the ball slips under it, fading back into
        // the water as it nears the edge instead of being cut off by it.
        if (step.imageIn > 0) {
          const { left, top, width, height } = step.box
          const dx = Math.max(left - ballX, 0, ballX - (left + width))
          const dy = Math.max(top - ballY, 0, ballY - (top + height))
          sink = Math.max(
            sink,
            step.imageIn * smoothstepJs(ball.radius * 1.05, ball.radius * 0.1, Math.hypot(dx, dy))
          )
        }
      }
      state.ballSink = lerp(state.ballSink, sink, ease(0.18))
      gl.uniform1f(uniforms.uBallSink, state.ballSink)
      gl.uniform4f(uniforms.uBall, ballX, ballY, ball.radius, ball.merge)
      gl.uniform1f(uniforms.uDrain, step.drain)

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
