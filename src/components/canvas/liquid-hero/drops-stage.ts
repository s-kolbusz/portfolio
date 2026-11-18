// Separate drops of the hero's liquid that run together and pull apart with the scroll (act 3,
// ready2order). The physics is the hero's own particle simulation (sim.ts) with its pulls switched
// off; each drop is a group of particles drawn towards its own target, and the scroll moves every
// target from the drop's place to one common point. The liquid itself does the merging, so it looks
// like the hero's liquid and comes apart again when the page scrolls back up.
// Rendering is a lean pass of its own: particles splatted into a density field (the hero's splat
// shaders), then the surface lit from the field's slope, with a soft shadow on the paper.

import { SPLAT_FRAGMENT, SPLAT_VERTEX, VERTEX } from './shaders'
import { createSim, STEPS_PER_SECOND } from './sim'

/** a drop: centre and radius as fractions of the canvas height (x may run to the width/height ratio) */
export interface DropSpec {
  x: number
  y: number
  r: number
}

export interface DropsStageOptions {
  canvas: HTMLCanvasElement
  /** current layout in CSS px: the drops apart, and where the body stands when they have merged */
  layout: () => { drops: { x: number; y: number; r: number }[]; body: { x: number; y: number } }
  /** 0 = apart, 1 = one body */
  merge: () => number
  onFail: () => void
}

const SPACING = 0.42

const SURFACE = `#version 300 es
precision highp float;
uniform sampler2D uD; uniform vec2 uRes; uniform vec2 uShadow;
out vec4 o;
float dens(vec2 uv){ return texture(uD, uv).r; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 t = 1.5 / uRes;
  float v = dens(uv);
  const float ISO = 0.38;
  float a = smoothstep(ISO - 0.03, ISO + 0.03, v);
  // slope of the field = surface normal; a dome that rises from the edge
  float dx = dens(uv + vec2(t.x, 0.)) - dens(uv - vec2(t.x, 0.));
  float dy = dens(uv + vec2(0., t.y)) - dens(uv - vec2(0., t.y));
  float h = clamp((v - ISO) * 1.6, 0., 1.);
  vec3 n = normalize(vec3(-dx * 3.2, -dy * 3.2, 0.35 + h));
  vec3 L = normalize(vec3(-0.45, 0.6, 0.75));
  float diff = clamp(dot(n, L), 0., 1.);
  float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 36.);
  vec3 liquid = vec3(15., 157., 99.) / 255.;
  vec3 col = liquid * (0.8 + 0.3 * diff) + vec3(0.55, 0.9, 0.75) * spec * 0.55;
  // a slightly darker rim where the surface turns down to the paper
  col *= mix(0.86, 1., smoothstep(ISO, ISO + 0.22, v));
  // the shadow on the paper, offset down and right, soft
  float s = smoothstep(ISO - 0.2, ISO + 0.25, dens(uv - uShadow)) * 0.16;
  vec3 ink = vec3(43., 38., 32.) / 255.;
  // premultiplied: the liquid over its own shadow
  vec4 shadow = vec4(ink * s, s);
  o = vec4(col * a, a) + shadow * (1. - a);
}`

