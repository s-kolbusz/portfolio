'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useTheme } from 'next-themes'

import { usePrefersReducedMotion } from '@/hooks/useMedia'

// ─── GLSL Shaders ───────────────────────────────────────────────────────

const VERTEX_SRC = /* glsl */ `#version 300 es
  in vec2 aPosition;
  out vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uScale;
  uniform float uOpacity;

  in vec2 vUv;
  out vec4 fragColor;

  // SDF Primitives & Operations
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Simplex 2D Noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Normalize coordinates (-1 to 1), corrected for aspect ratio
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    // 1. Main Blob (Breathing)
    float breathe = sin(uTime * 0.3) * 0.03;
    vec2 mainPos = vec2(0.0, 0.0);

    // Subtle wandering
    mainPos.x += snoise(vec2(uTime * 0.1, 0.0)) * 0.15;
    mainPos.y += snoise(vec2(0.0, uTime * 0.15)) * 0.15;

    // Apply uScale to radius
    float d1 = sdCircle(uv - mainPos, (0.75 + breathe) * uScale);

    // 2. Mouse Blob (Interaction)
    vec2 mouseUV = uMouse * 2.0 - 1.0;
    mouseUV.x *= uResolution.x / uResolution.y;

    float d2 = sdCircle(uv - mouseUV, 0.25 * uScale);

    // 3. Blend (Metaballs)
    float d = smin(d1, d2, 0.6 * uScale);

    // 4. Domain Warping (Organic Edge)
    float noise = snoise(uv * 1.5 + uTime * 0.15);
    d += noise * 0.04 * uScale;

    // 5. Coloring & Surface Tension
    float alpha = smoothstep(0.04, -0.04, d);

    // Internal gradient: only applied deep inside the blob
    // At edges (alpha near 0), color stays at uColor to avoid grey boundary
    float dither = snoise(uv * 200.0) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);

    // Core is slightly darker for depth; edge stays at true uColor
    vec3 finalColor = mix(uColor, uColor * 0.85, depthFactor);

    float opacity = alpha * uOpacity;

    fragColor = vec4(finalColor, opacity);
  }
`

