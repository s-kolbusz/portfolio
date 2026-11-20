// Particle liquid: viscoelastic fluid after Clavet et al. (2005), double density relaxation,
// plus velocity smoothing (XSPH) so the liquid does not tremble.
// Units: length = interaction radius h, time = one step (120 steps per second).
// Mass attracts mass: the main body pulls torn-off drops with a force that scales with its mass.
// The "rebel" is a small drop stuck to the cursor. It belongs to the same liquid, so it pushes,
// drags and bends everything it passes through, and gently pulls torn-off drops.
// Ported 1:1 from cook/ciecz-czastki/sim.js (the accepted test page); keep the numbers in sync.

export const STEPS_PER_SECOND = 120

export interface SimPoint {
  x: number
  y: number
}

export interface SimInit {
  width: number
  height: number
  center: SimPoint
  radius: number
  spacing?: number
  rebelAt?: SimPoint | null
  rebelRadius?: number
}

export interface SimCursor {
  x: number
  y: number
  vx: number
  vy: number
  inside: boolean
  down: boolean
  impulse: number
  grabR?: number
  grabK?: number
  homeToBody?: boolean
  home: SimPoint | null
  tx: number
  ty: number
}

export interface SimParams {
  rho0: number
  rho0Scale: number
  k: number
  kNear: number
  sigma: number
  beta: number
  xsph: number
  drag: number
  pull: number
  anchor: number
  cursorPull: number
  life: number
  shapeGain: number
  shapeMax: number
  shapeK: number
  rebelLife: number
  tether: number
  self: number
  anchorDamp?: number
  spread?: number
  light?: boolean
  relaxPow?: number
  maxMove?: number
  gx?: number
  gy?: number
}

export interface SimState {
  mainMass: number
  mainX: number
  mainY: number
  mainVX: number
  mainVY: number
  pieces: number
  pieceList: number[]
  inMain: Uint8Array
}

export interface Sim {
  N: number
  rebelN: number
  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array
  cur: SimCursor
  state: SimState
  rebel: { x: number; y: number; mass: number }
  P: SimParams
  step: (dt?: number) => void
  clusters: () => void
}

