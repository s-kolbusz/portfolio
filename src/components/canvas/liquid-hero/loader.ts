// Loader: a dark board covers the hero from the first moment. On it, light outlines of the initials
// fill up at the pace of the real download. Then the board thins into contour lines and uncovers the
// page; the first initial travels to its place in the first name, the second in the last name, and
// the rest of each word slides out from under its initial. A letter over the board is light, on the
// page dark, so the colour changes exactly at the board's edge. Drawn with the same fillText as the
// page texture, so handing the name over to the page is invisible.
// Ported from startLoader() in cook/ciecz-czastki/index.html.
import type { NameMetrics } from './hero-textures'
import type { Terrain } from './terrain'

export interface LoaderState {
  progress: number
  shown: number
  open: number
  handoff: boolean
  done: boolean
  glReady: boolean
  boardT: number
  hRange: [number, number]
  glFrame: () => void
  stop: () => void
}

interface LoaderOptions {
  canvas: HTMLCanvasElement
  name: NameMetrics
  first: string
  last: string
  W: number
  H: number
  dpr: number
  ink: string
  terrain: () => Terrain | null
}

type Ctx = CanvasRenderingContext2D & { letterSpacing: string }

export function startLoader({
  canvas: el,
  name: n,
  first,
  last,
  W,
  H,
  dpr,
  ink: FG,
  terrain: getTerrain,
}: LoaderOptions): LoaderState {
  el.width = W
  el.height = H
  const c = el.getContext('2d') as Ctx
  const LIGHT = '#fbf9f4'
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const gap = n.S * 0.06,
    pair = n.s1 + gap + n.k1
  const c0 = { sx: W / 2 - pair / 2, kx: W / 2 - pair / 2 + n.s1 + gap, y: H / 2 + n.asc / 2 }
  c.font = n.font
  c.letterSpacing = n.ls
  // where each letter sits in its word (with the whole word's spacing and kerning)
  const rest = (t: string) =>
    [...t]
      .map((_, i) => c.measureText(t).width - c.measureText(t.slice(i)).width)
      .concat(c.measureText(t).width)
  const rS = rest(first),
    rK = rest(last)
  let raf = 0
  const st: LoaderState = {
    progress: 0,
    shown: 0,
    open: -1,
    handoff: false,
    done: false,
    glReady: false,
    boardT: -1,
    hRange: [0, 1],
    glFrame: () => {},
    stop: () => cancelAnimationFrame(raf),
  }
  // terrain under the frame (for the letters' colour: light over the board, dark once the board under them has thinned)
  let terr: { at: (x: number, y: number) => number; lo: number; hi: number } | null = null
  function terrain() {
    const T = getTerrain()
    if (!T) return null
    const [x0, y0, w0, h0] = T.start,
      sc = Math.max(W / w0, H / h0)
    const ox = (x0 + w0 / 2) * sc - W / 2,
      oy = (y0 + h0 / 2) * sc - H / 2
    const at = (x: number, y: number) =>
      T.data[
        Math.min(T.h - 1, Math.max(0, Math.round((y + oy) / sc))) * T.w +
          Math.min(T.w - 1, Math.max(0, Math.round((x + ox) / sc)))
      ]
    let lo = Infinity,
      hi = -Infinity
    for (let y = 0; y < H; y += H / 60)
      for (let x = 0; x < W; x += W / 90) {
        const h = at(x, y)
        lo = Math.min(lo, h)
        hi = Math.max(hi, h)
      }
    st.hRange = [lo, hi]
    return { at, lo, hi }
  }
  const cl = (x: number) => Math.min(Math.max(x, 0), 1)
  // how much of the board has thinned at a point (the same formula as in the shader)
  function thinned(x: number, y: number, bt: number) {
    terr ||= terrain()
    if (!terr) return 0
    const hn = cl((terr.at(x, y) - terr.lo) / Math.max(terr.hi - terr.lo, 1))
    const p = cl((bt - hn * 1.1) / 1.4)
    return p * p * p * (p * (p * 6 - 15) + 10)
  }
  const mixHex = (a: string, b: string, t: number) =>
    '#' +
    [0, 2, 4]
      .map((i) =>
        Math.round(
          parseInt(a.substr(i + 1, 2), 16) * (1 - t) + parseInt(b.substr(i + 1, 2), 16) * t
        )
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  const t0 = performance.now()
  // one word: the following letters fan out from under the initial (nearest first), travel as outlines
  // (the same outline as the initials on the board), and once in place fill from the bottom like the initials
  const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
  function glyphs(text: string, x: number, y: number, firstW: number, r: number, rr: number[]) {
    if (r >= 1) {
      c.fillText(text, x, y)
      return
    }
    const L = text.length - 1
    for (let i = L; i >= 1; i--) {
      // from the last one: nearer letters cover farther ones
      const st0 = ((i - 1) / L) * 0.38 // delay: letters right next to the initial go first
      const go = smoother(cl((r - st0) / 0.55)) // the path from under the initial to its place
      if (go <= 0) continue
      const fill = cl((r - st0 - 0.35) / 0.3) // filling once arrived
      const lx = x + firstW * 0.25 + (rr[i] - firstW * 0.25) * go
      if (fill < 1) {
        c.save()
        c.globalAlpha = Math.min(go * 3, 1) * 0.8
        c.lineWidth = 1.3 * dpr
        c.strokeText(text[i], lx, y)
        c.restore()
      }
      if (fill > 0) {
        c.save()
        c.beginPath()
        c.rect(lx - n.S, y - (n.asc + 2) * smoother(fill) + 1, n.S * 3, n.S)
        c.clip()
        c.fillText(text[i], lx, y)
        c.restore()
      }
    }
    c.fillText(text[0], x, y) // the initial on top: letters come out from under it
  }
  function word(
    text: string,
    x: number,
    y: number,
    firstW: number,
    r: number,
    rr: number[],
    fill: number,
    color: string
  ) {
    c.fillStyle = color
    c.strokeStyle = color
    if (fill >= 1) {
      glyphs(text, x, y, firstW, r, rr)
      return
    }
    c.save()
    c.globalAlpha = 0.55
    c.lineWidth = 1.2 * dpr
    c.strokeText(text[0], x, y)
    c.restore()
    c.save()
    c.beginPath()
    c.rect(0, y - (n.asc + 2) * fill + 1, W, H)
    c.clip()
    glyphs(text, x, y, firstW, r, rr)
    c.restore()
  }
  function draw(now: number) {
    const t = (now - t0) / 1000
    // filling: no faster than the real progress and no faster than 1.1 s for the whole
    const target = Math.min(st.progress, still ? 1 : t / 1.1)
    st.shown += (target - st.shown) * 0.12
    if (target >= 1 && st.shown > 0.996) st.shown = 1
    if (st.open < 0 && st.shown === 1 && st.glReady) st.open = now + 180 // a short breath after the full fill
    const o = st.open < 0 || now < st.open ? 0 : still ? 1 : cl((now - st.open) / 1000 / 2.6)
    const bt = st.open < 0 || now < st.open ? -1 : (now - st.open) / 1000
    st.boardT = still && bt >= 0 ? 99 : bt
    const m = smoother(cl(o / 0.72)) // the initials' move: a long, soft start and landing
    const r = cl((o - 0.12) / 0.86) // the rest of the word unfolding (each letter has its own easing)
    el.style.background = 'none'
    c.clearRect(0, 0, W, H)
    c.font = n.font
    c.letterSpacing = n.ls
    // the 2D board only until the reveal; then the shader draws the same dark board and it thins into contour lines
    if (bt < 0) {
      c.fillStyle = FG
      c.fillRect(0, 0, W, H)
    }
    const S = [c0.sx + (n.sx - c0.sx) * m, c0.y + (n.sy - c0.y) * m],
      K = [c0.kx + (n.kx - c0.kx) * m, c0.y + (n.ky - c0.y) * m]
    // a letter's colour: light on the board, dark once the board under it has thinned (measured under the word's middle)
    const tone = (x: number, y: number, w: number) =>
      bt < 0 ? LIGHT : mixHex(LIGHT, FG, cl((thinned(x + w / 2, y - n.asc / 2, bt) - 0.3) / 0.4))
    word(first, S[0], S[1], n.s1, r, rS, st.shown, tone(S[0], S[1], n.sw * Math.max(r, 0.15)))
    word(last, K[0], K[1], n.k1, r, rK, st.shown, tone(K[0], K[1], n.kw * Math.max(r, 0.15)))
    if (o >= 1 && bt > 2.55) {
      st.handoff = true
      st.boardT = 99
      return
    }
    raf = requestAnimationFrame(draw)
  }
  st.glFrame = () => {
    st.glReady = true
    if (st.handoff && !st.done) {
      st.done = true
      el.style.display = 'none'
    }
  }
  raf = requestAnimationFrame(draw)
  return st
}
