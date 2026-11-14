'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  ASSEMBLY_FRAGMENT_SRC,
  ASSEMBLY_ITEMS,
} from '@/components/canvas/hero-samples/assembly-shader'
import { SAMPLE_VERTEX_SRC } from '@/components/canvas/hero-samples/shader'
import { usePrefersReducedMotion } from '@/hooks/use-media'

/**
 * Hero sample, second round (not production): the two stories the owner
 * picked, combined. The matter comes apart into drops and each drop sets into
 * one part of a thing he makes, laid out like an exploded drawing; then the
 * parts melt, the matter gathers somewhere else and takes the next thing apart.
 * docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 */

const BOX = 0
const FRAME = 1
const HEX = 2
const SPOOL = 3

const PLAIN = 0
const TEXT = 1
const LAYERS = 2
const BARS = 3
const PHOTO = 4
const CELLS = 5
const BORE = 6
const DOTS = 7

interface Part {
  label: string
  /** Centre and half-size, in units of the assembly's half-size. */
  x: number
  y: number
  w: number
  h: number
  /** Corner radius as a share of the shorter half-side. */
  round: number
  /** Degrees. */
  turn?: number
  type?: number
  pattern?: number
}

interface Thing {
  caption: string
  parts: Part[]
}

/** Sample content. Not in i18n on purpose: part of the sample, not approved copy. */
const THINGS: Thing[] = [
  {
    caption: 'stronypodhale.pl',
    parts: [
      { label: 'nagłówek', x: 0, y: -0.82, w: 0.94, h: 0.095, round: 1, pattern: DOTS },
      {
        label: 'zdjęcie',
        x: -0.3,
        y: -0.2,
        w: 0.64,
        h: 0.4,
        round: 0.12,
        pattern: PHOTO,
        turn: -2,
      },
      { label: 'treść', x: 0.68, y: -0.12, w: 0.26, h: 0.46, round: 0.2, pattern: TEXT, turn: 3 },
      { label: 'kontakt', x: -0.5, y: 0.52, w: 0.42, h: 0.13, round: 1 },
      { label: 'serwer', x: 0.42, y: 0.7, w: 0.5, h: 0.2, round: 0.2, pattern: LAYERS, turn: -3 },
    ],
  },
  {
    caption: 'aspect-preview · plugin do Payload CMS',
    parts: [
      {
        label: 'zdjęcie',
        x: -0.36,
        y: -0.32,
        w: 0.58,
        h: 0.42,
        round: 0.1,
        pattern: PHOTO,
        turn: 2,
      },
      { label: 'kadr 4:5', x: 0.6, y: -0.38, w: 0.3, h: 0.375, round: 0.06, type: FRAME, turn: -4 },
      { label: 'proporcje', x: 0.48, y: 0.5, w: 0.44, h: 0.22, round: 0.3, pattern: TEXT },
      { label: 'Payload CMS', x: -0.42, y: 0.62, w: 0.5, h: 0.1, round: 1, pattern: DOTS, turn: 3 },
    ],
  },
  {
    caption: 'wydruk 3D · na zamówienie',
    parts: [
      { label: 'filament', x: -0.6, y: -0.56, w: 0.32, h: 0.32, round: 1, type: SPOOL },
      { label: 'głowica', x: 0.3, y: -0.62, w: 0.2, h: 0.24, round: 0.3, pattern: BORE, turn: 4 },
      { label: 'wydruk', x: 0.2, y: 0.08, w: 0.42, h: 0.38, round: 0, type: HEX, pattern: LAYERS },
      { label: 'stół', x: 0.02, y: 0.76, w: 0.86, h: 0.07, round: 1, turn: -2 },
    ],
  },
  {
    caption: 'dom · energia, Home Assistant',
    parts: [
      {
        label: 'panele',
        x: -0.36,
        y: -0.5,
        w: 0.58,
        h: 0.3,
        round: 0.08,
        pattern: CELLS,
        turn: -8,
      },
      {
        label: 'falownik',
        x: 0.62,
        y: -0.3,
        w: 0.27,
        h: 0.38,
        round: 0.15,
        pattern: BARS,
        turn: 3,
      },
      { label: 'pompa ciepła', x: -0.5, y: 0.42, w: 0.38, h: 0.34, round: 0.15, pattern: BORE },
      {
        label: 'Home Assistant',
        x: 0.4,
        y: 0.56,
        w: 0.46,
        h: 0.25,
        round: 0.15,
        pattern: TEXT,
        turn: -3,
      },
    ],
  },
  {
    caption: 'Airchos · bramki jakości dla agentów AI',
    parts: [
      {
        label: 'reguły',
        x: -0.56,
        y: -0.5,
        w: 0.36,
        h: 0.32,
        round: 0.12,
        pattern: TEXT,
        turn: -4,
      },
      { label: 'kod', x: 0.36, y: -0.46, w: 0.54, h: 0.36, round: 0.1, pattern: TEXT, turn: 2 },
      { label: 'bramka', x: -0.4, y: 0.42, w: 0.3, h: 0.3, round: 0, type: HEX, pattern: BORE },
      { label: 'wynik', x: 0.42, y: 0.5, w: 0.46, h: 0.13, round: 1, pattern: DOTS, turn: 3 },
    ],
  },
]

