// Strojenie bez przeglądarki: node cook/ciecz-czastki/test-sim.mjs '[{...nadpisania P}]'
import { createSim } from './sim.js'
const Hq = 0.021, A = 1.6
const variants = process.argv[2] ? JSON.parse(process.argv[2]) : [{}]
for (const v of variants) {
  const sim = createSim({ width: A / Hq, height: 1 / Hq, center: { x: A / 2 / Hq, y: 0.5 / Hq }, radius: 0.235 / Hq, rebelAt: { x: A * 0.245 / Hq, y: 0.57 / Hq } })
  const base = sim.P.rho0 / sim.P.rho0Scale; Object.assign(sim.P, v); sim.P.rho0 = base * sim.P.rho0Scale
  const { N, x, y, vx, vy, state, cur } = sim
  const jitter = () => { // średnia prędkość cząstek ciała względem ruchu całości (drżenie), h/s
    let s = 0, n = 0
    for (let i = 0; i < N; i++) if (state.inMain[i]) { s += Math.hypot(vx[i] - state.mainVX, vy[i] - state.mainVY); n++ }
    return (s / n * 120).toFixed(2)
  }
  const rad = () => { let r = 0; for (let i = 0; i < N; i++) if (state.inMain[i]) r = Math.max(r, Math.hypot(x[i] - state.mainX, y[i] - state.mainY)); return r.toFixed(1) }
  const out = []
  const t0 = performance.now()
  for (let s = 0; s < 360; s++) sim.step()
  const ms = (performance.now() - t0) / 360
  sim.clusters(); out.push(`spocz r${rad()} drż${jitter()} k${state.pieces}`)
  // buntownik za kursorem
  cur.inside = true
  cur.x = sim.rebel.x + 10; cur.y = sim.rebel.y; cur.vx = 0; cur.vy = 0
  for (let s = 0; s < 120; s++) sim.step()
  out.push(`bunt→kursor ${Math.hypot(sim.rebel.x - cur.x, sim.rebel.y - cur.y).toFixed(1)}h`)
  // szybki gest przez środek ciała
  const cx = state.mainX, cy = state.mainY
  for (let s = 0; s < 90; s++) { cur.x = cx - 16 + s * 0.45; cur.y = cy + 1; cur.vx = 0.45; cur.vy = 0; sim.step() }
  cur.vx = 0; cur.x = cx + 40; cur.y = cy + 15
  sim.clusters(); out.push(`gest m${state.mainMass} k${state.pieces}`)
  let merged = -1
  for (let s = 1; s <= 120 * 8; s++) { sim.step(); if (s % 12 === 0) { sim.clusters(); if (merged < 0 && state.pieceList.filter((p) => p >= 12).length === 0) merged = s / 120 } }
  out.push(`zrośnięte po ${merged < 0 ? '>8' : merged.toFixed(1)}s, r${rad()} drż${jitter()} m${state.mainMass}`)
  console.log(JSON.stringify(v), `| ${ms.toFixed(2)} ms/krok\n   `, out.join(' | '))
}
