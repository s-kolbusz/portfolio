'use client'

import { useEffect, useRef } from 'react'

import { ArrowDownIcon } from '@phosphor-icons/react'

import {
  FRAME_BODY_LIMIT,
  FRAME_FRAGMENT,
  FRAME_VERTEX,
} from '@/components/canvas/hero-samples/frame-shader'
import type { HeroFrameVariant } from '@/components/canvas/hero-samples/variants'

/**
 * Still layout frames for the hero, for the owner to choose a composition
 * before any motion is written. Each shows one moment of the same gesture:
 * the visitor's drop has pulled the blob apart and the blob is pulling
 * itself back together. The copy is the approved English; nothing animates.
 * See docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 */

const NAME = 'Sebastian Kolbusz'
const WHAT = 'I design and build websites and web apps.'
const CTA = 'See my work'

/** One end of a body: [x, y, radius] in the design frame's own pixels. */
type End = [number, number, number]

/** A drop (one end) or a tongue of pulled matter tapering from `a` to `b`. */
interface Body {
  a: End
  b?: End
  /** How far its outline wanders, as a share of its size (the live blob: 0.205). */
  wander?: number
}

interface Matter {
  bodies: Body[]
  /** Smooth-union width between bodies, design px. */
  join: number
}

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

const TONGUE = 0.07
const DROP = 0.1

const MATTER: Record<HeroFrameVariant, { desktop: Matter; phone: Matter }> = {
  'kadr-imie': {
    desktop: {
      bodies: [
        { a: [720, 455, 290] },
        { a: [900, 335, 128], b: [1075, 222, 30], wander: TONGUE },
        { a: [1185, 150, 90], b: [1128, 188, 34], wander: DROP },
      ],
      join: 80,
    },
    phone: {
      bodies: [
        { a: [190, 345, 150] },
        { a: [262, 272, 62], b: [310, 222, 14], wander: TONGUE },
        { a: [350, 165, 46], b: [322, 200, 16], wander: DROP },
      ],
      join: 44,
    },
  },
  'kadr-slowa': {
    desktop: {
      bodies: [
        { a: [1035, 540, 300] },
        { a: [900, 362, 124], b: [760, 215, 34], wander: TONGUE },
        { a: [572, 138, 92], b: [650, 172, 40], wander: DROP },
      ],
      join: 80,
    },
    phone: {
      bodies: [
        { a: [372, 690, 215] },
        { a: [334, 548, 72], b: [300, 452, 30], wander: TONGUE },
        { a: [232, 250, 56], b: [250, 300, 20], wander: DROP },
      ],
      join: 50,
    },
  },
  'kadr-materia': {
    desktop: {
      bodies: [
        { a: [900, 1010, 400] },
        { a: [640, 425, 90], wander: DROP },
        { a: [772, 402, 66], wander: DROP },
        { a: [882, 458, 80], wander: DROP },
        { a: [994, 432, 44], wander: DROP },
        { a: [700, 150, 95], b: [705, 78, 38], wander: DROP },
        { a: [905, 125, 54], wander: DROP },
        { a: [1050, 220, 70], b: [1055, 160, 30], wander: DROP },
        { a: [1200, 135, 38], wander: DROP },
      ],
      join: 40,
    },
    phone: {
      bodies: [
        { a: [300, 800, 250] },
        { a: [248, 400, 44], wander: DROP },
        { a: [318, 388, 36], wander: DROP },
        { a: [364, 446, 40], wander: DROP },
        { a: [300, 165, 42], b: [302, 128, 18], wander: DROP },
        { a: [352, 268, 28], wander: DROP },
        { a: [255, 285, 20], wander: DROP },
      ],
      join: 36,
    },
  },
}

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
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function useStillMatter(variant: HeroFrameVariant) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl2', { antialias: false, premultipliedAlpha: true })
    if (!canvas || !gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, FRAME_VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAME_FRAGMENT)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)

      const phone = width < 768
      const design = phone ? PHONE : DESKTOP
      const matter = MATTER[variant][phone ? 'phone' : 'desktop']
      const sx = width / design.width
      const sy = height / design.height
      const ends = new Float32Array(FRAME_BODY_LIMIT * 4)
      const shapes = new Float32Array(FRAME_BODY_LIMIT * 4)
      matter.bodies.slice(0, FRAME_BODY_LIMIT).forEach(({ a, b = a, wander = 0.205 }, index) => {
        ends.set([a[0] * sx, a[1] * sy, b[0] * sx, b[1] * sy], index * 4)
        shapes.set([a[2] * sy, b[2] * sy, index + 1, wander], index * 4)
      })

      gl.uniform2f(gl.getUniformLocation(program, 'uViewport'), width, height)
      gl.uniform1f(gl.getUniformLocation(program, 'uDpr'), dpr)
      gl.uniform1f(gl.getUniformLocation(program, 'uScale'), phone ? 0.6 : 1)
      gl.uniform1f(gl.getUniformLocation(program, 'uTime'), 12)
      gl.uniform3f(gl.getUniformLocation(program, 'uColor'), ...readPrimaryRgb())
      gl.uniform4fv(gl.getUniformLocation(program, 'uEnds'), ends)
      gl.uniform4fv(gl.getUniformLocation(program, 'uShape'), shapes)
      gl.uniform1i(
        gl.getUniformLocation(program, 'uCount'),
        Math.min(matter.bodies.length, FRAME_BODY_LIMIT)
      )
      gl.uniform1f(gl.getUniformLocation(program, 'uJoin'), matter.join * sy)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => {
      observer.disconnect()
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteBuffer(buffer)
    }
  }, [variant])

  return canvasRef
}

