// Separate drops of the hero's liquid that run together and pull apart with the scroll (act 3,
// ready2order). The physics is the hero's own particle simulation (sim.ts) with its pulls switched
// off; each drop is a group of particles drawn towards its own target, and the scroll moves every
// target from the drop's place to one common point. The liquid itself does the merging, so it looks
// like the hero's liquid and comes apart again when the page scrolls back up.
// Rendering is a lean pass of its own: particles splatted into a density field (the hero's splat
// shaders), then the ground and the liquid as green glass (SURFACE below).

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

export interface DropsStage {
  stop: () => void
  /** pull drop `g` out of the body for a moment, towards a point (CSS px), then let it run back */
  pluck: (g: number, toward: { x: number; y: number }) => void
}

const SPACING = 0.42

// The ground and the liquid, after the hero's dark water sheet: ink with faint contour lines that
// drift, and the liquid as green glass over it. It bends the lines under it (refraction from the
// surface slope), reflects a moving window at its rim (fresnel), rolls its edge under and carries
// slow, uneven waves, so it never stands still. Simplified from MAIN_FRAGMENT in shaders.ts.
const SURFACE = `#version 300 es
precision highp float;
uniform sampler2D uD; uniform vec2 uRes; uniform float uTime;
out vec4 o;
const float ISO = 0.38;
const vec3 GROUND = vec3(0.169, 0.149, 0.125);
const vec3 TINT = vec3(0.03, 0.575, 0.363);
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3. - 2.*f);
  return mix(mix(hsh(i), hsh(i + vec2(1, 0)), u.x), mix(hsh(i + vec2(0, 1)), hsh(i + vec2(1, 1)), u.x), u.y); }
vec2 suv(vec2 q){ return vec2(q.x * uRes.y / uRes.x, q.y); }
float dens(vec2 q){ return texture(uD, suv(q)).r; }
// the ground: ink, and contour lines of a slow, made-up terrain
vec3 ground(vec2 q){
  vec2 p = q * 1.7 + vec2(uTime * 0.012, -uTime * 0.008);
  float h = vnoise(p) * 0.6 + vnoise(p * 2.1 + 3.7) * 0.3 + vnoise(p * 4.3 - 1.3) * 0.1;
  float v = h * 14.;
  float d = abs(fract(v + 0.5) - 0.5) / max(fwidth(v), 1e-5);
  float major = step(mod(floor(v + 0.5), 4.), 0.5);
  float line = clamp(1. - d / 1.4, 0., 1.) * mix(0.07, 0.15, major);
  return mix(GROUND, vec3(0.95, 0.93, 0.88), line);
}
float waves(vec2 q, float t){
  vec2 w = vec2(vnoise(q * 3.1 + vec2(t * 0.11, -t * 0.07)), vnoise(q * 3.1 + vec2(5.2 - t * 0.09, 1.3 + t * 0.1))) - 0.5;
  vec2 p = q * 9. + w * 2.2;
  float n = vnoise(p + vec2(t * 0.35, -t * 0.22)) * 0.65 + vnoise(p * 1.9 - vec2(t * 0.28, t * 0.31)) * 0.35;
  float amp = 0.5 + 0.5 * vnoise(q * 2.3 - vec2(t * 0.05));
  return (n - 0.5) * amp;
}
// height: flat on top, steep at the edge, plus the waves
float hgt(vec2 q){
  float f = dens(q);
  float m = smoothstep(ISO, ISO + 0.9, f);
  return pow(m, 0.7) * 0.6 + waves(q, uTime) * 0.22 * smoothstep(ISO, ISO + 0.3, f);
}
void main(){
  vec2 q = gl_FragCoord.xy / uRes.y;
  float f = dens(q);
  float fw = fwidth(f);
  float cover = smoothstep(ISO - max(fw * 2., 0.02), ISO + max(fw * 2., 0.02), f);
  // a faint green glow around the liquid on the dark ground, as light through glass
  vec3 wall = ground(q) + TINT * smoothstep(ISO * 0.25, ISO, dens(q - vec2(0.01, -0.016))) * 0.06;
  if (cover <= 0.) { o = vec4(wall, 1.); return; }
  float e = 4.0 / uRes.y;
  float hx = hgt(q + vec2(e, 0.)) - hgt(q - vec2(e, 0.));
  float hy = hgt(q + vec2(0., e)) - hgt(q - vec2(0., e));
  vec3 n = normalize(vec3(-hx / (2. * e) * 0.14, -hy / (2. * e) * 0.14, 1.));
  // the edge rolls under: a narrow band of uneven width where the surface turns down
  float edge = smoothstep(ISO, ISO + 0.35 * (0.7 + 0.6 * vnoise(q * 7. + uTime * 0.06)), f);
  float curl = (1. - edge) * (1. - edge);
  n = normalize(vec3(n.xy * (1. + curl * 7.), n.z * (1. - curl * 0.9)));
  // green glass: the lines under it, bent and tinted
  float k = min(0.035 + 0.1 * pow(1. - max(n.z, 0.), 1.6), 0.08);
  vec3 seen = vec3(ground(q - n.xy * k * 0.97).r, ground(q - n.xy * k).g, ground(q - n.xy * k * 1.03).b);
  vec3 body = seen * vec3(0.55, 1.0, 0.76) + TINT * 0.5;
  body *= 1. - 0.35 * curl;
  float F = 0.02 + 0.98 * pow(1. - max(n.z, 0.), 5.);
  vec3 r = reflect(vec3(0., 0., -1.), n);
  vec3 L = normalize(vec3(-0.55 + 0.12 * sin(q.y * 7. + uTime * 0.21), 0.62 + 0.08 * cos(q.x * 5.3 - uTime * 0.17), 0.56));
  vec3 env = mix(vec3(0.3, 0.55, 0.45), vec3(0.85, 0.98, 0.92), smoothstep(-0.35, 0.45, r.y));
  env += vec3(1.1) * smoothstep(0.8, 0.92, dot(r, L));
  vec3 col = body * (1. - F * 0.6) + env * F * 0.55;
  float sp = max(dot(r, L), 0.);
  col += vec3(1.) * (pow(sp, 5.) * 0.06 + pow(sp, 24.) * 0.1 + pow(sp, 220.) * 0.7);
  o = vec4(mix(wall, col, cover), 1.);
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

export function startDropsStage({ canvas, layout, merge, onFail }: DropsStageOptions): DropsStage {
  try {
    return run(canvas, layout, merge)
  } catch {
    onFail()
    return { stop: () => {}, pluck: () => {} }
  }
}

function run(
  canvas: HTMLCanvasElement,
  layout: DropsStageOptions['layout'],
  merge: DropsStageOptions['merge']
): DropsStage {
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
  // only the liquid's own forces: no pull to a main body, no return to the middle, no own weight;
  // the slow swirling stays, so the liquid never stands dead still
  Object.assign(sim.P, { pull: 0, anchor: 0, self: 0, cursorPull: 0, life: 0.0003 })

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
    lastM = 0,
    simT = 0
  // a plucked drop: where it is pulled to (sim units) and until when (sim seconds)
  const pluckX = new Float32Array(G),
    pluckY = new Float32Array(G),
    pluckUntil = new Float32Array(G).fill(-1)
  let regroupNow = false
  // the pointer, in sim units: it pushes the liquid it moves through, and a click splashes it
  const ptr = { x: -99, y: -99, vx: 0, vy: 0, on: false, hit: 0 }
  function steer(m: number, L: ReturnType<DropsStageOptions['layout']>) {
    simT += 1 / STEPS_PER_SECOND
    const b = toQ(L.body.x, L.body.y)
    for (let g = 0; g < G; g++) {
      const d = L.drops[g] ? toQ(L.drops[g].x, L.drops[g].y) : b
      tx[g] = (d.x + (b.x - d.x) * m) / Hq
      ty[g] = (d.y + (b.y - d.y) * m) / Hq
      if (pluckUntil[g] > simT) {
        tx[g] = pluckX[g]
        ty[g] = pluckY[g]
      }
    }
    // while the drops pull apart (and not when they have just gathered), re-divide the body;
    // a pluck re-divides at once, so the drop that leaves is a whole drop
    if (regroupNow || (stepN % 20 === 0 && m < 0.97 && m <= lastM + 1e-4)) regroup()
    regroupNow = false
    stepN++
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
      // a plucked drop gathers hard, so it leaves as a whole drop instead of a long tongue
      const gk = pluckUntil[g] > simT ? GATHER * 5 : GATHER,
        gm = pluckUntil[g] > simT ? GATHER_MAX * 2 : GATHER_MAX
      const gx = Math.max(-gm, Math.min(gm, (tx[g] - sim.x[i]) * gk)),
        gy = Math.max(-gm, Math.min(gm, (ty[g] - sim.y[i]) * gk))
      sim.vx[i] += ax[g] + gx
      sim.vy[i] += ay[g] + gy
      if (ptr.on) {
        const ddx = sim.x[i] - ptr.x,
          ddy = sim.y[i] - ptr.y
        const d2 = ddx * ddx + ddy * ddy
        if (d2 < 16) {
          const d = Math.sqrt(d2) + 1e-3,
            fall = 1 - d / 4
          // the pointer drags the liquid along and parts it a little
          sim.vx[i] += ptr.vx * 0.06 * fall + (ddx / d) * 0.0025 * fall
          sim.vy[i] += ptr.vy * 0.06 * fall + (ddy / d) * 0.0025 * fall
          if (ptr.hit) {
            sim.vx[i] += (ddx / d) * ptr.hit * fall
            sim.vy[i] += (ddy / d) * ptr.hit * fall
          }
        }
      }
    }
    ptr.hit = 0
    ptr.vx *= 0.9
    ptr.vy *= 0.9
  }

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) / CH / Hq,
      y = (1 - (e.clientY - r.top) / CH) / Hq
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    if (ptr.on && inside) {
      ptr.vx = (x - ptr.x) * 0.5
      ptr.vy = (y - ptr.y) * 0.5
    }
    ptr.x = x
    ptr.y = y
    ptr.on = inside
  }
  const onDown = (e: PointerEvent) => {
    onPointer(e)
    if (ptr.on) ptr.hit = 0.06
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })

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
  const uTime = gl.getUniformLocation(surface, 'uTime')

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
    gl.uniform1f(uTime, now / 1000)
    gl.bindVertexArray(qVao)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dTex)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    stop: () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onDown)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
    pluck: (g, toward) => {
      if (g < 0 || g >= G) return
      const L = layout()
      const b = toQ(L.body.x, L.body.y),
        t = toQ(toward.x, toward.y)
      // out of the body by about one and a half of its own radii, towards the point, for 1.6 s
      const dx = t.x - b.x,
        dy = t.y - b.y,
        d = Math.hypot(dx, dy) || 1
      const reach = Math.sqrt(groupsQ.reduce((s2, q) => s2 + q.r * q.r, 0)) * 2.2
      pluckX[g] = (b.x + (dx / d) * reach) / Hq
      pluckY[g] = (b.y + (dy / d) * reach) / Hq
      pluckUntil[g] = simT + 1.8
      regroupNow = true
    },
  }
}