// ─── WebGL Helpers ──────────────────────────────────────────────────────

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc)
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${info}`)
  }
  gl.detachShader(program, vs)
  gl.detachShader(program, fs)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  return program
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Parse hex color (#RRGGBB) to [r, g, b] in 0–1 range */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255]
}

const LIGHT_COLOR = hexToRgb('#7ec58e')
const DARK_COLOR = hexToRgb('#135534')

// Fullscreen quad (2 triangles)
// prettier-ignore
const QUAD_VERTICES = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
])

// ─── Component ──────────────────────────────────────────────────────────

export function ViscousPuddle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Mutable state refs (avoid re-renders)
  const stateRef = useRef({
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
    scale: 1.0,
    opacity: 0.0,
    // Scroll-based transforms (applied via CSS)
    scrollY: 0,
    cssTranslateY: 0,
    cssScale: 1.0,
  })

  // Theme ref kept in sync
  const themeRef = useRef(resolvedTheme)
  themeRef.current = resolvedTheme

  // Reduced motion ref
  const reducedMotionRef = useRef(prefersReducedMotion)
  reducedMotionRef.current = prefersReducedMotion

  // Resize handler
  const handleResize = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    stateRef.current.isMobile = w < 768
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Init WebGL2 ──
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      depth: false,
      stencil: false,
    })
    if (!gl) {
      console.warn('WebGL2 not supported')
      return
    }

    // ── Compile program ──
    const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC)

    // ── Setup fullscreen quad VAO ──
    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)

    const vbo = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW)

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)

    // ── Get uniform locations ──
    gl.useProgram(program)
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uMouse = gl.getUniformLocation(program, 'uMouse')
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uColor = gl.getUniformLocation(program, 'uColor')
    const uScale = gl.getUniformLocation(program, 'uScale')
    const uOpacity = gl.getUniformLocation(program, 'uOpacity')

    // ── GL state ──
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // ── Initial sizing ──
    handleResize(canvas)

    // ── Trigger CSS fade-in (needs a frame delay for transition to work) ──
    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    // ── Intersection Observer (pause when off-screen) ──
    const observer = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.isInView = entry.isIntersecting
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    // ── Mouse listeners — use canvas-relative coordinates ──
    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.pointerInside = true
      // Get position relative to the canvas element
      const rect = canvas.getBoundingClientRect()
      stateRef.current.targetMouseX = (e.clientX - rect.left) / rect.width
      stateRef.current.targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height
    }
    const onMouseLeave = () => {
      stateRef.current.pointerInside = false
    }
    const onMouseEnter = () => {
      stateRef.current.pointerInside = true
    }

    if (!stateRef.current.isMobile) {
      window.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseleave', onMouseLeave)
      document.addEventListener('mouseenter', onMouseEnter)
    }

    // ── Resize listener ──
    const onResize = () => handleResize(canvas)
    window.addEventListener('resize', onResize)

    // ── Animation loop ──
    let raf = 0
    let lastTime = performance.now()

    const render = (now: number) => {
      raf = requestAnimationFrame(render)

      const s = stateRef.current
      if (!s.isInView) {
        lastTime = now
        return
      }

      const rawDelta = (now - lastTime) / 1000
      const delta = Math.min(rawDelta, 0.05)
      lastTime = now

      // Time
      if (!reducedMotionRef.current) {
        s.time += delta
      }

      // Fluid fade-in: slow exponential approach (matches viscous feel)
      // Takes ~2s to reach full opacity with this factor
      s.opacity = lerp(s.opacity, 1.0, 0.025)

      // Scale (mobile vs desktop)
      const targetScale = s.isMobile ? 0.6 : 1.0
      s.scale = lerp(s.scale, targetScale, 0.1)

      // Color (theme-aware, using actual OKLCH primary values)
      const target = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR
      s.colorR = lerp(s.colorR, target[0], 0.05)
      s.colorG = lerp(s.colorG, target[1], 0.05)
      s.colorB = lerp(s.colorB, target[2], 0.05)

      // Mouse (lerp towards target or center)
      const lerpFactor = s.pointerInside && !reducedMotionRef.current ? 0.06 : 0.02
      if (s.isMobile || !s.pointerInside || reducedMotionRef.current) {
        s.targetMouseX = 0.5
        s.targetMouseY = 0.5
      }
      s.mouseX = lerp(s.mouseX, s.targetMouseX, lerpFactor)
      s.mouseY = lerp(s.mouseY, s.targetMouseY, lerpFactor)

      // ── Scroll-based transforms (CSS on canvas element) ──
      if (!reducedMotionRef.current) {
        const rawScroll = typeof window !== 'undefined' ? window.scrollY : 0
        const clampedScroll = Math.min(rawScroll, canvas.clientHeight * 1.5)

        // Smooth lerp for scroll
        s.lerpScroll = lerp(s.lerpScroll, clampedScroll, 0.15)
        if (Math.abs(s.lerpScroll - clampedScroll) < 0.1) {
          s.lerpScroll = clampedScroll
        }

        // Parallax: strong vertical shift + scale-up as user scrolls
        const targetTranslateY = s.lerpScroll * 1.5
        const targetCssScale = 1.0 + s.lerpScroll * 0.0025

        s.cssTranslateY = lerp(s.cssTranslateY, targetTranslateY, 0.2)
        s.cssScale = lerp(s.cssScale, targetCssScale, 0.2)

        canvas.style.transform = `translateY(${s.cssTranslateY}px) scale(${s.cssScale})`
      }

      // ── Draw ──
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)
      gl.uniform1f(uTime, s.time)
      gl.uniform2f(uMouse, s.mouseX, s.mouseY)
      gl.uniform2f(uResolution, canvas.clientWidth, canvas.clientHeight)
      gl.uniform3f(uColor, s.colorR, s.colorG, s.colorB)
      gl.uniform1f(uScale, s.scale)
      gl.uniform1f(uOpacity, s.opacity)

      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindVertexArray(null)
    }

    raf = requestAnimationFrame(render)

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('resize', onResize)
      gl.deleteBuffer(vbo)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
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
