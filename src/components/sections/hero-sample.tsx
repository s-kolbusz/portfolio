'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { SAMPLE_FRAGMENT_SRC, SAMPLE_VERTEX_SRC } from '@/components/canvas/hero-samples/shader'
import type { HeroSampleVariant } from '@/components/canvas/hero-samples/variants'
import { usePrefersReducedMotion } from '@/hooks/use-media'

/**
 * Hero story samples, for the owner to choose between (not production):
 * docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 *
 * Shared by all three: the poster layout (matter large and off the frame,
 * the name as a signature bottom-left) and the birth (a full sheet of matter
 * drains into the blob on an irregular edge and leaves the name behind, wet).
 *
 * - materia:  the matter sets into the things the owner makes, one by one.
 * - okno:     real pages lie under the matter; the ball clears the water.
 * - czynniki: the matter comes apart into labelled parts and sets as one.
 */
/** Sample captions. Not in i18n on purpose: they are part of the sample, not approved copy. */
const SHAPE_CAPTIONS = [
  'stronypodhale.pl',
  'aspect-preview · plugin do Payload CMS',
  'Airchos · bramki jakości dla agentów AI',
  'wydruk 3D · na zamówienie',
  'dom · panel energii, Home Assistant',
]
const WINDOW_PAGES = [
  { src: '/images/projects/stronypodhale.avif', caption: 'stronypodhale.pl' },
  { src: '/images/projects/ready2order.avif', caption: 'ready2order' },
  { src: '/images/projects/zakofy.avif', caption: 'zakofy.pl → plugin aspect-preview' },
]
const PART_LABELS = ['projekt', 'kod', 'serwer', 'utrzymanie']
const PARTS_CAPTION = 'gotowa strona · w jednych rękach'

/** Seconds: the sheet stands still, then drains. */
const BIRTH_HOLD = 0.3
const BIRTH_DRAIN = 2.1
/** Seconds a page under the water takes to give way to the next, and how long it stays. */
const PAGE_FADE = 1.3
const PAGE_STAY = 5.2

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** Fast start, long tail: the site's one family of curves. */
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 2.6)

interface Phase {
  name: string
  seconds: number
}

const MATTER_PHASES: Phase[] = [
  { name: 'rest', seconds: 0.9 },
  { name: 'set', seconds: 1.3 },
  { name: 'hold', seconds: 2.4 },
  { name: 'melt', seconds: 1.0 },
]
const PARTS_PHASES: Phase[] = [
  { name: 'rest', seconds: 1.0 },
  { name: 'split', seconds: 1.5 },
  { name: 'work', seconds: 4.4 },
  { name: 'join', seconds: 1.3 },
  { name: 'set', seconds: 1.0 },
  { name: 'hold', seconds: 2.4 },
  { name: 'melt', seconds: 1.0 },
]

function readPrimaryRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim()
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts as [number, number, number]
  }
  return [0.494, 0.773, 0.557]
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Hero sample shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function loadPage(gl: WebGL2RenderingContext, src: string) {
  const page = { texture: null as WebGLTexture | null, aspect: 1 }
  const image = new Image()
  image.decoding = 'async'
  image.onload = () => {
    const texture = gl.createTexture()
    if (!texture) return
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    page.texture = texture
    page.aspect = image.naturalWidth / Math.max(1, image.naturalHeight)
  }
  image.src = src
  return page
}

