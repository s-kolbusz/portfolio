// The ready2order bundle as liquid (act 3). The physics is the hero's own particle simulation (sim.ts)
// with its pulls switched off. Each part of the bundle is a group of particles drawn towards its own
// target, and the scene moves the targets with the scroll: one body, taken apart into its parts, some
// parts drained away, the rest run together again. The liquid itself does the splitting and merging,
// so it looks like the hero's liquid and comes back together when the page scrolls up.
// The field runs on below the canvas: a drained part sinks there, out of sight, and can rise again.
// Rendering is a lean pass of its own: particles splatted into a density field (the hero's splat
// shaders), then the ground with the bundle's blocks and the liquid as green glass (SURFACE below).

import {
  BLUR_FRAGMENT,
  HEIGHT_FRAGMENT,
  JFA_DIST_FRAGMENT,
  JFA_INIT_FRAGMENT,
  JFA_STEP_FRAGMENT,
  SPLAT_FRAGMENT,
  SPLAT_VERTEX,
  VERTEX,
} from './shaders'
import { createSim, STEPS_PER_SECOND } from './sim'

/** a block drawn on the ground, in CSS px of the canvas; `a` is its opacity (0 = not drawn) */
export interface GroundRect {
  x: number
  y: number
  w: number
  h: number
  a: number
  dashed?: boolean
}

export interface DropsFrame {
  /** where each group is drawn to now, CSS px (y below the canvas height drains it out of sight) */
  targets: { x: number; y: number }[]
  /** up to eight blocks on the ground */
  rects: GroundRect[]
}

export interface DropsStageOptions {
  canvas: HTMLCanvasElement
  /** each group's size as the radius of a drop of its own, CSS px; all start as one body */
  groups: number[]
  /** where the one body stands at the start, CSS px */
  start: { x: number; y: number }
  /** read every animation frame */
  frame: () => DropsFrame
  onFail: () => void
}

export interface DropsStage {
  stop: () => void
}

const SPACING = 0.42
/** how far the field runs on below the canvas, in canvas heights: room for drained parts */
const BELOW = 0.6