export function supportsDrops(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2')
    const ok = !!gl && !!gl.getExtension('EXT_color_buffer_float')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

export function startDropsStage({ canvas, layout, merge, onFail }: DropsStageOptions): () => void {
  let stop = () => {}
  try {
    stop = run(canvas, layout, merge)
  } catch {
    onFail()
  }
  return () => stop()
}

function run(
  canvas: HTMLCanvasElement,
  layout: DropsStageOptions['layout'],
  merge: DropsStageOptions['merge']
): () => void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const CW = canvas.clientWidth,
    CH = canvas.clientHeight
  const W = Math.round(CW * dpr),
    H = Math.round(CH * dpr)
  canvas.width = W
  canvas.height = H
  const A = CW / CH

  // --- the particles: groups placed as the drops, in sim units (h), y up
  const L0 = layout()
  const toQ = (px: number, py: number) => ({ x: px / CH, y: 1 - py / CH })
  const groupsQ = L0.drops.map((d) => ({ ...toQ(d.x, d.y), r: d.r / CH }))
  // particle interaction radius in canvas heights: the hero's light-mode size, finer where the drops
  // are small (a phone), so even a small drop has enough particles to come apart cleanly
  const rMax = Math.max(...groupsQ.map((g) => g.r))
  const Hq = Math.min(0.03, Math.max(0.014, rMax / 3.2))
  const pts: Array<[number, number, number]> = []
  const dy = (SPACING * Math.sqrt(3)) / 2
  groupsQ.forEach((g, gi) => {
    const r = g.r / Hq,
      cx = g.x / Hq,
      cy = g.y / Hq
    for (let y = -r, row = 0; y <= r; y += dy, row++)
      for (let x = -r + ((row % 2) * SPACING) / 2; x <= r; x += SPACING)
        if (x * x + y * y <= r * r) pts.push([cx + x, cy + y, gi])
  })
  // one disk big enough for every particle; the spare ones are parked out of the field
  const totalArea = groupsQ.reduce((s, g) => s + g.r * g.r, 0)
  const sim = createSim({
    width: A / Hq,
    height: 1 / Hq,
    center: { x: A / 2 / Hq, y: 0.5 / Hq },
    radius: (Math.sqrt(totalArea) * 1.08) / Hq,
    spacing: SPACING,
  })
  const N = sim.N
  const group = new Int8Array(N).fill(-1)
  for (let i = 0; i < N; i++) {
    if (i < pts.length) {
      sim.x[i] = pts[i][0]
      sim.y[i] = pts[i][1]
      group[i] = pts[i][2]
    } else {
      sim.x[i] = -40 - (i % 10)
      sim.y[i] = -40 - Math.floor(i / 10) * 0.01
    }
    sim.vx[i] = 0
    sim.vy[i] = 0
  }
  // only the liquid's own forces: no pull to a main body, no return to the middle, no own weight,
  // and less of the slow swirling, so a drop at rest stays a drop
  Object.assign(sim.P, { pull: 0, anchor: 0, self: 0, cursorPull: 0, life: 0.00012 })

  const G = groupsQ.length
  const cap = new Int32Array(G)
  for (let i = 0; i < N; i++) if (group[i] >= 0) cap[group[i]]++
  const cx = new Float32Array(G),
    cy = new Float32Array(G),
    cvx = new Float32Array(G),
    cvy = new Float32Array(G),
    cn = new Float32Array(G),
    tx = new Float32Array(G),
    ty = new Float32Array(G),
    ax = new Float32Array(G),
    ay = new Float32Array(G)
  // the group as a whole is steered to its target; every particle is also drawn to it a little,
  // which keeps each drop round instead of letting it trail behind as a thread
  const SPRING = 0.002,
    DAMP = 0.04,
    GATHER = 0.0005,
    GATHER_MAX = 0.02
  // which drop a particle belongs to is decided again as the drops pull apart: each target takes the
  // particles nearest to it, up to its own share, so the body divides into clean pieces
  const order: number[] = []
  for (let i = 0; i < N; i++) if (group[i] >= 0) order.push(i)
  const pairD = new Float32Array(order.length * G)
  const pairIdx = new Int32Array(order.length * G)
  const left = new Int32Array(G)
  const taken = new Uint8Array(N)
  function regroup() {
    for (let k = 0; k < order.length; k++) {
      const i = order[k]
      for (let g = 0; g < G; g++) {
        const ddx = sim.x[i] - tx[g],
          ddy = sim.y[i] - ty[g]
        pairD[k * G + g] = ddx * ddx + ddy * ddy
        pairIdx[k * G + g] = k * G + g
      }
    }
    const idx = Array.from(pairIdx).sort((a, b) => pairD[a] - pairD[b])
    left.set(cap)
    taken.fill(0)
    for (const e of idx) {
      const k = (e / G) | 0,
        g = e % G,
        i = order[k]
      if (taken[i] || left[g] <= 0) continue
      taken[i] = 1
      left[g]--
      group[i] = g
    }
  }
  let stepN = 0,
    lastM = 0
  function steer(m: number, L: ReturnType<DropsStageOptions['layout']>) {
    const b = toQ(L.body.x, L.body.y)
    for (let g = 0; g < G; g++) {
      const d = L.drops[g] ? toQ(L.drops[g].x, L.drops[g].y) : b
      tx[g] = (d.x + (b.x - d.x) * m) / Hq
      ty[g] = (d.y + (b.y - d.y) * m) / Hq
    }
    // while the drops pull apart (and not when they have just gathered), re-divide the body
    if (stepN++ % 20 === 0 && m < 0.97 && m <= lastM + 1e-4) regroup()
    lastM = m
    cx.fill(0)
    cy.fill(0)
    cvx.fill(0)
    cvy.fill(0)
    cn.fill(0)
    for (let i = 0; i < N; i++) {
      const g = group[i]
      if (g < 0) continue
      cx[g] += sim.x[i]
      cy[g] += sim.y[i]
      cvx[g] += sim.vx[i]
      cvy[g] += sim.vy[i]
      cn[g]++
    }
    for (let g = 0; g < G; g++) {
      if (!cn[g]) continue
      ax[g] = (tx[g] - cx[g] / cn[g]) * SPRING - (cvx[g] / cn[g]) * DAMP
      ay[g] = (ty[g] - cy[g] / cn[g]) * SPRING - (cvy[g] / cn[g]) * DAMP
    }
    for (let i = 0; i < N; i++) {
      const g = group[i]
      if (g < 0) {
        sim.vx[i] = 0
        sim.vy[i] = 0
        continue
      }
      const gx = Math.max(-GATHER_MAX, Math.min(GATHER_MAX, (tx[g] - sim.x[i]) * GATHER)),
        gy = Math.max(-GATHER_MAX, Math.min(GATHER_MAX, (ty[g] - sim.y[i]) * GATHER))
      sim.vx[i] += ax[g] + gx
      sim.vy[i] += ay[g] + gy
    }
  }

  // --- WebGL: density splat, then the surface
  const glc = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true })
  if (!glc) throw new Error('no WebGL2')
  const gl = glc
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float targets')
  const program = (v: string, f: string) => {
    const p = gl.createProgram()
    for (const [type, src] of [
      [gl.VERTEX_SHADER, v],
      [gl.FRAGMENT_SHADER, f],
    ] as const) {
      const s = gl.createShader(type)
      if (!s) throw new Error('shader')
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      gl.attachShader(p, s)
    }
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link')
    return p
  }
  const splat = program(SPLAT_VERTEX, SPLAT_FRAGMENT),
    surface = program(VERTEX, SURFACE)
  const DW = Math.round(W / 2),
    DH = Math.round(H / 2)
  const dTex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, dTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, DW, DH, 0, gl.RGBA, gl.HALF_FLOAT, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dTex, 0)
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    throw new Error('density FBO incomplete')
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const qVao = gl.createVertexArray()
  gl.bindVertexArray(qVao)
  gl.enableVertexAttribArray(gl.getAttribLocation(surface, 'aPos'))
  gl.vertexAttribPointer(gl.getAttribLocation(surface, 'aPos'), 2, gl.FLOAT, false, 0, 0)

  const used = pts.length
  const pos = new Float32Array(used * 2)
  const pBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuf)
  gl.bufferData(gl.ARRAY_BUFFER, pos.byteLength, gl.DYNAMIC_DRAW)
  const pVao = gl.createVertexArray()
  gl.bindVertexArray(pVao)
  gl.enableVertexAttribArray(gl.getAttribLocation(splat, 'aP'))
  gl.vertexAttribPointer(gl.getAttribLocation(splat, 'aP'), 2, gl.FLOAT, false, 0, 0)

  // the same density normalisation as the hero, so the edge sits where it does there
  const splatR = 3.3 * SPACING * Hq
  const perParticle = ((SPACING * Hq) ** 2 * Math.sqrt(3)) / 2
  const norm = 1 / ((Math.PI * splatR * splatR) / 4 / perParticle)
  gl.useProgram(splat)
  gl.uniform1f(gl.getUniformLocation(splat, 'uA'), A)
  gl.uniform1f(gl.getUniformLocation(splat, 'uSize'), splatR * 2 * DH)
  gl.uniform1f(gl.getUniformLocation(splat, 'uNorm'), norm)
  gl.uniform2f(gl.getUniformLocation(splat, 'uMask'), 1, 0)
  gl.useProgram(surface)
  gl.uniform1i(gl.getUniformLocation(surface, 'uD'), 0)
  gl.uniform2f(gl.getUniformLocation(surface, 'uRes'), W, H)
  // shadow offset as in the stills: about 0.5vw right, 0.9vw down (y up in the texture)
  gl.uniform2f(gl.getUniformLocation(surface, 'uShadow'), (0.005 * CW) / CW, -(0.009 * CW) / CH)

  let raf = 0,
    tPrev = performance.now(),
    acc = 0,
    visible = true
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting)
      if (visible && !raf) {
        tPrev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    },
    { rootMargin: '50% 0px' }
  )
  io.observe(canvas)

  function frame(now: number) {
    raf = 0
    if (!visible) return
    acc += Math.min((now - tPrev) / 1000, 0.05) * STEPS_PER_SECOND
    tPrev = now
    const m = merge()
    const L = layout()
    let n = 0
    while (acc >= 1 && n < 4) {
      steer(m, L)
      sim.step()
      acc -= 1
      n++
    }
    if (acc > 4) acc = 0
    for (let i = 0; i < used; i++) {
      pos[i * 2] = sim.x[i] * Hq
      pos[i * 2 + 1] = sim.y[i] * Hq
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, DW, DH)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(splat)
    gl.bindVertexArray(pVao)
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.drawArrays(gl.POINTS, 0, used)
    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, W, H)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(surface)
    gl.bindVertexArray(qVao)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dTex)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
