// Liquid physics in its own thread: the page draws smoothly even when a physics step takes longer
// than a frame (Safari without a JIT on iPad: ~28 ms per step). The worker steps at its own pace and
// sends particle positions back after every batch; the page interpolates between the last two states.
// Ported from cook/ciecz-czastki/worker.js. Added: `pause` (the page stops it while the hero is off screen).
import {
  createSim,
  type Sim,
  type SimCursor,
  type SimInit,
  type SimParams,
  STEPS_PER_SECOND,
} from './sim'

export interface PhysicsInMessage {
  init?: SimInit
  light?: boolean
  cur?: Partial<SimCursor>
  P?: Partial<SimParams>
  buf?: Float32Array
  pause?: boolean
}

export interface PhysicsOutMessage {
  ready?: boolean
  N?: number
  rebelN?: number
  pos?: Float32Array
  ms?: number
  steps?: number
  state?: { mainMass: number; mainX: number; mainY: number; pieces: number; pieceList: number[] }
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<PhysicsInMessage>) => void) | null
  postMessage: (message: PhysicsOutMessage, transfer?: Transferable[]) => void
}

const scope = self as unknown as WorkerScope

let sim: Sim | null = null
let light = false
let acc = 0
let tPrev = 0
let buf: Float32Array | null = null
let paused = false
let timer: ReturnType<typeof setTimeout> | null = null
const CUR_KEYS = ['x', 'y', 'vx', 'vy', 'inside', 'down', 'grabR', 'grabK'] as const

scope.onmessage = ({ data }) => {
  if (data.init) {
    sim = createSim(data.init)
    light = !!data.light
    if (light) {
      // light mode: no separate viscosity and XSPH, stronger damping instead
      sim.P.light = true
      sim.P.drag = 0.988
    }
    Object.assign(sim.cur, data.cur || {})
    scope.postMessage({ ready: true, N: sim.N, rebelN: sim.rebelN })
    tPrev = performance.now()
    tick()
    return
  }
  if (!sim) return
  if (data.cur) {
    const cur = sim.cur as unknown as Record<string, unknown>
    for (const k of CUR_KEYS) if (k in data.cur) cur[k] = data.cur[k]
    // a hit (click, tap) is one-shot: it must not get lost when it arrives between steps
    if (data.cur.impulse) sim.cur.impulse = Math.max(sim.cur.impulse, data.cur.impulse)
  }
  if (data.P) Object.assign(sim.P, data.P)
  if (data.buf) buf = data.buf // the page hands a buffer back for reuse
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

function tick() {
  timer = null
  if (!sim || paused) return
  const now = performance.now()
  acc += Math.min((now - tPrev) / 1000, 0.1) * STEPS_PER_SECOND
  tPrev = now
  const t0 = performance.now()
  let n = 0,
    steps = 0
  if (light) {
    // one step covering all the time that passed (up to 4 base steps), so the liquid does not slow down
    if (acc >= 0.5) {
      const d = Math.min(acc, 4)
      sim.step(d)
      acc -= d
      n = 1
      steps = d
    }
    if (acc > 4) acc = 0
  } else {
    while (acc >= 1 && n < 4) {
      sim.step()
      acc -= 1
      n++
    }
    steps = n
    if (n === 4) acc = Math.min(acc, 1)
  }
  if (n) send(performance.now() - t0, steps)
  // next step: right away if overdue; otherwise wait until its time comes
  const need = light ? 0.5 : 1
  timer = setTimeout(tick, acc >= need ? 0 : Math.max(0, ((need - acc) / STEPS_PER_SECOND) * 1000))
}

function send(ms: number, steps: number) {
  if (!sim) return
  const N = sim.N
  const pos = buf && buf.length === N * 2 ? buf : new Float32Array(N * 2)
  buf = null
  for (let i = 0; i < N; i++) {
    pos[i * 2] = sim.x[i]
    pos[i * 2 + 1] = sim.y[i]
  }
  const s = sim.state
  scope.postMessage(
    {
      pos,
      ms,
      steps,
      state: {
        mainMass: s.mainMass,
        mainX: s.mainX,
        mainY: s.mainY,
        pieces: s.pieces,
        pieceList: s.pieceList,
      },
    },
    [pos.buffer]
  )
}