// The ground and the liquid. The ground is ink with the bundle's blocks on it: the scene hands over
// up to eight rectangles (the whole bundle, its parts, the shelf of split-off screens, the old and the
// new size), each with an opacity and solid or dashed. They are drawn here, under the glass, so the
// liquid bends their lines like everything else under it.
// The liquid is the hero's own: its height comes from the distance to the edge and the hero's waves
// (HEIGHT_FRAGMENT in shaders.ts, run as a pass of its own), its edge rolls under over the same uneven
// band, and it takes the hero's window, Fresnel and highlights. Over ink it is coloured the way the
// hero colours its drop on the dark water sheet: green glass, with green reflections.
// Kept in step with main() in MAIN_FRAGMENT (shaders.ts): change the look there and here together.
const SURFACE = `#version 300 es
precision highp float;
uniform sampler2D uDens, uDist, uHgt;
uniform vec2 uRes, uHgtSize; uniform float uTime, uDH;
uniform vec4 uR[8]; uniform vec2 uRS[8]; uniform float uLW;
out vec4 o;
const float ISO = 0.38;
const vec3 GROUND = vec3(0.169, 0.149, 0.125);
const vec3 PAPER = vec3(0.984, 0.976, 0.957);
const vec3 TINT = vec3(0.03, 0.575, 0.363);
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3. - 2.*f);
  return mix(mix(hsh(i), hsh(i + vec2(1, 0)), u.x), mix(hsh(i + vec2(0, 1)), hsh(i + vec2(1, 1)), u.x), u.y); }
vec2 suv(vec2 q){ return vec2(q.x * uRes.y / uRes.x, q.y); }
float dens(vec2 q){ return texture(uDens, suv(q)).r; }
// the bundle's blocks: a one-pixel outline (dashed for what is gone or moved), a faint fill inside.
// Line width comes from the pixel size, not fwidth: ground() is also read under the refraction.
vec3 ground(vec2 q){
  vec3 c = GROUND;
  float line = 0.;
  for (int i = 0; i < 8; i++) {
    float a = uRS[i].x;
    if (a <= 0.) continue;
    vec2 lo = uR[i].xy, hi = uR[i].zw;
    vec2 ctr = (lo + hi) * 0.5, hs = (hi - lo) * 0.5;
    vec2 d = abs(q - ctr) - hs;
    float sd = length(max(d, 0.)) + min(max(d.x, d.y), 0.);
    float l = 1. - clamp(abs(sd) / uLW - 0.5, 0., 1.);
    // dashes: three pixels on, five off, along whichever edge this is
    if (uRS[i].y > 0.5) l *= step(fract((q.x + q.y) / (8. * uLW)), 0.4);
    line = max(line, l * a);
    if (sd < 0.) c += vec3(0.012, 0.011, 0.01) * a;
  }
  return mix(c, PAPER, line * 0.36);
}
// the hero's bicubic read of the height pass: smooth slopes, no grid from linear filtering
vec4 bicubic(sampler2D t, vec2 uv, vec2 size){
  uv = uv*size - 0.5; vec2 f = fract(uv); uv -= f;
  vec2 f2 = f*f, f3 = f2*f;
  vec2 w0 = (1.-f)*(1.-f)*(1.-f)/6., w1 = (4.-6.*f2+3.*f3)/6., w2 = (1.+3.*f+3.*f2-3.*f3)/6., w3 = f3/6.;
  vec2 s0 = w0+w1, s1 = w2+w3;
  vec2 c0 = (uv - 0.5 + w1/s0)/size, c1 = (uv + 1.5 + w3/s1)/size;
  return (texture(t, vec2(c0.x,c0.y))*s0.x + texture(t, vec2(c1.x,c0.y))*s1.x)*s0.y + (texture(t, vec2(c0.x,c1.y))*s0.x + texture(t, vec2(c1.x,c1.y))*s1.x)*s1.y;
}
float hgt(vec2 q){ return bicubic(uHgt, suv(q), uHgtSize).r; }
// the hero's window: its direction drifts over the surface, so each drop catches the light differently
vec3 env(vec3 r, vec2 q){
  vec3 L = normalize(vec3(-0.55 + 0.12*sin(q.y*7.+uTime*0.21), 0.62 + 0.08*cos(q.x*5.3-uTime*0.17), 0.56));
  vec3 c = mix(vec3(0.70,0.72,0.68), vec3(0.99,0.98,0.95), smoothstep(-0.35,0.45,r.y));
  c += vec3(1.25)*smoothstep(0.8,0.92, dot(r, L)) + vec3(0.25)*smoothstep(0.5,0.9, dot(r, L));
  c += vec3(0.5)*pow(max(dot(r, normalize(vec3(0.7,0.25,0.6))),0.),24.);
  return c;
}
void main(){
  vec2 q = gl_FragCoord.xy / uRes.y;
  // shadow and gathered light behind the liquid, as in the hero
  float sd = dens(q - vec2(0.012, -0.018));
  vec3 wall = ground(q)*(1. - 0.14*smoothstep(ISO*0.4, ISO*1.4, sd)) + TINT*smoothstep(ISO*1.4, 1.6, sd)*0.12;
  float f = dens(q);
  float fw = fwidth(f);
  float cover = smoothstep(ISO - max(fw*2., 0.02), ISO + max(fw*2., 0.02), f);
  if (cover <= 0.) { o = vec4(wall, 1.); return; }
  float e = 4.0 / uRes.y;
  float hx = hgt(q + vec2(e, 0.)) - hgt(q - vec2(e, 0.));
  float hy = hgt(q + vec2(0., e)) - hgt(q - vec2(0., e));
  vec3 n = normalize(vec3(-hx/(2.*e)*0.14, -hy/(2.*e)*0.14, 1.));
  // the edge rolls under, over a band whose width wanders along the edge
  float dE = texture(uDist, suv(q)).r / uDH;
  float wE = 0.011*(0.65 + 0.7*vnoise(q*7. + vec2(uTime*0.07, -uTime*0.05)));
  float curl = 1. - smoothstep(0., wE, dE);
  curl *= curl;
  n = normalize(vec3(n.xy*(1. + curl*7.), n.z*(1. - curl*0.92)));
  // green glass over ink: what is under it, bent and tinted (the hero's drop on its dark sheet)
  vec3 seen = ground(q - n.xy*0.028);
  vec3 body = (seen*vec3(0.55, 1.0, 0.76) + TINT*0.5)*(1. - 0.25*curl);
  float F = 0.02 + 0.98*pow(1. - max(n.z, 0.), 5.);
  vec3 r = reflect(vec3(0., 0., -1.), n);
  vec3 envC = env(r, q)*vec3(0.42, 0.8, 0.6);
  vec3 col = body*(1. - F*0.45) + envC*F*0.7*0.55;
  vec3 L = normalize(vec3(-0.55 + 0.12*sin(q.y*7.+uTime*0.21), 0.62 + 0.08*cos(q.x*5.3-uTime*0.17), 0.56));
  float sp = max(dot(r, L), 0.);
  col += vec3(1.)*(pow(sp, 5.)*0.07 + pow(sp, 24.)*0.08 + pow(sp, 220.)*0.6);
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

export function startDropsStage(opts: DropsStageOptions): DropsStage {
  try {
    return run(opts)
  } catch {
    opts.onFail()
    return { stop: () => {} }
  }
}

function run({ canvas, groups, start, frame: read }: DropsStageOptions): DropsStage {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const CW = canvas.clientWidth,
    CH = canvas.clientHeight
  const W = Math.round(CW * dpr),
    H = Math.round(CH * dpr)
  canvas.width = W
  canvas.height = H
  const A = CW / CH

  // --- the particles, in sim units (h), y up; the field starts BELOW canvas heights under the canvas
  // particle interaction radius in canvas heights: finer where the parts are small, so even a small part
  // has enough particles to come apart as a drop of its own
  const rMax = Math.max(...groups) / CH
  const Hq = Math.min(0.021, Math.max(0.012, rMax / 3.2))
  const toSim = (px: number, py: number) => ({ x: px / CH / Hq, y: (1 - py / CH + BELOW) / Hq })
  const G = groups.length
  const share = groups.map((r) => r * r)
  const totalR = Math.sqrt(share.reduce((s, v) => s + v, 0)) / CH / Hq
  const c0 = toSim(start.x, start.y)
  const pts: Array<[number, number]> = []
  const dy = (SPACING * Math.sqrt(3)) / 2
  for (let y = -totalR, row = 0; y <= totalR; y += dy, row++)
    for (let x = -totalR + ((row % 2) * SPACING) / 2; x <= totalR; x += SPACING)
      if (x * x + y * y <= totalR * totalR) pts.push([c0.x + x, c0.y + y])
  const sim = createSim({
    width: A / Hq,
    height: (1 + BELOW) / Hq,
    center: c0,
    radius: totalR * 1.08,
    spacing: SPACING,
  })
  const N = sim.N
  const used = pts.length
  // each group's share of the particles, by area
  const cap = new Int32Array(G)
  const sum = share.reduce((s, v) => s + v, 0)
  let given = 0
  for (let g = 0; g < G; g++) {
    cap[g] = g === G - 1 ? used - given : Math.round((used * share[g]) / sum)
    given += cap[g]
  }
  const group = new Int8Array(N).fill(-1)
  for (let i = 0; i < N; i++) {
    if (i < used) {
      sim.x[i] = pts[i][0]
      sim.y[i] = pts[i][1]
    } else {
      // the spare ones are parked in the far corner of the field, under the canvas
      sim.x[i] = 0.5
      sim.y[i] = 0.5
    }
    sim.vx[i] = 0
    sim.vy[i] = 0
  }
  // only the liquid's own forces: no pull to a main body, no return to the middle, no own weight;
  // the slow swirling stays, so the liquid never stands dead still
  Object.assign(sim.P, { pull: 0, anchor: 0, self: 0, cursorPull: 0, life: 0.0003 })

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
  // which keeps each part round instead of letting it trail behind as a thread
  const SPRING = 0.002,
    DAMP = 0.04,
    GATHER = 0.0005,
    GATHER_MAX = 0.02
  // which part a particle belongs to is decided again and again: each target takes the particles
  // nearest to it, up to its own share, so the body divides into clean pieces and never into threads
  const pairD = new Float32Array(used * G)
  const pairIdx = new Int32Array(used * G)
  const left = new Int32Array(G)
  const taken = new Uint8Array(used)
  function regroup() {
    for (let i = 0; i < used; i++) {
      for (let g = 0; g < G; g++) {
        const ddx = sim.x[i] - tx[g],
          ddy = sim.y[i] - ty[g]
        pairD[i * G + g] = ddx * ddx + ddy * ddy
        pairIdx[i * G + g] = i * G + g
      }
    }
    const idx = Array.from(pairIdx).sort((a, b) => pairD[a] - pairD[b])
    left.set(cap)
    taken.fill(0)
    for (const e of idx) {
      const i = (e / G) | 0,
        g = e % G
      if (taken[i] || left[g] <= 0) continue
      taken[i] = 1
      left[g]--
      group[i] = g
    }
  }
  let stepN = 0
  // re-dividing only while the targets move: at rest each drop keeps its own particles, so a drop whose
  // share differs a little from its size never draws a tail out of its neighbour
  const lastTx = new Float32Array(G).fill(NaN),
    lastTy = new Float32Array(G).fill(NaN)
  let still = 0
  // small parts gather hard, so they pinch off as whole drops instead of trailing out as threads
  const grip = share.map((v) => (v / sum < 0.03 ? 5 : 1))
  // the pointer, in sim units: it pushes the liquid it moves through, and a click splashes it
  const ptr = { x: -99, y: -99, vx: 0, vy: 0, on: false, hit: 0 }
  function steer(f: DropsFrame) {
    for (let g = 0; g < G; g++) {
      const t = f.targets[g] ? toSim(f.targets[g].x, f.targets[g].y) : c0
      tx[g] = t.x
      ty[g] = t.y
    }
    let moved = 0
    for (let g = 0; g < G; g++) {
      if (Number.isFinite(lastTx[g]))
        moved = Math.max(moved, Math.hypot(tx[g] - lastTx[g], ty[g] - lastTy[g]))
      lastTx[g] = tx[g]
      lastTy[g] = ty[g]
    }
    still = moved > 1e-3 ? 0 : still + 1
    if (stepN % 20 === 0 && (stepN === 0 || still < 60)) regroup()
    stepN++
    cx.fill(0)
    cy.fill(0)
    cvx.fill(0)
    cvy.fill(0)
    cn.fill(0)
    for (let i = 0; i < used; i++) {
      const g = group[i]
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
      const gk = GATHER * grip[g],
        gm = GATHER_MAX * (grip[g] > 1 ? 2 : 1)
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
    const p = toSim(e.clientX - r.left, e.clientY - r.top)
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    if (ptr.on && inside) {
      ptr.vx = (p.x - ptr.x) * 0.5
      ptr.vy = (p.y - ptr.y) * 0.5
    }
    ptr.x = p.x
    ptr.y = p.y
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

  // the hero's height: distance from the liquid's edge (jump flooding) at half the density resolution,
  // blurred so the ridge in the middle has no crease, then the height pass with the hero's waves
  const jfaInit = program(VERTEX, JFA_INIT_FRAGMENT),
    jfaStep = program(VERTEX, JFA_STEP_FRAGMENT),
    jfaDist = program(VERTEX, JFA_DIST_FRAGMENT),
    blur = program(VERTEX, BLUR_FRAGMENT),
    hgtPass = program(VERTEX, HEIGHT_FRAGMENT)
  const f32 = !!(gl.getExtension('EXT_float_blend') && gl.getExtension('OES_texture_float_linear'))
  const fl = f32 ? gl.FLOAT : gl.HALF_FLOAT
  const JW = Math.round(DW / 2),
    JH = Math.round(DH / 2)
  const target = (fmt: number, two: boolean, filter: number) => {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, JW, JH, 0, two ? gl.RG : gl.RED, fl, null)
    const fb = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error('distance field FBO incomplete')
    return { t, f: fb }
  }
  const RG = f32 ? gl.RG32F : gl.RG16F,
    R1 = f32 ? gl.R32F : gl.R16F
  const jA = target(RG, true, gl.NEAREST),
    jB = target(RG, true, gl.NEAREST),
    dRaw = target(R1, false, gl.NEAREST),
    dTmp = target(R1, false, gl.NEAREST),
    dOut = target(R1, false, gl.LINEAR),
    hOut = target(R1, false, gl.LINEAR)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const qVao = gl.createVertexArray()
  gl.bindVertexArray(qVao)
  gl.enableVertexAttribArray(gl.getAttribLocation(surface, 'aPos'))
  gl.vertexAttribPointer(gl.getAttribLocation(surface, 'aPos'), 2, gl.FLOAT, false, 0, 0)

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
  gl.uniform1i(gl.getUniformLocation(surface, 'uDens'), 0)
  gl.uniform1i(gl.getUniformLocation(surface, 'uDist'), 1)
  gl.uniform1i(gl.getUniformLocation(surface, 'uHgt'), 2)
  gl.uniform1f(gl.getUniformLocation(surface, 'uDH'), JH)
  gl.uniform2f(gl.getUniformLocation(surface, 'uHgtSize'), JW, JH)
  gl.uniform2f(gl.getUniformLocation(surface, 'uRes'), W, H)
  gl.uniform1f(gl.getUniformLocation(surface, 'uLW'), 1 / CH)
  const uTime = gl.getUniformLocation(surface, 'uTime')
  const uRL = gl.getUniformLocation(surface, 'uR'),
    uRSL = gl.getUniformLocation(surface, 'uRS')
  const rBox = new Float32Array(32),
    rStyle = new Float32Array(16)

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

  // as distanceField() in liquid-stage.ts, without the sheet's flood
  function distanceField(time: number) {
    gl.disable(gl.BLEND)
    gl.viewport(0, 0, JW, JH)
    gl.bindVertexArray(qVao)
    const pass = (
      prog: WebGLProgram,
      to: { f: WebGLFramebuffer },
      src: WebGLTexture | null,
      setup?: (p: WebGLProgram) => void
    ) => {
      gl.useProgram(prog)
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.f)
      gl.activeTexture(gl.TEXTURE3)
      gl.bindTexture(gl.TEXTURE_2D, src)
      gl.uniform1i(gl.getUniformLocation(prog, prog === jfaInit ? 'uD' : 'uS'), 3)
      if (setup) setup(prog)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    pass(jfaInit, jA, dTex, (p) => {
      gl.uniform1f(gl.getUniformLocation(p, 'uIso'), 0.38)
      gl.uniform1f(gl.getUniformLocation(p, 'uInv'), 0)
      gl.uniform2f(gl.getUniformLocation(p, 'uJ'), JW, JH)
    })
    let src = jA,
      dst = jB
    for (let st = 1 << (Math.ceil(Math.log2(Math.max(JW, JH))) - 1); st >= 1; st >>= 1) {
      pass(jfaStep, dst, src.t, (p) => {
        gl.uniform1i(gl.getUniformLocation(p, 'uStep'), st)
        gl.uniform2i(gl.getUniformLocation(p, 'uSize'), JW, JH)
      })
      ;[src, dst] = [dst, src]
    }
    pass(jfaDist, dRaw, src.t)
    pass(blur, dTmp, dRaw.t, (p) => gl.uniform2f(gl.getUniformLocation(p, 'uDir'), 1, 0))
    pass(blur, dOut, dTmp.t, (p) => gl.uniform2f(gl.getUniformLocation(p, 'uDir'), 0, 1))
    // the height, once per frame
    gl.useProgram(hgtPass)
    gl.bindFramebuffer(gl.FRAMEBUFFER, hOut.f)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, dOut.t)
    gl.uniform1i(gl.getUniformLocation(hgtPass, 'uDist'), 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dTex)
    gl.uniform1i(gl.getUniformLocation(hgtPass, 'uDens'), 0)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uDH'), JH)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uTime'), time)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uSpread'), 0)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uClarity'), 0)
    gl.uniform2f(gl.getUniformLocation(hgtPass, 'uJ'), JW, JH)
    gl.uniform2f(gl.getUniformLocation(hgtPass, 'uRes'), W, H)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, hOut.t)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, dOut.t)
  }

  function frame(now: number) {
    raf = 0
    if (!visible) return
    acc += Math.min((now - tPrev) / 1000, 0.05) * STEPS_PER_SECOND
    tPrev = now
    const f = read()
    let n = 0
    while (acc >= 1 && n < 4) {
      steer(f)
      sim.step()
      acc -= 1
      n++
    }
    if (acc > 4) acc = 0
    for (let i = 0; i < used; i++) {
      pos[i * 2] = sim.x[i] * Hq
      pos[i * 2 + 1] = sim.y[i] * Hq - BELOW
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
    distanceField(now / 1000)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, W, H)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(surface)
    gl.uniform1f(uTime, now / 1000)
    // the blocks, in the shader's units (canvas heights, y up)
    rBox.fill(0)
    rStyle.fill(0)
    f.rects.slice(0, 8).forEach((r, i) => {
      rBox.set([r.x / CH, 1 - (r.y + r.h) / CH, (r.x + r.w) / CH, 1 - r.y / CH], i * 4)
      rStyle.set([r.a, r.dashed ? 1 : 0], i * 2)
    })
    gl.uniform4fv(uRL, rBox)
    gl.uniform2fv(uRSL, rStyle)
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
  }
}