export function createSim({
  width,
  height,
  center,
  radius,
  spacing = 0.42,
  rebelAt,
  rebelRadius = 2.3,
}: SimInit): Sim {
  const pts: Array<[number, number]> = []
  const isRebel: number[] = []
  const dy = (spacing * Math.sqrt(3)) / 2
  const disk = (c: SimPoint, r: number, rebel: boolean) => {
    for (let y = -r, row = 0; y <= r; y += dy, row++) {
      for (let x = -r + ((row % 2) * spacing) / 2; x <= r; x += spacing) {
        if (x * x + y * y <= r * r) {
          pts.push([c.x + x, c.y + y])
          isRebel.push(rebel ? 1 : 0)
        }
      }
    }
  }
  disk(center, radius, false)
  if (rebelAt) disk(rebelAt, rebelRadius, true)
  const N = pts.length
  const restR = radius * 1.08
  const rebel = Uint8Array.from(isRebel)
  const rebelN = isRebel.reduce((a, b) => a + b, 0)
  const x = new Float32Array(N),
    y = new Float32Array(N)
  const px = new Float32Array(N),
    py = new Float32Array(N)
  const vx = new Float32Array(N),
    vy = new Float32Array(N)
  const sx = new Float32Array(N),
    sy = new Float32Array(N),
    wsA = new Float32Array(N)
  const rhoA = new Float32Array(N),
    rhoNA = new Float32Array(N),
    pA = new Float32Array(N),
    pNA = new Float32Array(N)
  pts.forEach(([a, b], i) => {
    x[i] = a
    y[i] = b
  })

  // neighbourhood grid (cell = h)
  const GW = Math.ceil(width) + 4,
    GH = Math.ceil(height) + 4
  const head = new Int32Array(GW * GH),
    next = new Int32Array(N),
    cellOf = new Int32Array(N)
  function rebuild() {
    head.fill(-1)
    for (let i = 0; i < N; i++) {
      const cx = Math.min(GW - 1, Math.max(0, Math.floor(x[i]) + 2))
      const cy = Math.min(GH - 1, Math.max(0, Math.floor(y[i]) + 2))
      // (| 0: a particle that is not a number lands in the first cell instead of breaking the lists)
      const c = (cy * GW + cx) | 0
      cellOf[i] = c
      next[i] = head[c]
      head[c] = i
    }
  }
  function forNeighbors(i: number, fn: (j: number, r: number, dx: number, dy: number) => void) {
    const cx = Math.floor(x[i]) + 2,
      cy = Math.floor(y[i]) + 2
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      if (gy < 0 || gy >= GH) continue
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        if (gx < 0 || gx >= GW) continue
        for (let j = head[gy * GW + gx]; j !== -1; j = next[j]) {
          if (j === i) continue
          const ddx = x[j] - x[i],
            ddy = y[j] - y[i]
          const r2 = ddx * ddx + ddy * ddy
          if (r2 >= 1) continue
          fn(j, Math.sqrt(r2), ddx, ddy)
        }
      }
    }
  }

  // The pairs that touch (closer than one radius), found once a step, right after moving, with their
  // distance and direction: relaxation walks only these, and viscosity and smoothing reuse the distance
  // instead of measuring every pair again. Each pair is met once, under one of its two particles: the
  // rest of its own cell after it, plus four of the eight cells around (right, and the three above).
  // A particle's pairs lie next to each other (pS[i] … pS[i + 1]), so every pass over the pairs keeps
  // that particle's own numbers in hand instead of reading and writing them for each pair, and the
  // search adds up the densities as it goes (2026-11-20: the iPad spent 75–143 ms a step, nearly all
  // of it in these passes)
  const MAXN = 48
  const pS = new Int32Array(N + 1),
    pJ = new Int32Array(N * MAXN),
    pQ = new Float32Array(N * MAXN),
    pUX = new Float32Array(N * MAXN),
    pUY = new Float32Array(N * MAXN)
  // the four cells ahead: the one to the right, then the row above from left to right
  const FWD = [1, GW - 1, GW, GW + 1]
  const CELLS = GW * GH
  function findPairs(dirs: boolean) {
    rebuild()
    rhoA.fill(0)
    rhoNA.fill(0)
    let np = 0
    for (let i = 0; i < N; i++) {
      pS[i] = np
      const xi = x[i],
        yi = y[i],
        ci = cellOf[i],
        end = np + MAXN
      let ri = rhoA[i],
        rni = rhoNA[i]
      // the cells sit two in from every edge of the grid, so a cell ahead is never across an edge
      for (let f = -1; f < 4 && np < end; f++) {
        let j
        if (f < 0) j = next[i]
        else {
          const c = ci + FWD[f]
          if (c >= CELLS) break
          j = head[c]
        }
        for (; j !== -1 && np < end; j = next[j]) {
          const ddx = x[j] - xi,
            ddy = y[j] - yi,
            r2 = ddx * ddx + ddy * ddy
          if (r2 >= 1) continue
          const q = Math.sqrt(r2),
            a = 1 - q,
            a2 = a * a,
            a3 = a2 * a
          ri += a2
          rni += a3
          rhoA[j] += a2
          rhoNA[j] += a3
          if (r2 < 1e-12) continue
          pJ[np] = j
          pQ[np] = q
          if (dirs) {
            pUX[np] = ddx / q
            pUY[np] = ddy / q
          }
          np++
        }
      }
      rhoA[i] = ri
      rhoNA[i] = rni
    }
    pS[N] = np
  }

  // clusters: union-find, computed every few steps (without the rebel)
  const parent = new Int32Array(N),
    label = new Int32Array(N),
    sizeOf = new Int32Array(N),
    roots = new Int32Array(N)
  const find = (a: number) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  const state: SimState = {
    mainMass: N - rebelN,
    mainX: center.x,
    mainY: center.y,
    mainVX: 0,
    mainVY: 0,
    pieces: 0,
    pieceList: [],
    inMain: Uint8Array.from(rebel, (r) => 1 - r),
  }

  const P: SimParams = {
    // values tuned with headless tests (cook/ciecz-czastki/test-sim.mjs, sweep.mjs)
    rho0: 0,
    rho0Scale: 1.45,
    k: 0.03,
    kNear: 0.1,
    sigma: 0.09,
    beta: 0.2,
    xsph: 0.1, // velocity smoothing between neighbours: less trembling
    drag: 0.993, // viscosity of the medium
    pull: 0.003, // the body pulls torn-off drops (× body mass / N)
    anchor: 0.00008, // the body returns to the middle of the frame
    cursorPull: 0.0012, // the rebel pulls torn-off drops
    life: 0.0003, // slow, spontaneous swirls: the liquid never stands dead still
    shapeGain: 3.5,
    shapeMax: 0.55,
    shapeK: 0.003, // the cursor drop stretches as it moves
    rebelLife: 0.006, // how much the cursor drop changes shape on its own
    tether: 0.0045, // how firmly the rebel holds on to the cursor
    self: 0.00015, // the body's own weight (pulls back together after stretching)
  }

  rebuild()
  {
    let sum = 0,
      cnt = 0
    for (let i = 0; i < N; i++) {
      if (rebel[i]) continue
      const ddx = x[i] - center.x,
        ddy = y[i] - center.y
      if (ddx * ddx + ddy * ddy > (radius * 0.5) ** 2) continue
      let rho = 0
      forNeighbors(i, (_j, q) => {
        rho += (1 - q) * (1 - q)
      })
      sum += rho
      cnt++
    }
    P.rho0 = (sum / cnt) * P.rho0Scale
  }

  const cur: SimCursor = {
    x: -99,
    y: -99,
    vx: 0,
    vy: 0,
    inside: false,
    down: false,
    impulse: 0,
    home: rebelAt ? { ...rebelAt } : null,
    tx: rebelAt?.x ?? 0,
    ty: rebelAt?.y ?? 0,
  }
  const rebelState = { x: rebelAt?.x ?? 0, y: rebelAt?.y ?? 0, mass: rebelN }

  let rebelGrip = 1
  const grip = new Float32Array(N).fill(1),
    fragMul = new Float32Array(N).fill(1),
    fragTime = new Float32Array(N).fill(0.7)
  // dt = how many base steps (1/120 s) this step covers: light mode takes one bigger step instead of several small ones
  let simTime = 0
  function step(dt = 1) {
    simTime += dt
    const t = simTime
    const dragDt = Math.pow(P.drag, dt)
    const relaxDt = Math.pow(dt, P.relaxPow ?? 0)
    const M = state.mainMass / (N - rebelN)
    // the rebel's target: the cursor, and without a cursor the place it was left
    if (cur.inside) {
      cur.tx = cur.x
      cur.ty = cur.y
    }
    // on touch, without a finger, the cursor drop returns to the body and hides in it
    else if (cur.homeToBody) {
      cur.tx = state.mainX
      cur.ty = state.mainY
    }
    // the rebel's centre (to pull drops)
    let rx = 0,
      ry = 0
    for (let i = N - rebelN; i < N; i++) {
      rx += x[i]
      ry += y[i]
    }
    if (rebelN) {
      rebelState.x = rx / rebelN
      rebelState.y = ry / rebelN
    }

    for (let i = 0; i < N; i++) {
      let ax = 0,
        ay = 0
      if (rebel[i]) {
        // the rebel holds on to the cursor like a spring, with a delay, so it stretches out in fast moves.
        // Its front (in the direction of motion) holds tighter, the back trails: the faster, the longer.
        // After a click it lets go for a moment, splashes and gathers back.
        const ox = x[i] - rebelState.x,
          oy = y[i] - rebelState.y,
          od = Math.hypot(ox, oy) || 1
        const sp = Math.hypot(cur.vx, cur.vy)
        const along = cur.inside && sp > 0.005 ? (ox * cur.vx + oy * cur.vy) / (od * sp) : 0
        const stretch = Math.min(sp * 6, 0.85)
        // fragments come back at their own pace after a click: small and light quickly, big and heavy slowly
        const g = grip[i]
        const k = P.tether * (1 + along * stretch * 0.25) * g * fragMul[i]
        ax += (cur.tx - x[i]) * k
        ay += (cur.ty - y[i]) * k
        // shape: along the motion the drop lengthens, across it narrows, the back stays longer (a teardrop)
        if (sp > 0.005 && cur.inside) {
          const ux = cur.vx / sp,
            uy = cur.vy / sp
          const pa = ox * ux + oy * uy,
            pp = -ox * uy + oy * ux
          const e = Math.min(sp * P.shapeGain, P.shapeMax)
          const ta = pa * (1 + e) * (pa < 0 ? 1.25 : 0.85),
            tp = pp / (1 + e * 0.6)
          const tx = ta * ux - tp * uy,
            ty = ta * uy + tp * ux
          ax += (tx - ox) * P.shapeK * rebelGrip
          ay += (ty - oy) * P.shapeK * rebelGrip
        }
        // the cursor drop's life: slowly wandering lobes, so at rest it is not a round button
        const th = Math.atan2(oy, ox),
          tt = simTime / STEPS_PER_SECOND
        const lobe =
          Math.sin(3 * th + tt * 0.9) +
          0.6 * Math.sin(5 * th - tt * 1.4 + 1.3) +
          0.4 * Math.sin(2 * th + tt * 0.5)
        const lr = P.rebelLife * lobe * Math.min(od / 2, 1)
        ax += (ox / od) * lr
        ay += (oy / od) * lr
        const m = Math.min(1, 0.06 * g * dt)
        vx[i] += ((cur.inside ? cur.vx : 0) - vx[i]) * m
        vy[i] += ((cur.inside ? cur.vy : 0) - vy[i]) * m
      } else if (state.inMain[i]) {
        // braking of the whole body (P.anchorDamp): weaker while tilting, so the liquid flows faster the more it is tipped
        // spreading into the sheet (P.spread 0…1): the body stops returning to the middle and holding together
        const ad = P.anchorDamp ?? 0.02,
          free = 1 - (P.spread || 0)
        ax += ((center.x - state.mainX) * P.anchor - state.mainVX * ad) * free
        ay += ((center.y - state.mainY) * P.anchor - state.mainVY * ad) * free
        // the body's own weight: stretched parts pull back towards the centre of mass
        if (P.self !== 0) {
          const ox = x[i] - state.mainX,
            oy = y[i] - state.mainY,
            od = Math.hypot(ox, oy)
          if (od > restR * 0.45) {
            const g = (P.self * free * (od - restR * 0.45)) / od
            ax -= ox * g
            ay -= oy * g
          }
        }
        // life: smooth, large swirls inside the body
        const s = P.life
        ax += s * Math.sin(y[i] * 0.16 + t * 0.011) * Math.cos(x[i] * 0.11 - t * 0.008)
        ay += s * Math.cos(x[i] * 0.14 - t * 0.009) * Math.sin(y[i] * 0.12 + t * 0.007)
      } else {
        // a torn-off drop: the body pulls it, the weaker the less of it is left; stronger up close (merging)
        if (P.pull !== 0) {
          const ddx = state.mainX - x[i],
            ddy = state.mainY - y[i]
          const d = Math.max(Math.hypot(ddx, ddy), 3)
          const g = (P.pull * M * 6) / Math.sqrt(d)
          ax += (ddx / d) * g
          ay += (ddy / d) * g
        }
        // the rebel pulls it gently too
        if (P.cursorPull !== 0) {
          const bx = rebelState.x - x[i],
            by = rebelState.y - y[i],
            bd = Math.hypot(bx, by)
          if (bd < 16 && bd > 2) {
            const s = (P.cursorPull * (rebelState.mass / 100)) / bd
            ax += bx * s
            ay += by * s
          }
        }
      }

      if (cur.inside && rebel[i] && cur.impulse > 0) {
        // a click breaks the cursor drop too
        const ddx = cur.x - x[i],
          ddy = cur.y - y[i],
          d = Math.hypot(ddx, ddy) || 0.01
        const w = Math.max(1 - d / 4.5, 0.25)
        vx[i] -= (ddx / d) * w * cur.impulse * 0.9
        vy[i] -= (ddy / d) * w * cur.impulse * 0.9
      }
      if (cur.inside && !rebel[i]) {
        const ddx = cur.x - x[i],
          ddy = cur.y - y[i]
        const d = Math.hypot(ddx, ddy)
        // cursor motion drags the liquid, the more the faster it moves
        const Rc = 3.2
        if (d < Rc) {
          const w = (1 - d / Rc) ** 2
          const wd = Math.min(1, w * 0.22 * dt)
          vx[i] += (cur.vx - vx[i]) * wd
          vy[i] += (cur.vy - vy[i]) * wd
        }
        // holding down: grabs the liquid
        if (cur.down && d < (cur.grabR ?? 3.5) && d > 0.05) {
          const R = cur.grabR ?? 3.5
          const w = (1 - d / R) * (cur.grabK ?? 0.06)
          ax += ddx * w
          ay += ddy * w
        }
        // click / tap: the hit splashes the liquid away from the point
        if (cur.impulse > 0 && d < 4.5 && d > 0.01) {
          const w = 1 - d / 4.5
          vx[i] -= (ddx / d) * w * cur.impulse
          vy[i] -= (ddy / d) * w * cur.impulse
        }
      }
      // device tilt: gentle gravity towards the tilt (the liquid only, not the cursor drop)
      if (!rebel[i]) {
        ax += P.gx || 0
        ay += P.gy || 0
      }
      vx[i] += ax * dt
      vy[i] += ay * dt
      vx[i] *= dragDt
      vy[i] *= dragDt
    }
    const clicked = cur.impulse > 0
    if (clicked) rebelGrip = 0
    cur.impulse = 0
    rebelGrip = Math.min(1, rebelGrip + dt / (STEPS_PER_SECOND * 0.7))
    for (let i = N - rebelN; i < N; i++)
      grip[i] = clicked ? 0 : Math.min(1, grip[i] + dt / (STEPS_PER_SECOND * fragTime[i]))

    // viscosity, on the touching pairs of the last step (they have barely moved since)
    // light mode: no separate viscosity
    if (!P.light) {
      const sig = P.sigma * 0.5 * dt,
        bet = P.beta * 0.5 * dt
      for (let i = 0; i < N; i++) {
        const e = pS[i + 1]
        let p = pS[i]
        if (p === e) continue
        let vxi = vx[i],
          vyi = vy[i]
        for (; p < e; p++) {
          const j = pJ[p],
            ux = pUX[p],
            uy = pUY[p]
          const u = (vxi - vx[j]) * ux + (vyi - vy[j]) * uy
          if (u > 0) {
            // never more than stops the pair's approach: with a big step (ready2order's light steps
            // reach 30) a bigger impulse turned the approach around, grew from pair to pair and ended
            // in numbers that are not numbers (2026-11-20). A base step never comes near this limit.
            const I = Math.min((1 - pQ[p]) * (sig * u + bet * u * u), 0.5 * u)
            vxi -= I * ux
            vyi -= I * uy
            vx[j] += I * ux
            vy[j] += I * uy
          }
        }
        vx[i] = vxi
        vy[i] = vyi
      }
    }
    // move
    // one move may not jump more than P.maxMove radii: with a big step (light mode) the liquid does not splash apart
    const vmax = Math.min(0.6, (P.maxMove ?? 0.6) / dt),
      vmax2 = vmax * vmax,
      xMax = width - 0.5,
      yMax = height - 0.5
    for (let i = 0; i < N; i++) {
      let xi = x[i],
        yi = y[i],
        vxi = vx[i],
        vyi = vy[i]
      px[i] = xi
      py[i] = yi
      const s2 = vxi * vxi + vyi * vyi
      if (s2 > vmax2) {
        const m = vmax / Math.sqrt(s2)
        vx[i] = vxi *= m
        vy[i] = vyi *= m
      }
      xi += vxi * dt
      yi += vyi * dt
      x[i] = xi < 0.5 ? 0.5 : xi > xMax ? xMax : xi
      y[i] = yi < 0.5 ? 0.5 : yi > yMax ? yMax : yi
    }
    // the touching pairs and the densities, then double density relaxation: displacements (pairs)
    findPairs(!P.light)
    const doClusters = Math.floor(t / 6) !== Math.floor((t - dt) / 6)
    if (doClusters) for (let i = 0; i < N; i++) parent[i] = i
    // while spreading the liquid wants a looser packing, so it pushes itself out evenly in all directions (up to ~3× the area)
    // relaxation: stronger with a bigger step (P.relaxPow), so cohesion per second stays similar
    const rho0 = P.rho0 * (1 - 0.7 * (P.spread || 0)),
      half = 0.25 * relaxDt
    for (let i = 0; i < N; i++) {
      pA[i] = P.k * (rhoA[i] - (rebel[i] ? P.rho0 : rho0)) * half
      pNA[i] = P.kNear * rhoNA[i] * half
    }
    for (let i = 0; i < N; i++) {
      const e = pS[i + 1]
      let p = pS[i]
      if (p === e) continue
      const pai = pA[i],
        pni = pNA[i],
        ri = rebel[i]
      let xi = x[i],
        yi = y[i]
      for (; p < e; p++) {
        const j = pJ[p]
        const ddx = x[j] - xi,
          ddy = y[j] - yi,
          r2 = ddx * ddx + ddy * ddy
        if (r2 >= 1 || r2 < 1e-12) continue
        const q = Math.sqrt(r2),
          a = 1 - q
        let D = ((pai + pA[j]) * a + (pni + pNA[j]) * a * a) / q
        if (ri !== rebel[j]) {
          // the rebel pushes and drags, but never sticks to the body for good
          if (D < 0) D *= 0.08
        } else if (doClusters && q < 0.85) {
          let ra = i,
            rb = j
          while (parent[ra] !== ra) ra = parent[ra] = parent[parent[ra]]
          while (parent[rb] !== rb) rb = parent[rb] = parent[parent[rb]]
          if (ra !== rb) parent[ra] = rb
        }
        const ux = ddx * D,
          uy = ddy * D
        x[j] += ux
        y[j] += uy
        xi -= ux
        yi -= uy
      }
      x[i] = xi
      y[i] = yi
    }
    // velocity from displacement + XSPH smoothing
    const idt = 1 / dt
    for (let i = 0; i < N; i++) {
      vx[i] = (x[i] - px[i]) * idt
      vy[i] = (y[i] - py[i]) * idt
    }
    // light mode: no XSPH smoothing
    if (!P.light) {
      sx.fill(0)
      sy.fill(0)
      wsA.fill(0)
      for (let i = 0; i < N; i++) {
        const e = pS[i + 1]
        let p = pS[i]
        if (p === e) continue
        const vxi = vx[i],
          vyi = vy[i]
        let sxi = sx[i],
          syi = sy[i],
          wi = wsA[i]
        for (; p < e; p++) {
          const j = pJ[p]
          const a = 1 - pQ[p],
            w = a * a
          const dvx = (vx[j] - vxi) * w,
            dvy = (vy[j] - vyi) * w
          sxi += dvx
          syi += dvy
          wi += w
          sx[j] -= dvx
          sy[j] -= dvy
          wsA[j] += w
        }
        sx[i] = sxi
        sy[i] = syi
        wsA[i] = wi
      }
      const k = P.xsph * 4
      for (let i = 0; i < N; i++)
        if (wsA[i] > 0) {
          vx[i] += (sx[i] / wsA[i]) * k
          vy[i] += (sy[i] / wsA[i]) * k
        }
    }

    if (doClusters) clusters()
  }

  function clusters() {
    // sizes per root, the roots kept in the order they are first met
    let nr = 0
    for (let i = 0; i < N; i++) {
      if (rebel[i]) continue
      const r = find(i)
      label[i] = r
      if (sizeOf[r]++ === 0) roots[nr++] = r
    }
    let main = -1,
      mainSize = 0
    for (let k = 0; k < nr; k++) {
      const s = sizeOf[roots[k]]
      if (s > mainSize) {
        main = roots[k]
        mainSize = s
      }
    }
    let mx = 0,
      my = 0,
      mvx = 0,
      mvy = 0
    for (let i = 0; i < N; i++) {
      const m = !rebel[i] && label[i] === main ? 1 : 0
      state.inMain[i] = m
      if (m) {
        mx += x[i]
        my += y[i]
        mvx += vx[i]
        mvy += vy[i]
      }
    }
    state.mainMass = mainSize
    state.mainX = mx / mainSize
    state.mainY = my / mainSize
    state.mainVX = mvx / mainSize
    state.mainVY = mvy / mainSize
    const list: number[] = []
    for (let k = 0; k < nr; k++) {
      const r = roots[k],
        s = sizeOf[r]
      if (r !== main && s >= 5) list.push(s)
      sizeOf[r] = 0
    }
    // fragments of the cursor drop: their size sets how fast they come back
    for (let i = N - rebelN; i < N; i++) sizeOf[find(i)]++
    for (let i = N - rebelN; i < N; i++) {
      const frac = sizeOf[find(i)] / rebelN
      fragMul[i] = frac > 0.9 ? 1 : 0.5 + 1.2 * (1 - Math.sqrt(frac))
      fragTime[i] = frac > 0.9 ? 0.7 : 0.2 + 2.2 * Math.sqrt(frac)
    }
    for (let i = N - rebelN; i < N; i++) sizeOf[find(i)] = 0
    state.pieces = list.length
    state.pieceList = list
  }

  return { N, rebelN, x, y, vx, vy, cur, state, rebel: rebelState, P, step, clusters }
}
