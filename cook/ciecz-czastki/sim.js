// Ciecz z cząstek: lepko-sprężysta ciecz Clavet i in. (2005), podwójna relaksacja gęstości,
// plus wygładzanie prędkości (XSPH), żeby ciecz nie drżała.
// Jednostki: długość = promień oddziaływania h, czas = krok (120 kroków na sekundę).
// Masa przyciąga masę: główne ciało przyciąga oderwane krople siłą proporcjonalną do swojej masy.
// „Buntownik”: mała kropla przyklejona do kursora. Jest częścią tej samej cieczy, więc przepycha,
// porywa i wygina wszystko, przez co przechodzi, i lekko przyciąga oderwane krople.

export const STEPS_PER_SECOND = 120

export function createSim({ width, height, center, radius, spacing = 0.42, rebelAt, rebelRadius = 2.3 }) {
  const pts = [], isRebel = []
  const dy = spacing * Math.sqrt(3) / 2
  const disk = (c, r, rebel) => {
    for (let y = -r, row = 0; y <= r; y += dy, row++) {
      for (let x = -r + (row % 2) * spacing / 2; x <= r; x += spacing) {
        if (x * x + y * y <= r * r) { pts.push([c.x + x, c.y + y]); isRebel.push(rebel ? 1 : 0) }
      }
    }
  }
  disk(center, radius, false)
  if (rebelAt) disk(rebelAt, rebelRadius, true)
  const N = pts.length
  const restR = radius * 1.08
  const rebel = Uint8Array.from(isRebel)
  const rebelN = isRebel.reduce((a, b) => a + b, 0)
  const x = new Float32Array(N), y = new Float32Array(N)
  const px = new Float32Array(N), py = new Float32Array(N)
  const vx = new Float32Array(N), vy = new Float32Array(N)
  const sx = new Float32Array(N), sy = new Float32Array(N), wsA = new Float32Array(N)
  const rhoA = new Float32Array(N), rhoNA = new Float32Array(N), pA = new Float32Array(N), pNA = new Float32Array(N)
  pts.forEach(([a, b], i) => { x[i] = a; y[i] = b })

  // siatka sąsiedztwa (komórka = h)
  const GW = Math.ceil(width) + 4, GH = Math.ceil(height) + 4
  const head = new Int32Array(GW * GH), next = new Int32Array(N)
  function rebuild() {
    head.fill(-1)
    for (let i = 0; i < N; i++) {
      const cx = Math.min(GW - 1, Math.max(0, Math.floor(x[i]) + 2))
      const cy = Math.min(GH - 1, Math.max(0, Math.floor(y[i]) + 2))
      const c = cy * GW + cx; next[i] = head[c]; head[c] = i
    }
  }
  function forNeighbors(i, fn) {
    const cx = Math.floor(x[i]) + 2, cy = Math.floor(y[i]) + 2
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      if (gy < 0 || gy >= GH) continue
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        if (gx < 0 || gx >= GW) continue
        for (let j = head[gy * GW + gx]; j !== -1; j = next[j]) {
          if (j === i) continue
          const ddx = x[j] - x[i], ddy = y[j] - y[i]
          const r2 = ddx * ddx + ddy * ddy
          if (r2 >= 1) continue
          fn(j, Math.sqrt(r2), ddx, ddy)
        }
      }
    }
  }

  // lista sąsiadów (indeksy), budowana raz po przesunięciu; odległości liczone na bieżąco
  const MAXN = 48
  const nb = new Int32Array(N * MAXN), nbc = new Int32Array(N)
  function buildNeighbors() {
    rebuild()
    for (let i = 0; i < N; i++) {
      let c = 0
      const cx = Math.floor(x[i]) + 2, cy = Math.floor(y[i]) + 2
      for (let gy = cy - 1; gy <= cy + 1 && c < MAXN; gy++) {
        if (gy < 0 || gy >= GH) continue
        for (let gx = cx - 1; gx <= cx + 1 && c < MAXN; gx++) {
          if (gx < 0 || gx >= GW) continue
          for (let j = head[gy * GW + gx]; j !== -1 && c < MAXN; j = next[j]) {
            if (j <= i) continue
            const ddx = x[j] - x[i], ddy = y[j] - y[i]
            if (ddx * ddx + ddy * ddy < 1.21) nb[i * MAXN + c++] = j   // z zapasem na ruch w trakcie kroku
          }
        }
      }
      nbc[i] = c
    }
  }

  // skupiska: union-find, liczone co kilka kroków (bez buntownika)
  const parent = new Int32Array(N), label = new Int32Array(N)
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a] } return a }
  const unite = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b }
  const state = { mainMass: N - rebelN, mainX: center.x, mainY: center.y, mainVX: 0, mainVY: 0, pieces: 0, pieceList: [], inMain: Uint8Array.from(rebel, (r) => 1 - r) }

  const P = {
    // wartości dobrane testami bez przeglądarki (test-sim.mjs, sweep.mjs)
    rho0: 0, rho0Scale: 1.45, k: 0.03, kNear: 0.1, sigma: 0.09, beta: 0.2,
    xsph: 0.1,               // wygładzanie prędkości między sąsiadami: mniej drżenia
    drag: 0.993,             // lepkość ośrodka
    pull: 0.003,             // przyciąganie oderwanych kropli przez ciało (× masa ciała / N)
    anchor: 0.00008,         // ciało wraca na środek kadru
    cursorPull: 0.0012,      // przyciąganie oderwanych kropli przez buntownika
    life: 0.0003,            // samoistne, wolne zawirowania: ciecz nigdy nie stoi martwo
    shapeGain: 3.5, shapeMax: 0.55, shapeK: 0.003,  // wydłużanie kropli kursora w ruchu
    rebelLife: 0.006,        // jak mocno kropla kursora sama zmienia kształt
    tether: 0.0045,          // jak mocno buntownik trzyma się kursora
    self: 0.00015,           // własny ciężar ciała (zrastanie po rozciągnięciu)
  }

  rebuild()
  {
    let sum = 0, cnt = 0
    for (let i = 0; i < N; i++) {
      if (rebel[i]) continue
      const ddx = x[i] - center.x, ddy = y[i] - center.y
      if (ddx * ddx + ddy * ddy > (radius * 0.5) ** 2) continue
      let rho = 0
      forNeighbors(i, (j, q) => { rho += (1 - q) * (1 - q) })
      sum += rho; cnt++
    }
    P.rho0 = sum / cnt * P.rho0Scale
  }

  const cur = { x: -99, y: -99, vx: 0, vy: 0, inside: false, down: false, impulse: 0, home: rebelAt ? { ...rebelAt } : null, tx: rebelAt?.x ?? 0, ty: rebelAt?.y ?? 0 }
  const rebelState = { x: rebelAt?.x ?? 0, y: rebelAt?.y ?? 0, mass: rebelN }

  let stepCount = 0, rebelGrip = 1
  const grip = new Float32Array(N).fill(1), fragMul = new Float32Array(N).fill(1), fragTime = new Float32Array(N).fill(0.7)
  // dt = ile kroków podstawowych (1/120 s) obejmuje ten krok: lekki tryb robi jeden większy krok zamiast kilku małych
  let simTime = 0
  function step(dt = 1) {
    ++stepCount
    simTime += dt
    const t = simTime
    const dragDt = Math.pow(P.drag, dt)
    const relaxDt = Math.pow(dt, P.relaxPow ?? 0)
    const M = state.mainMass / (N - rebelN)
    // cel buntownika: kursor, a bez kursora miejsce, w którym go zostawiono
    if (cur.inside) { cur.tx = cur.x; cur.ty = cur.y }
    // na dotyku bez palca kropla kursora wraca do ciała i chowa się w nim
    else if (cur.homeToBody) { cur.tx = state.mainX; cur.ty = state.mainY }
    // środek buntownika (do przyciągania kropli)
    let rx = 0, ry = 0
    for (let i = N - rebelN; i < N; i++) { rx += x[i]; ry += y[i] }
    if (rebelN) { rebelState.x = rx / rebelN; rebelState.y = ry / rebelN }

    for (let i = 0; i < N; i++) {
      let ax = 0, ay = 0
      if (rebel[i]) {
        // buntownik: sprężyście trzyma się kursora, z opóźnieniem, więc przy szybkim ruchu się wyciąga
        // przód kropli (w kierunku ruchu) trzyma się mocniej, tył się wlecze: przy ruchu kropla się wyciąga,
        // tym bardziej, im szybciej; po kliknięciu chwilowo puszcza, rozpryskuje się i składa z powrotem
        const ox = x[i] - rebelState.x, oy = y[i] - rebelState.y, od = Math.hypot(ox, oy) || 1
        const sp = Math.hypot(cur.vx, cur.vy)
        const along = cur.inside && sp > 0.005 ? (ox * cur.vx + oy * cur.vy) / (od * sp) : 0
        const stretch = Math.min(sp * 6, 0.85)
        // odłamki po kliknięciu wracają w swoim tempie: małe i lekkie szybko, duże i ciężkie ospale
        const g = grip[i]
        const k = P.tether * (1 + along * stretch * 0.25) * g * fragMul[i]
        ax += (cur.tx - x[i]) * k; ay += (cur.ty - y[i]) * k
        // kształt: wzdłuż ruchu kropla się wydłuża, w poprzek zwęża, tył zostaje dłuższy (kształt łzy)
        if (sp > 0.005 && cur.inside) {
          const ux = cur.vx / sp, uy = cur.vy / sp
          const pa = ox * ux + oy * uy, pp = -ox * uy + oy * ux
          const e = Math.min(sp * P.shapeGain, P.shapeMax)
          const ta = pa * (1 + e) * (pa < 0 ? 1.25 : 0.85), tp = pp / (1 + e * 0.6)
          const tx = ta * ux - tp * uy, ty = ta * uy + tp * ux
          ax += (tx - ox) * P.shapeK * rebelGrip; ay += (ty - oy) * P.shapeK * rebelGrip
        }
        // życie kropli kursora: wolno wędrujące płaty, żeby w spoczynku nie była okrągłym guzikiem
        const th = Math.atan2(oy, ox), tt = simTime / STEPS_PER_SECOND
        const lobe = Math.sin(3 * th + tt * 0.9) + 0.6 * Math.sin(5 * th - tt * 1.4 + 1.3) + 0.4 * Math.sin(2 * th + tt * 0.5)
        const lr = P.rebelLife * lobe * Math.min(od / 2, 1)
        ax += ox / od * lr; ay += oy / od * lr
        const m = Math.min(1, 0.06 * g * dt)
        vx[i] += ((cur.inside ? cur.vx : 0) - vx[i]) * m; vy[i] += ((cur.inside ? cur.vy : 0) - vy[i]) * m
      } else if (state.inMain[i]) {
        // hamowanie całego ciała (P.anchorDamp): przy przechylaniu słabsze, żeby ciecz płynęła tym szybciej, im mocniej przechylona
        // rozlewanie w taflę (P.spread 0…1): ciało przestaje wracać na środek i trzymać się w kupie
        const ad = P.anchorDamp ?? 0.02, free = 1 - (P.spread || 0)
        ax += ((center.x - state.mainX) * P.anchor - state.mainVX * ad) * free
        ay += ((center.y - state.mainY) * P.anchor - state.mainVY * ad) * free
        // własny ciężar ciała: rozciągnięte części ściągają się z powrotem do środka masy
        const ox = x[i] - state.mainX, oy = y[i] - state.mainY, od = Math.hypot(ox, oy)
        if (od > restR * 0.45) { const g = P.self * free * (od - restR * 0.45) / od; ax -= ox * g; ay -= oy * g }
        // życie: płynne, duże zawirowania wewnątrz ciała
        const s = P.life
        ax += s * Math.sin(y[i] * 0.16 + t * 0.011) * Math.cos(x[i] * 0.11 - t * 0.008)
        ay += s * Math.cos(x[i] * 0.14 - t * 0.009) * Math.sin(y[i] * 0.12 + t * 0.007)
      } else {
        // oderwana kropla: ciało ją przyciąga, tym słabiej, im mniej go zostało; z bliska mocniej (zrastanie)
        const ddx = state.mainX - x[i], ddy = state.mainY - y[i]
        const d = Math.max(Math.hypot(ddx, ddy), 3)
        const g = P.pull * M * 6 / Math.sqrt(d)
        ax += ddx / d * g; ay += ddy / d * g
        // buntownik też ją lekko przyciąga
        const bx = rebelState.x - x[i], by = rebelState.y - y[i], bd = Math.hypot(bx, by)
        if (bd < 16 && bd > 2) { const s = P.cursorPull * (rebelState.mass / 100) / bd; ax += bx * s; ay += by * s }
      }

      if (cur.inside && rebel[i] && cur.impulse > 0) {
        // kliknięcie rozbija też kroplę kursora
        const ddx = cur.x - x[i], ddy = cur.y - y[i], d = Math.hypot(ddx, ddy) || 0.01
        const w = Math.max(1 - d / 4.5, 0.25)
        vx[i] -= ddx / d * w * cur.impulse * 0.9; vy[i] -= ddy / d * w * cur.impulse * 0.9
      }
      if (cur.inside && !rebel[i]) {
        const ddx = cur.x - x[i], ddy = cur.y - y[i]
        const d = Math.hypot(ddx, ddy)
        // ruch kursora porywa ciecz, tym mocniej, im szybciej się rusza
        const Rc = 3.2
        if (d < Rc) {
          const w = (1 - d / Rc) ** 2
          const wd = Math.min(1, w * 0.22 * dt)
          vx[i] += (cur.vx - vx[i]) * wd
          vy[i] += (cur.vy - vy[i]) * wd
        }
        // przytrzymanie: chwyta ciecz
        if (cur.down && d < (cur.grabR ?? 3.5) && d > 0.05) { const R = cur.grabR ?? 3.5; const w = (1 - d / R) * (cur.grabK ?? 0.06); ax += ddx * w; ay += ddy * w }
        // kliknięcie / dotknięcie: uderzenie rozchlapuje ciecz od punktu
        if (cur.impulse > 0 && d < 4.5 && d > 0.01) {
          const w = (1 - d / 4.5)
          vx[i] -= ddx / d * w * cur.impulse; vy[i] -= ddy / d * w * cur.impulse
        }
      }
      // przechylenie tabletu: lekka grawitacja w stronę przechyłu (tylko ciecz, nie kropla kursora)
      if (!rebel[i]) { ax += P.gx || 0; ay += P.gy || 0 }
      vx[i] += ax * dt; vy[i] += ay * dt
      vx[i] *= dragDt; vy[i] *= dragDt
    }
    const clicked = cur.impulse > 0
    if (clicked) rebelGrip = 0
    cur.impulse = 0
    rebelGrip = Math.min(1, rebelGrip + dt / (STEPS_PER_SECOND * 0.7))
    for (let i = N - rebelN; i < N; i++) grip[i] = clicked ? 0 : Math.min(1, grip[i] + dt / (STEPS_PER_SECOND * fragTime[i]))

    buildNeighbors()
    // lepkość (pary i<j)
    for (let i = 0; i < (P.light ? 0 : N); i++) {   // lekki tryb: bez osobnej lepkości
      const o = i * MAXN
      for (let k = 0; k < nbc[i]; k++) {
        const j = nb[o + k]
        const ddx = x[j] - x[i], ddy = y[j] - y[i], r2 = ddx * ddx + ddy * ddy
        if (r2 >= 1 || r2 < 1e-12) continue
        const r = Math.sqrt(r2), ux = ddx / r, uy = ddy / r
        const u = (vx[i] - vx[j]) * ux + (vy[i] - vy[j]) * uy
        if (u > 0) {
          const I = (1 - r) * (P.sigma * u + P.beta * u * u) * 0.5 * dt
          vx[i] -= I * ux; vy[i] -= I * uy; vx[j] += I * ux; vy[j] += I * uy
        }
      }
    }
    // przesunięcie
    for (let i = 0; i < N; i++) {
      px[i] = x[i]; py[i] = y[i]
      // jedno przesunięcie nie może przeskoczyć więcej niż P.maxMove promienia: przy dużym kroku (lekki tryb) ciecz się wtedy nie rozpryskuje
      const vmax = Math.min(0.6, (P.maxMove ?? 0.6) / dt)
      const s = Math.hypot(vx[i], vy[i]); if (s > vmax) { vx[i] *= vmax / s; vy[i] *= vmax / s }
      x[i] += vx[i] * dt; y[i] += vy[i] * dt
      if (x[i] < 0.5) x[i] = 0.5; else if (x[i] > width - 0.5) x[i] = width - 0.5
      if (y[i] < 0.5) y[i] = 0.5; else if (y[i] > height - 0.5) y[i] = height - 0.5
    }
    buildNeighbors()
    // podwójna relaksacja gęstości: najpierw gęstości (pary), potem przesunięcia (pary)
    const doClusters = Math.floor(t / 6) !== Math.floor((t - dt) / 6)
    if (doClusters) for (let i = 0; i < N; i++) parent[i] = i
    rhoA.fill(0); rhoNA.fill(0)
    for (let i = 0; i < N; i++) {
      const o = i * MAXN
      for (let k = 0; k < nbc[i]; k++) {
        const j = nb[o + k]
        const ddx = x[j] - x[i], ddy = y[j] - y[i], r2 = ddx * ddx + ddy * ddy
        if (r2 >= 1) continue
        const a = 1 - Math.sqrt(r2), a2 = a * a, a3 = a2 * a
        rhoA[i] += a2; rhoA[j] += a2; rhoNA[i] += a3; rhoNA[j] += a3
      }
    }
        // przy rozlewaniu ciecz chce rzadszego upakowania, więc sama się rozpycha równo na wszystkie strony (do ~3× powierzchni)
    const rho0 = P.rho0 * (1 - 0.7 * (P.spread || 0))
    for (let i = 0; i < N; i++) { pA[i] = P.k * (rhoA[i] - (rebel[i] ? P.rho0 : rho0)); pNA[i] = P.kNear * rhoNA[i] }
    for (let i = 0; i < N; i++) {
      const o = i * MAXN
      for (let k = 0; k < nbc[i]; k++) {
        const j = nb[o + k]
        const ddx = x[j] - x[i], ddy = y[j] - y[i], r2 = ddx * ddx + ddy * ddy
        if (r2 >= 1 || r2 < 1e-12) continue
        const q = Math.sqrt(r2), a = 1 - q
        let D = ((pA[i] + pA[j]) * 0.5 * a + (pNA[i] + pNA[j]) * 0.5 * a * a) * 0.5 * relaxDt   // relaksacja: przy większym kroku mocniej (P.relaxPow), żeby spójność na sekundę była podobna
        // buntownik przepycha i porywa, ale się nie skleja na stałe z ciałem
        if (rebel[i] !== rebel[j] && D < 0) D *= 0.08
        const ux = ddx / q * D, uy = ddy / q * D
        x[j] += ux; y[j] += uy; x[i] -= ux; y[i] -= uy
        if (doClusters && q < 0.85 && rebel[i] === rebel[j]) unite(i, j)
      }
    }
    // prędkość z przesunięcia + wygładzenie XSPH
    for (let i = 0; i < N; i++) { vx[i] = (x[i] - px[i]) / dt; vy[i] = (y[i] - py[i]) / dt; sx[i] = 0; sy[i] = 0; wsA[i] = 0 }
    for (let i = 0; i < (P.light ? 0 : N); i++) {   // lekki tryb: bez wygładzania XSPH
      const o = i * MAXN
      for (let k = 0; k < nbc[i]; k++) {
        const j = nb[o + k]
        const ddx = x[j] - x[i], ddy = y[j] - y[i], r2 = ddx * ddx + ddy * ddy
        if (r2 >= 1) continue
        const a = 1 - Math.sqrt(r2), w = a * a
        const dvx = vx[j] - vx[i], dvy = vy[j] - vy[i]
        sx[i] += dvx * w; sy[i] += dvy * w; sx[j] -= dvx * w; sy[j] -= dvy * w; wsA[i] += w; wsA[j] += w
      }
    }
    for (let i = 0; i < N; i++) if (wsA[i] > 0) { vx[i] += sx[i] / wsA[i] * P.xsph * 4; vy[i] += sy[i] / wsA[i] * P.xsph * 4 }

    if (doClusters) clusters()
  }

  function clusters() {
    const size = new Map()
    for (let i = 0; i < N; i++) { if (rebel[i]) continue; const r = find(i); label[i] = r; size.set(r, (size.get(r) || 0) + 1) }
    let main = -1, mainSize = 0
    for (const [r, s] of size) if (s > mainSize) { main = r; mainSize = s }
    let mx = 0, my = 0, mvx = 0, mvy = 0
    for (let i = 0; i < N; i++) {
      const m = !rebel[i] && label[i] === main ? 1 : 0
      state.inMain[i] = m
      if (m) { mx += x[i]; my += y[i]; mvx += vx[i]; mvy += vy[i] }
    }
    state.mainMass = mainSize
    state.mainX = mx / mainSize; state.mainY = my / mainSize
    state.mainVX = mvx / mainSize; state.mainVY = mvy / mainSize
    const list = []
    for (const [r, s] of size) if (r !== main && s >= 5) list.push(s)
    // odłamki kropli kursora: wielkość decyduje o tempie powrotu
    const rs = new Map()
    for (let i = N - rebelN; i < N; i++) { const r = find(i); rs.set(r, (rs.get(r) || 0) + 1) }
    for (let i = N - rebelN; i < N; i++) {
      const frac = rs.get(find(i)) / rebelN
      fragMul[i] = frac > 0.9 ? 1 : 0.5 + 1.2 * (1 - Math.sqrt(frac))
      fragTime[i] = frac > 0.9 ? 0.7 : 0.2 + 2.2 * Math.sqrt(frac)
    }
    state.pieces = list.length
    state.pieceList = list
  }

  return { N, rebelN, x, y, vx, vy, cur, state, rebel: rebelState, P, step, clusters }
}
