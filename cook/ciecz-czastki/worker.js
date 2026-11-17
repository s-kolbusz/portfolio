// Fizyka cieczy w osobnym wątku: strona rysuje płynnie, nawet gdy krok fizyki trwa dłużej niż klatka
// (Safari bez JIT na iPadzie: ~28 ms na krok). Wątek liczy we własnym tempie i po każdej porcji kroków
// odsyła położenia cząstek; strona wygładza obraz między dwoma ostatnimi stanami.
import { createSim, STEPS_PER_SECOND } from './sim.js'

let sim = null, light = false, acc = 0, tPrev = 0, buf = null
const CUR_KEYS = ['x', 'y', 'vx', 'vy', 'inside', 'down', 'grabR', 'grabK']

onmessage = ({ data }) => {
  if (data.init) {
    sim = createSim(data.init)
    light = data.light
    if (light) { sim.P.light = true; sim.P.drag = 0.988 }   // lekki tryb: bez osobnej lepkości i XSPH, w zamian mocniejsze tłumienie
    Object.assign(sim.cur, data.cur || {})
    postMessage({ ready: true, N: sim.N })
    tPrev = performance.now()
    tick()
    return
  }
  if (!sim) return
  if (data.cur) {
    for (const k of CUR_KEYS) if (k in data.cur) sim.cur[k] = data.cur[k]
    // uderzenie (klik, stuknięcie) jest jednorazowe: nie może zginąć, gdy przyjdzie między krokami
    if (data.cur.impulse) sim.cur.impulse = Math.max(sim.cur.impulse, data.cur.impulse)
  }
  if (data.P) Object.assign(sim.P, data.P)
  if (data.buf) buf = data.buf   // strona oddaje bufor do ponownego użycia
}

function tick() {
  const now = performance.now()
  acc += Math.min((now - tPrev) / 1000, 0.1) * STEPS_PER_SECOND; tPrev = now
  const t0 = performance.now()
  let n = 0, steps = 0
  if (light) {
    // jeden krok obejmujący cały czas, jaki minął (do 4 kroków podstawowych), więc ciecz nie zwalnia
    if (acc >= 0.5) { const d = Math.min(acc, 4); sim.step(d); acc -= d; n = 1; steps = d }
    if (acc > 4) acc = 0
  } else {
    while (acc >= 1 && n < 4) { sim.step(); acc -= 1; n++ }
    steps = n
    if (n === 4) acc = Math.min(acc, 1)
  }
  if (n) send(performance.now() - t0, steps)
  // do następnego kroku: od razu, jeśli zaległy; inaczej poczekaj, aż minie jego czas
  setTimeout(tick, acc >= (light ? 0.5 : 1) ? 0 : Math.max(0, ((light ? 0.5 : 1) - acc) / STEPS_PER_SECOND * 1000))
}

function send(ms, steps) {
  const N = sim.N
  const pos = buf && buf.length === N * 2 ? buf : new Float32Array(N * 2)
  buf = null
  for (let i = 0; i < N; i++) { pos[i * 2] = sim.x[i]; pos[i * 2 + 1] = sim.y[i] }
  const s = sim.state
  postMessage({ pos, ms, steps, state: { mainMass: s.mainMass, mainX: s.mainX, mainY: s.mainY, pieces: s.pieces, pieceList: s.pieceList } }, [pos.buffer])
}