const MAX_PARTS = ASSEMBLY_ITEMS - 1

/** Seconds. */
const BIRTH_HOLD = 0.3
const BIRTH_DRAIN = 2.1
const PHASES = [
  { name: 'move', seconds: 1.5 },
  { name: 'split', seconds: 1.5 },
  { name: 'set', seconds: 1.6 },
  { name: 'hold', seconds: 3.2 },
  { name: 'melt', seconds: 1.2 },
  { name: 'join', seconds: 1.4 },
] as const

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 2.6)

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
    console.warn('Hero assembly shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/** What changes from one thing to the next, so no two assemblies sit alike. */
interface Take {
  x: number
  y: number
  turn: number
  spread: number
  /** Per part: place in the order (0–1), sideways swing of its path, own turn. */
  order: number[]
  swing: number[]
  lean: number[]
}

export function HeroAssembly() {
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
        char.style.transform = ''
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
    const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, ASSEMBLY_FRAGMENT_SRC)
    const program = gl?.createProgram()
    if (!gl || !vertex || !fragment || !program) {
      showEverything()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Hero assembly program:', gl.getProgramInfoLog(program))
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
      itemA: uniform('uItemA'),
      itemB: uniform('uItemB'),
      itemC: uniform('uItemC'),
      merge: uniform('uMerge'),
      cover: uniform('uCover'),
      wobble: uniform('uWobble'),
      ball: uniform('uBall'),
    }

    // --- Layout (CSS px, relative to the stage) ---
    const layout = {
      width: 1,
      height: 1,
      dpr: 1,
      unit: 1,
      mobile: true,
      /** Where the matter gathers on load: large and leaning out of the frame. */
      restX: 0,
      restY: 0,
      restR: 1,
      /** Half-size of an assembly. */
      size: 1,
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
      layout.restX = width * (mobile ? 0.78 : 0.72)
      layout.restY = height * (mobile ? 0.27 : 0.42)
      layout.restR = height * (mobile ? 0.3 : 0.36)
      layout.size = mobile
        ? Math.min(width * 0.4, height * 0.19)
        : Math.min(width * 0.17, height * 0.3)
      const corners = [
        [0, 0],
        [width, 0],
        [0, height],
        [width, height],
      ]
      const farthest = Math.max(
        ...corners.map(([x, y]) => Math.hypot(x - layout.restX, y - layout.restY))
      )
      layout.coverMax = Math.max(0, farthest - layout.restR) + layout.unit * 0.6
      const centre = (element: HTMLElement) => {
        const box = element.getBoundingClientRect()
        return { x: box.left - rect.left + box.width / 2, y: box.top - rect.top + box.height / 2 }
      }
      const moved = chars.map((char) => char.style.transform)
      chars.forEach((char) => (char.style.transform = ''))
      layout.charPoints = chars.map(centre)
      chars.forEach((char, index) => (char.style.transform = moved[index] ?? ''))
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
    heading.style.filter = 'url(#hero-assembly-wet)'

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
    const random = (from: number, to: number) => from + Math.random() * (to - from)
    const newTake = (count: number): Take => {
      const { width, height, mobile } = layout
      const order = Array.from({ length: count }, (_, index) => index)
      for (let index = order.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1))
        ;[order[index], order[other]] = [order[other]!, order[index]!]
      }
      return {
        x: width * (mobile ? random(0.46, 0.54) : random(0.56, 0.78)),
        y: height * (mobile ? random(0.27, 0.36) : random(0.36, 0.52)),
        turn: (random(-5, 5) * Math.PI) / 180,
        spread: random(1, 1.12),
        order: order.map((place) => place / Math.max(1, count - 1)),
        swing: order.map(() => random(-1, 1)),
        lean: order.map(() => (random(-2.5, 2.5) * Math.PI) / 180),
      }
    }
    const story = { phase: 0, time: 0, thing: 0 }
    let take = newTake(THINGS[0]!.parts.length)
    // The body starts where the sheet drained to and travels from there.
    const body = { x: layout.restX, y: layout.restY, fromX: layout.restX, fromY: layout.restY }
    const ball = { x: layout.restX, y: layout.restY, angle: Math.random() * 6.28 }
    const pushes = Array.from({ length: MAX_PARTS }, () => ({ x: 0, y: 0 }))
    const itemA = new Float32Array(ASSEMBLY_ITEMS * 4)
    const itemB = new Float32Array(ASSEMBLY_ITEMS * 4)
    const itemC = new Float32Array(ASSEMBLY_ITEMS * 4)
    /** The name answers a change of state: seconds since the last one, and its direction. */
    const pulse = { age: 10, sign: 1 }
    let captionText = ''
    let labelThing = -1
    let frame = 0
    let last = performance.now()
    let clock = 0
    let coverGone = false
    let onScreen = true
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
    })
    intersection.observe(stage)

    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!onScreen) return
      clock += delta
      const ease = (seconds: number) => 1 - Math.exp(-delta / seconds)
      const { width, height, unit, mobile, restX, restY, restR, size } = layout

      // Birth: the sheet drains into the blob.
      const drain = easeOut((clock - BIRTH_HOLD) / BIRTH_DRAIN)
      const coverPx = layout.coverMax * (1 - drain)
      const born = clock > BIRTH_HOLD + BIRTH_DRAIN * 0.7

      if (!coverGone) {
        chars.forEach((char, index) => {
          if (revealed[index]) return
          const point = layout.charPoints[index]
          if (!point) return
          if (Math.hypot(point.x - restX, point.y - restY) - restR - coverPx > 0) {
            revealed[index] = true
            char.style.transition = 'color 1.2s cubic-bezier(0.35, 0, 0, 1) 0.2s'
            char.style.opacity = '1'
            char.style.color = ''
          }
        })
        reveals.forEach((element, index) => {
          if (shown[index]) return
          const point = layout.revealPoints[index]
          if (!point) return
          if (Math.hypot(point.x - restX, point.y - restY) - restR - coverPx > unit * 0.1) {
            shown[index] = true
            element.style.transition = 'opacity 0.9s cubic-bezier(0.35, 0, 0, 1) 0.15s'
            element.style.opacity = ''
          }
        })
        if (drain >= 1 && revealed.every(Boolean)) coverGone = true
      }

      // --- Story ---
      let phase = PHASES[story.phase] ?? PHASES[0]
      if (born) {
        story.time += delta
        if (story.time >= phase.seconds || (tapped && phase.name === 'hold')) {
          story.time = 0
          story.phase = (story.phase + 1) % PHASES.length
          phase = PHASES[story.phase] ?? PHASES[0]
          if (phase.name === 'move') {
            story.thing = (story.thing + 1) % THINGS.length
            take = newTake((THINGS[story.thing] ?? THINGS[0]!).parts.length)
            body.fromX = body.x
            body.fromY = body.y
          }
          // The name answers when the matter sets and when it lets go.
          if (phase.name === 'set' || phase.name === 'melt') {
            pulse.age = 0
            pulse.sign = phase.name === 'set' ? 1 : -1
          }
        }
      }
      tapped = false
      const thing = THINGS[story.thing] ?? THINGS[0]!
      const count = thing.parts.length
      const progress = clamp01(story.time / phase.seconds)

      // The body travels to where the next thing will be taken apart, on a
      // slow wandering line, never dead still.
      const travel = phase.name === 'move' ? easeInOut(progress) : 1
      const wanderX =
        Math.sin(clock * 0.31) * unit * 0.035 + Math.sin(clock * 0.13 + 2) * unit * 0.02
      const wanderY = Math.cos(clock * 0.27 + 1) * unit * 0.03
      const anchorX = born ? mix(body.fromX, take.x, travel) : restX
      const anchorY = born ? mix(body.fromY, take.y, travel) : restY
      // It leans a little towards the small blob.
      body.x = anchorX + wanderX * (phase.name === 'hold' ? 0.2 : 1) + (ball.x - anchorX) * 0.045
      body.y = anchorY + wanderY * (phase.name === 'hold' ? 0.2 : 1) + (ball.y - anchorY) * 0.045

      // Per part: how far it has left the body, how set it is.
      itemA.fill(0)
      itemB.fill(0)
      itemC.fill(0)
      let away = 0
      let setAll = 1
      const partsOnScreen: Array<{ x: number; y: number; w: number; h: number; set: number }> = []
      const centreX = born ? take.x : restX
      const centreY = born ? take.y : restY
      const cosT = Math.cos(take.turn)
      const sinT = Math.sin(take.turn)

      thing.parts.forEach((part, index) => {
        const place = take.order[index] ?? 0
        let apart = 0
        let set = 0
        if (phase.name === 'split') apart = easeInOut(clamp01((story.time - place * 0.45) / 1.05))
        else if (phase.name === 'set') {
          apart = 1
          set = easeInOut(clamp01((story.time - place * 0.7) / 0.9))
        } else if (phase.name === 'hold') {
          apart = 1
          set = 1
        } else if (phase.name === 'melt') {
          apart = 1
          set = 1 - easeInOut(clamp01((story.time - (1 - place) * 0.45) / 0.75))
        } else if (phase.name === 'join')
          apart = 1 - easeInOut(clamp01((story.time - place * 0.4) / 1.0))
        if (!born) apart = 0
        away += apart / count
        setAll = Math.min(setAll, set)

        // Its place in the exploded drawing, turned and spread for this take.
        const px = part.x * size * take.spread
        const py = part.y * size * take.spread
        const homeX = centreX + px * cosT - py * sinT
        const homeY = centreY + px * sinT + py * cosT
        // It leaves on a curve of its own, and drifts while still liquid.
        const swing = Math.sin(Math.PI * apart) * (take.swing[index] ?? 0) * size * 0.32
        const dirX = homeX - body.x
        const dirY = homeY - body.y
        const length = Math.hypot(dirX, dirY) || 1
        const loose = 1 - set
        const driftX = Math.sin(clock * 0.9 + index * 2.1) * unit * 0.018 * loose * apart
        const driftY = Math.cos(clock * 0.75 + index * 1.3) * unit * 0.018 * loose * apart
        let x = mix(body.x, homeX, apart) + (-dirY / length) * swing + driftX
        let y = mix(body.y, homeY, apart) + (dirX / length) * swing + driftY

        // The small blob nudges what it comes near: set parts give way a
        // little and settle back.
        const push = pushes[index]!
        const awayX = x - ball.x
        const awayY = y - ball.y
        const gap = Math.hypot(awayX, awayY) || 1
        const reach = ballRadius(unit, mobile) * 2.6
        const force = Math.pow(clamp01(1 - gap / reach), 2) * size * 0.16 * apart
        push.x = mix(push.x, (awayX / gap) * force, ease(0.18))
        push.y = mix(push.y, (awayY / gap) * force, ease(0.18))
        x += push.x
        y += push.y

        const w = part.w * size
        const h = part.h * size
        const slot = (index + 1) * 4
        itemA[slot] = x
        itemA[slot + 1] = y
        itemA[slot + 2] = w
        itemA[slot + 3] = h
        itemB[slot] = part.round * Math.min(w, h)
        itemB[slot + 1] = take.turn + ((part.turn ?? 0) * Math.PI) / 180 + (take.lean[index] ?? 0)
        itemB[slot + 2] = set
        // As a drop it holds about the matter its part will need.
        itemB[slot + 3] = Math.sqrt(w * h) * 0.92 * smoothstep(0, 0.45, apart)
        itemC[slot] = part.type ?? BOX
        itemC[slot + 1] = part.pattern ?? PLAIN
        partsOnScreen.push({ x, y, w, h, set })
      })

      // The body gives its matter to the drops and gets it back.
      const bodyR =
        (born ? mix(restR, size * 1.15, smoothstep(0, 1, travel)) : restR) *
        Math.sqrt(Math.max(0, 1 - away))
      itemA[0] = body.x
      itemA[1] = body.y
      itemB[3] = away >= 0.999 ? 0 : Math.max(bodyR, 0.001)

      const changing =
        phase.name === 'split' ||
        phase.name === 'join' ||
        phase.name === 'set' ||
        phase.name === 'melt'
      const wobble = changing ? Math.sin(Math.PI * progress) * 0.75 : 0

      // --- Labels: each part is named once it has set ---
      if (labelThing !== story.thing) {
        labelThing = story.thing
        labels.forEach((label, index) => {
          label.textContent = thing.parts[index]?.label ?? ''
        })
      }
      labels.forEach((label, index) => {
        const part = partsOnScreen[index]
        if (!part) {
          label.style.opacity = '0'
          return
        }
        label.style.transform = `translate(${(part.x - part.w).toFixed(1)}px, ${(part.y + part.h + 7).toFixed(1)}px)`
        label.style.opacity = smoothstep(0.75, 1, part.set).toFixed(3)
      })
      if (thing.caption !== captionText) {
        captionText = thing.caption
        caption.textContent = thing.caption
      }
      caption.style.opacity = (born ? smoothstep(0.2, 1, setAll) : 0).toFixed(3)

      // --- The name answers the matter ---
      pulse.age += delta
      if (coverGone || pulse.age < 1.4) {
        const wave = (index: number) => {
          const local = pulse.age * 2.4 - index * 0.085
          return local > 0 && local < 1 ? Math.sin(Math.PI * local) : 0
        }
        chars.forEach((char, index) => {
          const lift = wave(index) * (mobile ? 3.5 : 6) * pulse.sign
          char.style.transform = lift === 0 ? '' : `translateY(${(-lift).toFixed(2)}px)`
        })
      }
      // Its outlines go liquid for a moment with every change, most on load.
      const birthWet = coverGone
        ? 0
        : 1 - easeOut((clock - BIRTH_HOLD - 0.25) / (BIRTH_DRAIN + 0.5))
      const pulseWet = pulse.age < 1.2 ? Math.sin(Math.PI * clamp01(pulse.age / 1.2)) * 0.22 : 0
      const wet = Math.max(birthWet, pulseWet)
      wetRef.current?.setAttribute('scale', (wet * (mobile ? 26 : 42)).toFixed(2))
      heading.style.filter = wet > 0.002 ? 'url(#hero-assembly-wet)' : ''

      // --- The small blob ---
      // With a pointer it follows it. Alone it is a moon of the matter: it
      // circles what is there, dipping in and out of it.
      if (pointer.follow && performance.now() > pointer.releaseAt) pointer.follow = false
      const ballR = ballRadius(unit, mobile)
      ball.angle += delta * (0.42 + 0.18 * Math.sin(clock * 0.37))
      const around = mix(Math.max(itemB[3] ?? 0, size * 0.5), size * 1.05, away)
      // Around liquid matter it dips in and out; around set parts it keeps clear.
      const orbit = mix(
        around + ballR * (0.35 + 0.75 * Math.sin(clock * 0.53)),
        size * 1.42,
        setAll
      )
      const idleX = mix(body.x, centreX, away) + Math.cos(ball.angle) * orbit
      const idleY = mix(body.y, centreY, away) + Math.sin(ball.angle) * orbit * 0.82
      const targetX = pointer.follow ? pointer.x : born ? idleX : restX
      const targetY = pointer.follow ? pointer.y : born ? idleY : restY
      const follow = ease(pointer.follow ? 0.16 : 0.55)
      ball.x = mix(ball.x, Math.min(width + ballR, Math.max(-ballR, targetX)), follow)
      ball.y = mix(ball.y, Math.min(height + ballR, Math.max(-ballR, targetY)), follow)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(u.time, clock)
      gl.uniform2f(u.viewport, width, height)
      gl.uniform1f(u.dpr, layout.dpr)
      gl.uniform3f(u.color, red, green, blue)
      gl.uniform4fv(u.itemA, itemA)
      gl.uniform4fv(u.itemB, itemB)
      gl.uniform4fv(u.itemC, itemC)
      gl.uniform1f(u.merge, unit * mix(0.32, 0.12, away))
      gl.uniform1f(u.cover, coverPx)
      gl.uniform1f(u.wobble, wobble)
      gl.uniform4f(u.ball, ball.x, ball.y, ballR, unit * (mobile ? 0.22 : 0.32))
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // The caption sits under the whole drawing.
      caption.style.transform = `translate(${(centreX - size).toFixed(1)}px, ${(centreY + size * 1.02 * take.spread + 26).toFixed(1)}px)`

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
      gl.deleteBuffer(vbo)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      showEverything()
    }
  }, [prefersReducedMotion])

  const splitName = useMemo(
    () =>
      name.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="block whitespace-nowrap">
          {word.split('').map((char, charIndex) => (
            <span key={charIndex} data-char className="inline-block will-change-transform">
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
      data-hero-sample="zlozenie"
      className="text-foreground relative h-svh w-full touch-pan-y overflow-hidden select-none"
    >
      <noscript>
        <style>{`[data-hero-sample-cover] { display: none; }`}</style>
      </noscript>
      <svg aria-hidden="true" className="absolute size-0">
        <filter id="hero-assembly-wet" x="-10%" y="-20%" width="120%" height="140%">
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

      <div ref={labelsRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        {Array.from({ length: MAX_PARTS }, (_, index) => (
          <span
            key={index}
            className="text-muted-foreground absolute top-0 left-0 font-mono text-[10px] tracking-widest whitespace-nowrap uppercase opacity-0"
          />
        ))}
      </div>
      <p
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 font-mono text-[11px] tracking-widest uppercase opacity-0"
      />

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

/** The small blob: about a third of the production cursor ball on phones, so it reads as a satellite. */
function ballRadius(unit: number, mobile: boolean) {
  return unit * (mobile ? 0.085 : 0.13)
}