const DISPLAY = { fontFamily: 'var(--font-hero-display), var(--font-serif), serif' }

function Rows({ rows }: { rows: string[] }) {
  return rows.map((row) => (
    <span key={row} className="block whitespace-nowrap">
      {row}
    </span>
  ))
}

/** A sentence broken one way on wide screens and another on phones. */
function Sentence({
  wide,
  narrow,
  current = true,
}: {
  wide: string[]
  narrow: string[]
  current?: boolean
}) {
  return (
    <span className={`block ${current ? '' : 'text-foreground/30'}`}>
      <span className="hidden md:block">
        <Rows rows={wide} />
      </span>
      <span aria-hidden="true" className="md:hidden">
        <Rows rows={narrow} />
      </span>
    </span>
  )
}

function Signature() {
  return (
    <div className="absolute top-[4.4svh] left-5 md:top-[5.2svh] md:left-[6.67vw]">
      <p
        className="text-[22px] leading-tight italic md:text-[clamp(1.25rem,2.9svh,2.4rem)]"
        style={DISPLAY}
      >
        {NAME}
      </p>
      <p className="text-foreground/70 mt-5 text-[15px] leading-snug md:mt-1.5 md:text-[clamp(0.95rem,1.8svh,1.5rem)]">
        {WHAT}
      </p>
    </div>
  )
}

function Cta({ className }: { className: string }) {
  return (
    <p
      className={`flex items-center gap-2 font-mono text-xs tracking-widest uppercase ${className}`}
    >
      {CTA}
      <ArrowDownIcon aria-hidden="true" className="size-4" />
    </p>
  )
}

function NameFrames() {
  return (
    <>
      <h1 className="contents" style={DISPLAY}>
        <span className="absolute top-[11.4svh] left-5 text-[19.5vw] leading-[0.9] tracking-[-0.02em] md:top-[6svh] md:left-[6.67vw] md:text-[min(11.4vw,20svh)]">
          Sebastian
        </span>
        <span className="absolute top-[56.6svh] right-5 text-[19.5vw] leading-[0.9] tracking-[-0.02em] md:top-auto md:right-[10.4vw] md:bottom-[5.5svh] md:text-[min(11.4vw,20svh)]">
          Kolbusz
        </span>
      </h1>
      <div className="absolute top-[68.5svh] right-5 left-5 md:top-auto md:right-auto md:bottom-[7svh] md:left-[6.67vw] md:w-[min(30vw,52svh)]">
        <p className="border-foreground/20 text-foreground/70 border-t pt-3 text-[15px] leading-snug md:pt-4 md:text-[clamp(0.95rem,1.8svh,1.5rem)]">
          {WHAT}
        </p>
        <p
          className="mt-2.5 text-[21px] leading-[1.3] md:mt-4 md:text-[clamp(1.4rem,3.3svh,2.75rem)] md:leading-[1.28]"
          style={DISPLAY}
        >
          <span className="block">I take things apart.</span>
          <span className="text-foreground/30 block">I put them back together myself.</span>
          <span className="text-foreground/30 block">Nothing off the shelf.</span>
        </p>
        <Cta className="mt-3 md:mt-6" />
      </div>
    </>
  )
}

function WordsLead() {
  return (
    <>
      <Signature />
      <h1
        className="absolute top-[17.8svh] left-5 text-[14.9vw] leading-none tracking-[-0.02em] md:top-[23svh] md:left-[6.67vw] md:text-[min(8.8vw,15.6svh)] md:leading-[0.98]"
        style={DISPLAY}
      >
        <Sentence wide={['I take things apart.']} narrow={['I take things', 'apart.']} />
        <Sentence
          wide={['I put them back', 'together myself.']}
          narrow={['I put them', 'back together', 'myself.']}
          current={false}
        />
        <Sentence
          wide={['Nothing off the shelf.']}
          narrow={['Nothing off', 'the shelf.']}
          current={false}
        />
      </h1>
      <Cta className="absolute bottom-[104px] left-5 md:bottom-[6svh] md:left-[6.67vw]" />
    </>
  )
}

function MatterLeads() {
  const line =
    'absolute left-5 text-[10.3vw] leading-[1.04] tracking-[-0.015em] md:left-[6.67vw] md:text-[min(5.3vw,8.5svh)] md:leading-[1.02]'
  return (
    <>
      <Signature />
      <h1 className="contents" style={DISPLAY}>
        <span className={`${line} top-[19svh] md:top-[18.3svh]`}>
          <Sentence wide={['I take things apart.']} narrow={['I take things', 'apart.']} />
        </span>
        <span className={`${line} top-[40svh] md:top-[36.7svh]`}>
          <Sentence
            wide={['I put them back', 'together myself.']}
            narrow={['I put them back', 'together myself.']}
          />
        </span>
        <span className={`${line} top-[65.5svh] md:top-[72.2svh]`}>
          <Sentence wide={['Nothing off the shelf.']} narrow={['Nothing off', 'the shelf.']} />
        </span>
      </h1>
      <Cta className="absolute bottom-[104px] left-5 md:bottom-[6svh] md:left-[6.67vw]" />
    </>
  )
}

export function HeroFrame({ variant }: { variant: HeroFrameVariant }) {
  const canvasRef = useStillMatter(variant)

  return (
    <section
      data-hero-frame={variant}
      className="text-foreground relative h-svh w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
      />
      <div className="relative size-full">
        {variant === 'kadr-imie' ? (
          <NameFrames />
        ) : variant === 'kadr-slowa' ? (
          <WordsLead />
        ) : (
          <MatterLeads />
        )}
      </div>
    </section>
  )
}
