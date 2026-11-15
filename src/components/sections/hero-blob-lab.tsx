'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  type BlobLabParams,
  createBlobLabState,
  PARAM_KEYS,
  PRODUCTION,
  PROPOSAL,
  stepBlobLab,
} from '@/components/canvas/hero-samples/blob-lab'
import {
  BLOB_LAB_FRAGMENT,
  BLOB_LAB_VERTEX,
} from '@/components/canvas/hero-samples/blob-lab-shader'

/**
 * A bench for the live site's blob: the production blob, unchanged, and a
 * panel of dials for what it could do more of. The owner tunes it by eye;
 * the values he settles on go back into the production shader.
 */

const STORAGE_KEY = 'hero-blob-lab'

const DIALS: Array<{
  key: keyof BlobLabParams
  label: string
  hint: string
  min: number
  max: number
}> = [
  {
    key: 'mutate',
    label: 'Mutacja zarysu',
    hint: 'jak daleko kształt odchodzi od koła',
    min: 0,
    max: 1,
  },
  { key: 'mutateSpeed', label: 'Tempo mutacji', hint: 'jak szybko się zmienia', min: 0.2, max: 3 },
  {
    key: 'lean',
    label: 'Ciężar',
    hint: 'ciało pochyla się za kursorem, z opóźnieniem',
    min: 0,
    max: 1,
  },
  { key: 'gulp', label: 'Połknięcie', hint: 'reakcja ciała na wchłonięcie kropli', min: 0, max: 1 },
  {
    key: 'stretch',
    label: 'Bezwładność kropli',
    hint: 'kropla wyciąga się w ruchu',
    min: 0,
    max: 1,
  },
  { key: 'spring', label: 'Sprężystość', hint: '0 ciężko i tłumione, 1 żywo', min: 0, max: 1 },
]

function readPrimaryRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim()
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts as [number, number, number]
  }
  return [0.494, 0.773, 0.557]
}

function readStored(): BlobLabParams | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<BlobLabParams>
    const params = { ...PROPOSAL }
    for (const key of PARAM_KEYS) {
      const value = stored[key]
      if (typeof value === 'number' && Number.isFinite(value)) params[key] = value
    }
    return params
  } catch {
    return null
  }
}

/** The dials' values: remembered between visits, read by the panel and by the render loop. */
let current: BlobLabParams | null = null
const listeners = new Set<() => void>()
const dials = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  get() {
    current ??= readStored() ?? PROPOSAL
    return current
  },
  server() {
    return PROPOSAL
  },
  set(next: BlobLabParams) {
    current = next
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Private mode: the dials still work, they are just not remembered.
    }
    for (const listener of listeners) listener()
  },
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

