// The ready2order liquid's physics in its own thread, after physics.worker.ts (the hero's): the page
// scrolls and draws smoothly however long a physics step takes. The page sends where each group is
// drawn to and what the pointer does; the worker steps at its own pace and sends particle positions
// back after every batch. Each part of the bundle is a group of particles steered to its own target.
import { createSim, type Sim, STEPS_PER_SECOND } from './sim'

export interface DropsInit {
  /** field size and the one body at the start, in sim units */
  width: number
  height: number
  start: { x: number; y: number }
  /** radius of the one body, sim units */
  radius: number
  spacing: number
  /** each group's share of the particles (any scale) */
  share: number[]
}

export interface DropsInMessage {
  init?: DropsInit
  /** targets in sim units, x then y per group */
  targets?: Float32Array
  pointer?: { x: number; y: number; vx: number; vy: number; on: boolean; hit: number }
  buf?: Float32Array
  pause?: boolean
  /** ?lekko: light physics from the start (to check it on a fast machine) */
  light?: boolean
}

export interface DropsOutMessage {
  ready?: boolean
  used?: number
  pos?: Float32Array
  /** physics steps since the last positions, and the ms they took (for the ?pomiar readout) */
  steps?: number
  ms?: number
  /** the physics runs light: fewer, bigger steps (see `light` below) */
  light?: boolean
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<DropsInMessage>) => void) | null
  postMessage: (message: DropsOutMessage, transfer?: Transferable[]) => void
}

const scope = self as unknown as WorkerScope

// the group as a whole is steered to its target; every particle is also drawn to it a little,
// which keeps each part round instead of letting it trail behind as a thread
const SPRING = 0.002,
  DAMP = 0.04,
  GATHER = 0.0005,
  GATHER_MAX = 0.02

let sim: Sim | null = null
let used = 0
let G = 0
let group = new Int8Array(0)
let cap = new Int32Array(0)
let grip: number[] = []
let tx = new Float32Array(0),
  ty = new Float32Array(0)
let cx = new Float32Array(0),
  cy = new Float32Array(0),
  cvx = new Float32Array(0),
  cvy = new Float32Array(0),
  cn = new Float32Array(0)
let ax = new Float32Array(0),
  ay = new Float32Array(0)
let lastTx = new Float32Array(0),
  lastTy = new Float32Array(0)
let pairD = new Float32Array(0)
let order = new Uint32Array(0)
let taken = new Uint8Array(0)
const left = { v: new Int32Array(0) }
let stepN = 0,
  still = 0
const ptr = { x: -99, y: -99, vx: 0, vy: 0, on: false, hit: 0 }
let acc = 0,
  tPrev = 0,
  paused = false,
  timer: ReturnType<typeof setTimeout> | null = null,
  buf: Float32Array | null = null
// Light physics, as the hero's on slow devices: one bigger step covering up to 4 base steps, without the
// separate viscosity and smoothing passes. Same particles, same drawing, still real liquid. It switches
// on when full steps cost too much compute to keep 120 a second: the owner's iPad took 84.5 ms a step
// (Mac WebKit 2 ms), and the round discs that stood in for the liquid there were rejected (2026-11-18).
let light = false
const timing = { skip: 0, n: 0, ms: 0 }
const LIGHT_MS = 6.5 // ms a full step may cost: 120 of them take 780 ms of every second