export function HeroSample({ variant }: { variant: HeroSampleVariant }) {
  const t = useTranslations('hero')
  const name = t('name')
  const prefersReducedMotion = usePrefersReducedMotion()

  const stageRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const wetRef = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const cover = coverRef.current
    const heading = nameRef.current
    const caption = captionRef.current
    if (!stage || !canvas || !cover || !heading || !caption) return

    const chars = Array.from(heading.querySelectorAll<HTMLElement>('[data-char]'))
    const reveals = Array.from(stage.querySelectorAll<HTMLElement>('[data-reveal]'))
    const labels = Array.from(labelsRef.current?.children ?? []) as HTMLElement[]

    const showEverything = () => {
      cover.style.display = 'none'
      heading.style.filter = ''
      for (const char of chars) {
        char.style.opacity = ''
        char.style.color = ''
      }
      for (const element of reveals) element.style.opacity = ''
    }

    if (prefersReducedMotion) {
      showEverything()
      return
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
    })
    const vertex = gl && compile(gl, gl.VERTEX_SHADER, SAMPLE_VERTEX_SRC)
    const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, SAMPLE_FRAGMENT_SRC)
    const program = gl?.createProgram()
    if (!gl || !vertex || !fragment || !program) {
      showEverything()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Hero sample program:', gl.getProgramInfoLog(program))
      showEverything()
      return
    }
    gl.useProgram(program)

    const vao = gl.createVertexArray()
    const vbo = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniform = (uniformName: string) => gl.getUniformLocation(program, uniformName)
    const u = {
      time: uniform('uTime'),
      viewport: uniform('uViewport'),
      dpr: uniform('uDpr'),
      color: uniform('uColor'),
      drops: uniform('uDrops'),
      dropMerge: uniform('uDropMerge'),
      cover: uniform('uCover'),
      set: uniform('uSet'),
      wobble: uniform('uWobble'),
      shape: uniform('uShape'),
      shapeBox: uniform('uShapeBox'),
      ball: uniform('uBall'),
      window: uniform('uWindow'),
      imageA: uniform('uImageA'),
      imageB: uniform('uImageB'),
      imageMix: uniform('uImageMix'),
      imageAspect: uniform('uImageAspect'),
      imageBox: uniform('uImageBox'),
    }
    gl.uniform1i(u.imageA, 0)
    gl.uniform1i(u.imageB, 1)

    const pages = variant === 'okno' ? WINDOW_PAGES.map((page) => loadPage(gl, page.src)) : []

    // --- Layout (CSS px, relative to the stage) ---
    const layout = {
      width: 1,
      height: 1,
      dpr: 1,
      unit: 1,
      mobile: true,
      blobX: 0,
      blobY: 0,
      blobR: 1,
      shapeX: 0,
      shapeY: 0,
      shapeS: 1,
      coverMax: 1,
      charPoints: [] as Array<{ x: number; y: number }>,
      revealPoints: [] as Array<{ x: number; y: number }>,
    }
    const measure = () => {
      const rect = stage.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const mobile = width < 768
      layout.width = width
      layout.height = height
      layout.mobile = mobile
      layout.unit = height / 2
      layout.dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.round(width * layout.dpr)
      canvas.height = Math.round(height * layout.dpr)

      // The window needs the blob mostly in the frame; otherwise it leans out of it.
      if (variant === 'okno') {
        layout.blobX = width * (mobile ? 0.56 : 0.68)
        layout.blobY = height * (mobile ? 0.31 : 0.45)
        layout.blobR = mobile ? Math.min(height * 0.27, width * 0.6) : height * 0.37
      } else {
        layout.blobX = width * (mobile ? 0.78 : 0.72)
        layout.blobY = height * (mobile ? 0.27 : 0.42)
        layout.blobR = height * (mobile ? 0.3 : 0.36)
      }
      layout.shapeX = width * (mobile ? 0.5 : 0.69)
      layout.shapeY = height * (mobile ? 0.33 : 0.44)
      layout.shapeS = mobile
        ? Math.min(width * 0.41, height * 0.26)
        : Math.min(width * 0.2, height * 0.36)

      const corners = [
        [0, 0],
        [width, 0],
        [0, height],
        [width, height],
      ]
      const farthest = Math.max(
        ...corners.map(([x, y]) => Math.hypot(x - layout.blobX, y - layout.blobY))
      )
      // Past the corners by more than the edge's tongues reach.
      layout.coverMax = Math.max(0, farthest - layout.blobR) + layout.unit * 0.6

      const centre = (element: HTMLElement) => {
        const box = element.getBoundingClientRect()
        return { x: box.left - rect.left + box.width / 2, y: box.top - rect.top + box.height / 2 }
      }
      layout.charPoints = chars.map(centre)
      layout.revealPoints = reveals.map(centre)
    }

    // --- Take over from the server-rendered cover ---
    const [red, green, blue] = readPrimaryRgb()
    const matter = `rgb(${Math.round(red * 255)} ${Math.round(green * 255)} ${Math.round(blue * 255)})`
    const revealed = chars.map(() => false)
    const shown = reveals.map(() => false)
    for (const char of chars) {
      char.style.opacity = '0'
      char.style.color = matter
    }
    for (const element of reveals) element.style.opacity = '0'
    heading.style.filter = 'url(#hero-sample-wet)'

    measure()
    void document.fonts.ready.then(measure)
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage)

    // --- Pointer ---
    const pointer = { x: 0, y: 0, follow: false, releaseAt: 0 }
    const toStage = (clientX: number, clientY: number) => {
      const rect = stage.getBoundingClientRect()
      pointer.x = clientX - rect.left
      pointer.y = clientY - rect.top
    }
    const onMouseMove = (event: MouseEvent) => {
      toStage(event.clientX, event.clientY)
      pointer.follow = true
      pointer.releaseAt = Infinity
    }
    const onMouseLeave = () => {
      pointer.releaseAt = 0
    }
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      toStage(touch.clientX, touch.clientY)
      pointer.follow = true
      pointer.releaseAt = Infinity
    }
    const onTouchEnd = () => {
      pointer.releaseAt = performance.now() + 900
    }
    let tapped = false
    const onClick = () => {
      tapped = true
    }
    stage.addEventListener('mousemove', onMouseMove, { passive: true })
    stage.addEventListener('mouseleave', onMouseLeave)
    stage.addEventListener('touchstart', onTouch, { passive: true })
    stage.addEventListener('touchmove', onTouch, { passive: true })
    stage.addEventListener('touchend', onTouchEnd)
    stage.addEventListener('click', onClick)

    // --- Story state ---
    const phases = variant === 'czynniki' ? PARTS_PHASES : MATTER_PHASES
    const story = { phase: 0, time: 0, shape: 0, page: 0, pageTime: PAGE_FADE }
    const ball = { x: 0, y: 0, ready: false, size: variant === 'okno' ? 1 : 0 }
    const drops = new Float32Array(20)
    let captionText = ''
    let frame = 0
    let last = performance.now()
    let clock = 0
    let coverGone = false
    let onScreen = true
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
    })
    intersection.observe(stage)

    const setCaption = (text: string, x: number, y: number, opacity: number) => {
      if (text !== captionText) {
        captionText = text
        caption.textContent = text
      }
      caption.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      caption.style.opacity = opacity.toFixed(3)
    }

    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!onScreen) return
      clock += delta
      const ease = (seconds: number) => 1 - Math.exp(-delta / seconds)
      const { width, height, unit, mobile, blobX, blobY, blobR, shapeX, shapeY, shapeS } = layout

      // Birth: the sheet drains into the blob.
      const drain = easeOut((clock - BIRTH_HOLD) / BIRTH_DRAIN)
      const coverPx = layout.coverMax * (1 - drain)
      const born = clock > BIRTH_HOLD + BIRTH_DRAIN * 0.55

      if (!coverGone) {
        chars.forEach((char, index) => {
          if (revealed[index]) return
          const point = layout.charPoints[index]
          if (!point) return
          if (Math.hypot(point.x - blobX, point.y - blobY) - blobR - coverPx > 0) {
            revealed[index] = true
            // Left behind wet: the matter's green, drying to ink.
            char.style.transition = 'color 1.2s cubic-bezier(0.35, 0, 0, 1) 0.2s'
            char.style.opacity = '1'
            char.style.color = ''
          }
        })
        reveals.forEach((element, index) => {
          if (shown[index]) return
          const point = layout.revealPoints[index]
          if (!point) return
          if (Math.hypot(point.x - blobX, point.y - blobY) - blobR - coverPx > unit * 0.1) {
            shown[index] = true
            element.style.transition = 'opacity 0.9s cubic-bezier(0.35, 0, 0, 1) 0.15s'
            element.style.opacity = ''
          }
        })
        // The letters' outlines are still liquid for a moment, then set.
        const wet = 1 - easeOut((clock - BIRTH_HOLD - 0.25) / (BIRTH_DRAIN + 0.5))
        wetRef.current?.setAttribute('scale', (wet * (mobile ? 26 : 42)).toFixed(2))
        if (wet <= 0.001 && revealed.every(Boolean)) {
          coverGone = true
          heading.style.filter = ''
        }
      }

      // Story: runs once the matter has gathered.
      let set = 0
      let wobble = 0
      let merge = unit * 0.35
      let windowOn = 0
      drops.fill(0)

      if (born) {
        story.time += delta
        let phase = phases[story.phase] ?? phases[0]!
        const skippable = phase.name === 'hold' || phase.name === 'work'
        if (story.time >= phase.seconds || (tapped && skippable)) {
          story.time = 0
          story.phase = (story.phase + 1) % phases.length
          if (story.phase === 0) story.shape = (story.shape + 1) % SHAPE_CAPTIONS.length
          phase = phases[story.phase] ?? phases[0]!
        }
        const progress = clamp01(story.time / phase.seconds)

        if (variant === 'materia') {
          if (phase.name === 'set') set = easeInOut(progress)
          else if (phase.name === 'hold') set = 1
          else if (phase.name === 'melt') set = 1 - easeInOut(progress)
          if (phase.name === 'set' || phase.name === 'melt') wobble = Math.sin(Math.PI * progress)
          drops[0] = mix(blobX, shapeX, set)
          drops[1] = mix(blobY, shapeY, set)
          drops[2] = mix(blobR, shapeS * 0.8, set)
          setCaption(
            SHAPE_CAPTIONS[story.shape] ?? '',
            shapeX - shapeS,
            shapeY + shapeS * 0.72 + 14,
            smoothstep(0.8, 1, set)
          )
        } else if (variant === 'okno') {
          windowOn = 1
          drops[0] = blobX
          drops[1] = blobY
          drops[2] = blobR
          story.pageTime += delta
          if ((tapped || story.pageTime > PAGE_STAY) && story.pageTime >= PAGE_FADE)
            story.pageTime = 0
          const fading = story.pageTime < PAGE_FADE
          const half = fading && story.pageTime > PAGE_FADE / 2 ? 1 : 0
          setCaption(
            WINDOW_PAGES[(story.page + half) % WINDOW_PAGES.length]?.caption ?? '',
            mobile ? 24 : blobX - blobR,
            mobile ? Math.max(18, blobY - blobR - unit * 0.05) : blobY + blobR + unit * 0.09,
            fading ? 1 - Math.sin(Math.PI * clamp01(story.pageTime / PAGE_FADE)) : 1
          )
        } else {
          // Parts: four drops leave the blob, meet in pairs, and come back as one.
          const spreadX = mobile ? width * 0.27 : width * 0.13
          const spreadY = mobile ? height * 0.15 : height * 0.2
          const corners = [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ] as const
          let apart = 0
          let home = 0
          if (phase.name === 'split') apart = easeInOut(progress)
          else if (phase.name === 'work') apart = 1
          else if (phase.name === 'join') {
            apart = 1
            home = easeInOut(progress)
          } else if (phase.name === 'set') set = easeInOut(progress)
          else if (phase.name === 'hold') set = 1
          else if (phase.name === 'melt') set = 1 - easeInOut(progress)
          if (phase.name === 'split' || phase.name === 'join' || phase.name === 'set')
            wobble = Math.sin(Math.PI * progress) * 0.8
          if (phase.name === 'melt') wobble = Math.sin(Math.PI * progress) * 0.8

          const gathered =
            phase.name === 'join' || phase.name === 'set' || phase.name === 'hold' ? 1 : 0
          // Back to the poster position while it rests.
          const returning =
            phase.name === 'melt' ? 1 - easeInOut(progress) : phase.name === 'rest' ? 0 : gathered
          const fromX = phase.name === 'split' ? blobX : mix(blobX, shapeX, returning)
          const fromY = phase.name === 'split' ? blobY : mix(blobY, shapeY, returning)
          const work = phase.name === 'work' ? progress : phase.name === 'join' ? 1 : 0
          // Each pair leans together once: top, right, bottom, left.
          const meet = (from: number) =>
            Math.pow(Math.sin(Math.PI * clamp01((work - from) / 0.24)), 2)
          const pull = [meet(0.04), meet(0.27), meet(0.5), meet(0.73)]
          const dropR = blobR * 0.27
          merge = unit * mix(0.35, 0.1, apart * (1 - home))

          corners.forEach(([sx, sy], index) => {
            const horizontal = sy < 0 ? pull[0]! : pull[2]!
            const vertical = sx > 0 ? pull[1]! : pull[3]!
            const sway = Math.sin(clock * 0.7 + index * 1.7) * unit * 0.025
            const x = shapeX + sx * spreadX * (1 - 0.6 * horizontal) + sway
            const y = shapeY + sy * spreadY * (1 - 0.6 * vertical) - sway
            const dx = mix(mix(fromX, x, apart), shapeX, home)
            const dy = mix(mix(fromY, y, apart), shapeY, home)
            drops[index * 4] = dx
            drops[index * 4 + 1] = dy
            drops[index * 4 + 2] = dropR * smoothstep(0, 0.35, apart) * (1 - home * 0.4)
            const label = labels[index]
            if (label) {
              label.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) translate(-50%, -50%)`
              label.style.opacity = (
                smoothstep(0.6, 1, apart) *
                (1 - smoothstep(0, 0.5, home))
              ).toFixed(3)
            }
          })
          // The body itself: all of it at rest, none while apart, back as it joins.
          const whole = phase.name === 'join' ? home : gathered || apart === 0 ? 1 : 1 - apart
          drops[16] = fromX
          drops[17] = fromY
          drops[18] = mix(blobR, shapeS * 0.8, returning) * whole
          setCaption(
            PARTS_CAPTION,
            shapeX - shapeS,
            shapeY + shapeS * 0.72 + 14,
            smoothstep(0.8, 1, set)
          )
        }
        tapped = false
      } else {
        tapped = false
        drops[0] = blobX
        drops[1] = blobY
        drops[2] = blobR
        if (variant === 'okno') windowOn = 1
      }

      // Pages under the water take turns.
      let imageMix = 0
      if (variant === 'okno' && born && story.pageTime < PAGE_FADE) {
        imageMix = easeInOut(clamp01(story.pageTime / PAGE_FADE))
        if (story.pageTime + delta >= PAGE_FADE) {
          story.page = (story.page + 1) % WINDOW_PAGES.length
          story.pageTime = PAGE_FADE
          imageMix = 0
        }
      }

      // The ball: follows the pointer or finger; alone, it rests in the matter
      // (in the window sample it wanders, so the water clears by itself).
      if (pointer.follow && performance.now() > pointer.releaseAt) pointer.follow = false
      const bodyX = drops[0] || drops[16] || blobX
      const bodyY = drops[1] || drops[17] || blobY
      let restX = bodyX
      let restY = bodyY
      if (variant === 'okno') {
        restX = blobX + Math.cos(clock * 0.45) * blobR * 0.42
        restY = blobY + Math.sin(clock * 0.62) * blobR * 0.4
      }
      const targetX = pointer.follow ? pointer.x : restX
      const targetY = pointer.follow ? pointer.y : restY
      if (!ball.ready) {
        ball.ready = true
        ball.x = targetX
        ball.y = targetY
      }
      const follow = ease(pointer.follow ? 0.2 : 0.7)
      ball.x = mix(ball.x, targetX, follow)
      ball.y = mix(ball.y, targetY, follow)
      const scale = mobile ? 0.6 : 1
      // Without a pointer it is part of the body (in the window it is the clear patch).
      ball.size = mix(ball.size, pointer.follow || variant === 'okno' ? 1 : 0, ease(0.25))
      const ballR = 0.25 * scale * unit * (variant === 'okno' ? 1.25 : 1) * ball.size

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(u.time, clock)
      gl.uniform2f(u.viewport, width, height)
      gl.uniform1f(u.dpr, layout.dpr)
      gl.uniform3f(u.color, red, green, blue)
      gl.uniform4fv(u.drops, drops)
      gl.uniform1f(u.dropMerge, merge)
      gl.uniform1f(u.cover, coverPx)
      gl.uniform1f(u.set, set)
      gl.uniform1f(u.wobble, wobble)
      gl.uniform1i(u.shape, variant === 'czynniki' ? 0 : story.shape)
      gl.uniform3f(u.shapeBox, shapeX, shapeY, shapeS)
      gl.uniform4f(u.ball, ball.x, ball.y, ballR, 0.6 * scale * unit)
      const pageA = pages[story.page]
      const pageB = pages[(story.page + 1) % Math.max(1, pages.length)]
      const pagesReady = Boolean(pageA?.texture && pageB?.texture)
      gl.uniform1f(u.window, pagesReady ? windowOn : 0)
      if (pagesReady && pageA && pageB) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, pageA.texture)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, pageB.texture)
        gl.uniform2f(u.imageAspect, pageA.aspect, pageB.aspect)
      }
      gl.uniform1f(u.imageMix, imageMix)
      gl.uniform3f(u.imageBox, blobX, blobY, blobR)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // The first frame is the full sheet: the canvas now stands in for the cover.
      if (cover.style.display !== 'none') cover.style.display = 'none'
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      stage.removeEventListener('mousemove', onMouseMove)
      stage.removeEventListener('mouseleave', onMouseLeave)
      stage.removeEventListener('touchstart', onTouch)
      stage.removeEventListener('touchmove', onTouch)
      stage.removeEventListener('touchend', onTouchEnd)
      stage.removeEventListener('click', onClick)
      for (const page of pages) if (page.texture) gl.deleteTexture(page.texture)
      gl.deleteBuffer(vbo)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      showEverything()
    }
  }, [variant, prefersReducedMotion])

  const splitName = useMemo(
    () =>
      name.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="block whitespace-nowrap">
          {word.split('').map((char, charIndex) => (
            <span key={charIndex} data-char className="inline-block">
              {char}
            </span>
          ))}
        </span>
      )),
    [name]
  )

  return (
    <section
      ref={stageRef}
      data-hero-sample={variant}
      className="text-foreground relative h-svh w-full touch-pan-y overflow-hidden select-none"
    >
      <noscript>
        <style>{`[data-hero-sample-cover] { display: none; }`}</style>
      </noscript>
      <svg aria-hidden="true" className="absolute size-0">
        <filter id="hero-sample-wet" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.019" numOctaves="2" seed="7" />
          <feDisplacementMap
            ref={wetRef}
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      />

      <p
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 font-mono text-[11px] tracking-widest uppercase opacity-0"
      />
      {variant === 'czynniki' && (
        <div
          ref={labelsRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        >
          {PART_LABELS.map((label) => (
            <span
              key={label}
              className="absolute top-0 left-0 font-mono text-[11px] tracking-widest uppercase opacity-0"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-6 pb-28 md:px-12 md:pb-24">
        <h1
          ref={nameRef}
          aria-label={name}
          className="font-serif text-[18.5vw] leading-[0.86] font-semibold tracking-tight md:text-[9.5vw]"
        >
          <span aria-hidden="true">{splitName}</span>
        </h1>
        <div className="mt-6 flex items-end justify-between gap-6 md:mt-8">
          <p data-reveal className="font-mono text-xs tracking-widest uppercase">
            {t('role')}
          </p>
          <p
            data-reveal
            className="text-muted-foreground max-w-[13rem] text-right text-xs leading-snug md:max-w-xs md:text-sm"
          >
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Server-rendered sheet: the page starts as matter, before any script runs. */}
      <div
        ref={coverRef}
        data-hero-sample-cover
        aria-hidden="true"
        className="absolute inset-0 z-20 motion-reduce:hidden"
        style={{ background: 'color(srgb var(--primary-rgb))' }}
      />
    </section>
  )
}