export function HeroBlobLab() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useSyncExternalStore(dials.subscribe, dials.get, dials.server)
  const overPanelRef = useRef(false)
  // Until it is touched the panel is open where there is room for it (wide screens) and folded on a phone.
  const [open, setOpen] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const apply = dials.set

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
      depth: false,
    })
    if (!gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, BLOB_LAB_VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, BLOB_LAB_FRAGMENT)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }
    const vao = gl.createVertexArray()
    const vbo = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const uniforms = {
      uTime: uniform('uTime'),
      uViewport: uniform('uViewport'),
      uDpr: uniform('uDpr'),
      uScale: uniform('uScale'),
      uOpacity: uniform('uOpacity'),
      uDetail: uniform('uDetail'),
      uColor: uniform('uColor'),
      uCenter: uniform('uCenter'),
      uRadius: uniform('uRadius'),
      uSquash: uniform('uSquash'),
      uBall: uniform('uBall'),
      uStretch: uniform('uStretch'),
      uMutate: uniform('uMutate'),
    }

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const view = { width: 1, height: 1, dpr: 1, mobile: false }
    const pointer = { x: 0, y: 0, inside: false, pressed: false, touch: false }
    const state = createBlobLabState()
    const colour = readPrimaryRgb()
    let time = 0
    let opacity = 0

    const resize = () => {
      const rect = section.getBoundingClientRect()
      view.width = rect.width
      view.height = rect.height
      view.mobile = rect.width < 768
      // The live site's own limits, so the edge is judged as it ships.
      view.dpr = Math.min(window.devicePixelRatio, view.mobile ? 1 : 1.5)
      canvas.width = Math.round(rect.width * view.dpr)
      canvas.height = Math.round(rect.height * view.dpr)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(section)

    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.touch = event.pointerType !== 'mouse'
      pointer.inside = true
    }
    const onDown = (event: PointerEvent) => {
      pointer.pressed = true
      onMove(event)
    }
    const onUp = () => {
      pointer.pressed = false
    }
    const onLeave = () => {
      pointer.inside = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    let frame = 0
    let last = performance.now()
    const render = () => {
      frame = requestAnimationFrame(render)
      const now = performance.now()
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      const reduced = reducedQuery.matches
      if (!reduced) time += delta
      opacity += (1 - opacity) * (1 - Math.exp(-delta / 0.6))

      // A mouse leads the ball while it is over the page; a finger while it is down.
      const active =
        !reduced &&
        !overPanelRef.current &&
        pointer.inside &&
        (pointer.touch ? pointer.pressed : true)
      const scale = view.mobile ? 0.6 : 1
      const step = stepBlobLab(state, {
        delta: reduced ? 0 : delta,
        viewportWidth: view.width,
        viewportHeight: view.height,
        scale,
        pointer: { x: pointer.x, y: pointer.y, active },
        params: dials.get(),
      })

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uniforms.uTime, time)
      gl.uniform2f(uniforms.uViewport, view.width, view.height)
      gl.uniform1f(uniforms.uDpr, view.dpr)
      gl.uniform1f(uniforms.uScale, scale)
      gl.uniform1f(uniforms.uOpacity, opacity)
      gl.uniform1f(uniforms.uDetail, view.mobile ? 0.5 : 1)
      gl.uniform3f(uniforms.uColor, colour[0], colour[1], colour[2])
      gl.uniform2f(uniforms.uCenter, step.centerX, step.centerY)
      gl.uniform1f(uniforms.uRadius, step.radius)
      gl.uniform3f(uniforms.uSquash, step.squashX, step.squashY, step.squash)
      gl.uniform4f(uniforms.uBall, step.ballX, step.ballY, step.ballRadius, step.merge)
      gl.uniform3f(uniforms.uStretch, step.stretchX, step.stretchY, step.stretch)
      gl.uniform2f(uniforms.uMutate, step.mutate, step.phase)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.removeEventListener('mouseleave', onLeave)
      gl.deleteBuffer(vbo)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(params))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const button =
    'border-border hover:border-foreground rounded-full border px-3 py-1.5 transition-colors'

  return (
    <section
      ref={sectionRef}
      data-hero-sample="blob"
      className="bg-background relative h-svh w-full overflow-hidden"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <div
        onPointerEnter={() => {
          overPanelRef.current = true
        }}
        onPointerLeave={() => {
          overPanelRef.current = false
        }}
        className="bg-background/90 border-border absolute right-3 bottom-24 left-3 max-h-[45svh] overflow-y-auto rounded-2xl border p-4 font-mono text-xs backdrop-blur md:top-6 md:right-auto md:bottom-auto md:left-6 md:max-h-[calc(100svh-3rem)] md:w-80"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="tracking-widest uppercase">Blob z produkcji</p>
          <button
            type="button"
            className={button}
            onClick={() =>
              setOpen(open === null ? !window.matchMedia('(min-width: 768px)').matches : !open)
            }
          >
            {open === null ? (
              <>
                <span className="md:hidden">Rozwiń</span>
                <span className="hidden md:inline">Zwiń</span>
              </>
            ) : open ? (
              'Zwiń'
            ) : (
              'Rozwiń'
            )}
          </button>
        </div>
        {open !== false && (
          <div className={open === null ? 'hidden md:block' : undefined}>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={button} onClick={() => apply(PRODUCTION)}>
                Jak na stronie
              </button>
              <button type="button" className={button} onClick={() => apply(PROPOSAL)}>
                Moje ustawienia
              </button>
              <button type="button" className={button} onClick={() => void copy()}>
                {copied ? 'Skopiowane' : 'Kopiuj wartości'}
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {DIALS.map((dial) => (
                <label key={dial.key} className="flex flex-col gap-1.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span>{dial.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {params[dial.key].toFixed(2)}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={dial.min}
                    max={dial.max}
                    step={0.01}
                    value={params[dial.key]}
                    onChange={(event) =>
                      apply({ ...params, [dial.key]: Number(event.target.value) })
                    }
                    className="accent-primary w-full"
                  />
                  <span className="text-muted-foreground normal-case">{dial.hint}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