function init(d: DropsInit) {
  const dy = (d.spacing * Math.sqrt(3)) / 2
  const pts: Array<[number, number]> = []
  const r = d.radius
  for (let y = -r, row = 0; y <= r; y += dy, row++)
    for (let x = -r + ((row % 2) * d.spacing) / 2; x <= r; x += d.spacing)
      if (x * x + y * y <= r * r) pts.push([d.start.x + x, d.start.y + y])
  sim = createSim({
    width: d.width,
    height: d.height,
    center: d.start,
    // the sim lays out the same lattice: exactly the particles used, none parked on one point
    radius: r,
    spacing: d.spacing,
  })
  // only the liquid's own forces: no pull to a main body, no return to the middle, no own weight;
  // the slow swirling stays, so the liquid never stands dead still
  Object.assign(sim.P, { pull: 0, anchor: 0, self: 0, cursorPull: 0, life: 0.0003 })
  if (light) goLight()
  used = pts.length
  G = d.share.length
  const N = sim.N
  for (let i = 0; i < N; i++) {
    // the spare particles are parked in the far corner of the field, under the canvas
    sim.x[i] = i < used ? pts[i][0] : 0.5
    sim.y[i] = i < used ? pts[i][1] : 0.5
    sim.vx[i] = 0
    sim.vy[i] = 0
  }
  const sum = d.share.reduce((s, v) => s + v, 0)
  cap = new Int32Array(G)
  let given = 0
  for (let g = 0; g < G; g++) {
    cap[g] = g === G - 1 ? used - given : Math.round((used * d.share[g]) / sum)
    given += cap[g]
  }
  // small parts gather hard, so they pinch off as whole drops instead of trailing out as threads
  grip = d.share.map((v) => (v / sum < 0.03 ? 5 : 1))
  group = new Int8Array(N).fill(-1)
  for (let i = 0; i < used; i++) group[i] = 0
  tx = new Float32Array(G).fill(d.start.x)
  ty = new Float32Array(G).fill(d.start.y)
  cx = new Float32Array(G)
  cy = new Float32Array(G)
  cvx = new Float32Array(G)
  cvy = new Float32Array(G)
  cn = new Float32Array(G)
  ax = new Float32Array(G)
  ay = new Float32Array(G)
  lastTx = new Float32Array(G).fill(NaN)
  lastTy = new Float32Array(G).fill(NaN)
  pairD = new Float32Array(used * G)
  order = new Uint32Array(used * G)
  taken = new Uint8Array(used)
  left.v = new Int32Array(G)
  stepN = 0
  still = 0
}

// which part a particle belongs to is decided again while the targets move: each target takes the
// particles nearest to it, up to its own share, so the body divides into clean pieces, never threads
function regroup() {
  if (!sim) return
  for (let i = 0; i < used; i++) {
    for (let g = 0; g < G; g++) {
      const ddx = sim.x[i] - tx[g],
        ddy = sim.y[i] - ty[g]
      pairD[i * G + g] = ddx * ddx + ddy * ddy
      order[i * G + g] = i * G + g
    }
  }
  order.sort((a, b) => pairD[a] - pairD[b])
  left.v.set(cap)
  taken.fill(0)
  for (let k = 0; k < order.length; k++) {
    const e = order[k]
    const i = (e / G) | 0,
      g = e % G
    if (taken[i] || left.v[g] <= 0) continue
    taken[i] = 1
    left.v[g]--
    group[i] = g
  }
}

function goLight() {
  light = true
  if (!sim) return
  // no separate viscosity and XSPH, stronger damping instead (as the hero's light mode)
  sim.P.light = true
  sim.P.drag = 0.988
}

// d = how many base steps this step covers: the steering forces scale with it
function steer(d: number) {
  if (!sim) return
  // re-dividing only while the targets move: at rest each drop keeps its own particles, so a drop whose
  // share differs a little from its size never draws a tail out of its neighbour
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
  const N = sim.N
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
    sim.vx[i] += (ax[g] + gx) * d
    sim.vy[i] += (ay[g] + gy) * d
    if (ptr.on) {
      const ddx = sim.x[i] - ptr.x,
        ddy = sim.y[i] - ptr.y
      const d2 = ddx * ddx + ddy * ddy
      if (d2 < 16) {
        const dd = Math.sqrt(d2) + 1e-3,
          fall = 1 - dd / 4
        // the pointer drags the liquid along and parts it a little
        sim.vx[i] += (ptr.vx * 0.06 * fall + (ddx / dd) * 0.0025 * fall) * d
        sim.vy[i] += (ptr.vy * 0.06 * fall + (ddy / dd) * 0.0025 * fall) * d
        if (ptr.hit) {
          sim.vx[i] += (ddx / dd) * ptr.hit * fall
          sim.vy[i] += (ddy / dd) * ptr.hit * fall
        }
      }
    }
  }
  ptr.hit = 0
  ptr.vx *= Math.pow(0.9, d)
  ptr.vy *= Math.pow(0.9, d)
}

scope.onmessage = ({ data }) => {
  if (data.init) {
    if (data.light) light = true
    init(data.init)
    scope.postMessage({ ready: true, used })
    tPrev = performance.now()
    tick()
    return
  }
  if (!sim) return
  if (data.targets) {
    for (let g = 0; g < G; g++) {
      tx[g] = data.targets[g * 2]
      ty[g] = data.targets[g * 2 + 1]
    }
    // the page sends targets every frame: each one also drives the steps due by now. In Low Power
    // Mode Safari throttles this thread's own timers, and the liquid got 12 of its 120 steps a second
    // (owner's iPad, 2026-11-18); frames still come at 30 a second.
    // Only a message that arrives after the thread has had a breather steps: when a step takes long
    // (84.5 ms on the owner's iPad), the messages that queued up meanwhile only update the targets.
    // Stepping on each of them built a backlog, and the liquid chased targets seconds old.
    if (!paused && performance.now() - tEnd > 2) {
      if (timer) clearTimeout(timer)
      timer = null
      tick()
    }
  }
  if (data.pointer) {
    const hit = Math.max(ptr.hit, data.pointer.hit)
    Object.assign(ptr, data.pointer)
    ptr.hit = hit // a click is one-shot: it must not get lost between steps
  }
  if (data.buf) buf = data.buf
  if (data.pause !== undefined && data.pause !== paused) {
    paused = data.pause
    if (paused) {
      if (timer) clearTimeout(timer)
      timer = null
    } else {
      tPrev = performance.now()
      acc = 0
      tick()
    }
  }
}

let stepped = 0,
  spent = 0,
  tEnd = 0

function tick() {
  timer = null
  if (!sim || paused) return
  const now = performance.now()
  acc += Math.min((now - tPrev) / 1000, 0.1) * STEPS_PER_SECOND
  tPrev = now
  let n = 0,
    steps = 0
  const t0 = performance.now()
  if (light) {
    // one step covering all the time that passed (up to 4 base steps), so the liquid does not slow down
    if (acc >= 0.5) {
      const d = Math.min(acc, 4)
      steer(d)
      sim.step(d)
      acc -= d
      n = 1
      steps = d
    }
    if (acc > 4) acc = 0
  } else {
    // up to 8 steps at a time: at 30 frames a second each frame owes 4
    while (acc >= 1 && n < 8) {
      steer(1)
      sim.step()
      acc -= 1
      n++
    }
    steps = n
    if (n === 8) acc = Math.min(acc, 1)
  }
  const ms = performance.now() - t0
  stepped += steps
  spent += ms
  // the cost of a full step, measured on compute time (not on how often this thread is woken up),
  // after the first 10 steps (the code is still being compiled then), over the next 20 or one second
  // of compute, whichever comes first (a slow device decides in about a second, not in eight)
  if (!light && n) {
    if (timing.skip < 10) timing.skip += n
    else {
      timing.n += n
      timing.ms += ms
      if (timing.n >= 20 || (timing.ms > 1000 && timing.n >= 4)) {
        if (timing.ms / timing.n > LIGHT_MS) goLight()
        timing.n = timing.ms = 0
      }
    }
  }
  if (n) send()
  tEnd = performance.now()
  const need = light ? 0.5 : 1
  timer = setTimeout(tick, acc >= need ? 0 : Math.max(0, ((need - acc) / STEPS_PER_SECOND) * 1000))
}

function send() {
  if (!sim) return
  const pos = buf && buf.length === used * 2 ? buf : new Float32Array(used * 2)
  buf = null
  for (let i = 0; i < used; i++) {
    pos[i * 2] = sim.x[i]
    pos[i * 2 + 1] = sim.y[i]
  }
  scope.postMessage({ pos, steps: stepped, ms: spent, light }, [pos.buffer])
  stepped = 0
  spent = 0
}
