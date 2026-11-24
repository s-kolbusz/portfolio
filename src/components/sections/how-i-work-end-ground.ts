// The ground of the price list (how-i-work-end.tsx), drawn as flat paper shapes on a 2D canvas.
// Both cards are plain, solid cards of one family; the meaning is in what surrounds them:
//  "with you": a grid of somebody else's tiles is there from the start, with one gap; the card is
//              set into it a beat later.
//  "for you":  the paper starts empty; the card lands first and the same kind of tiles grows
//              outward from it, tile by tile, until a structure stands around it.
// One module, gap and edge on both sides. The system on the right is regular: tiles of one or two
// modules with quiet template marks. The structure he builds is made for one project: tiles of
// varied proportions carrying traces of creative work (a letter of the display face, a swatch of
// the site's green, a crop-marked frame, a motion curve). With a mouse the tiles ease a little away
// from the pointer and drift back, without bounce. Everything else is a function of the scroll.

export interface GroundState {
  /** 0…1: the first card has landed */
  land: number
  /** 0…1: how far its structure has grown from it */
  grow: number
  /** 0…1: how much of the first card and its structure shows (a phone shows one group at a time) */
  mine: number
  /** 0…1: the second card is set into the gap */
  slot: number
  /** 0…1, phone only: the system that was already there has come across */
  sweep: number
  /** 0…1: the offers are folding to their names and prices */
  fold: number
  /** 0…1: the structures go (only when the offers have to fold) */
  leave: number
  /** 0…1: the same structures stand again around the folded cards (where there is room for them) */
  refit: number
}

export interface Box {
  l: number
  t: number
  r: number
  b: number
  w: number
  h: number
}

interface Tile {
  x: number
  y: number
  w: number
  h: number
  tint: string
  a: number
  /** 0…3 quiet template marks; 4 letter, 5 swatch, 6 crop frame, 7 motion curve, 8 plain */
  mark: number
  ml: number
  /** a stable 0…1 per tile for its own variation (which letter, where the curve goes) */
  v: number
  /** 0…1: lifted under the pointer */
  lift: number
  /** how far from its card it stands, in modules: the order it is built in (0…1 once sorted) */
  far: number
  k: number
}

export interface GroundParts {
  build: HTMLElement
  with: HTMLElement
  foot: HTMLElement
}

export interface Ground {
  /**
   * Sizes, the module and both structures, from where the cards stand now. `folded`: where the two
   * cards stand once folded (canvas coordinates), to build the same structures around them too.
   */
  layout: (folded?: { build: Box; with: Box }) => void
  /** one frame; true while a tile is still settling (another frame is wanted) */
  draw: (v: GroundState) => boolean
  destroy: () => void
}

const PAPER = '#fbf9f4'
const INK = '43,38,32'
const BUILD = '229,241,233'
const WITH = '242,236,224'
const TINTS = ['242,236,224', '238,234,226', '244,239,230', '233,236,227']
const MADE = ['238,242,236', '244,239,230', '229,239,232', '241,236,228', '233,240,235']
const GREEN = '15,157,99'
const GLYPHS = ['a', 'R', 'g', '&', 'Q', 'k']
/** a second, unrelated 0…1 from the same seed value */
const spin = (v: number, k: number) => (v * k) % 1

const seeded = (seed: number) => {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

export function createGround(
  canvas: HTMLCanvasElement,
  parts: GroundParts,
  options: { interactive: boolean }
): Ground | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  // touch screens draw at a lower density, like the other scenes
  const dprCap = window.matchMedia('(pointer: coarse)').matches ? 1.5 : 2
  let W = 0
  let H = 0
  let dpr = 1
  let u = 1
  let phone = false
  let head = 84
  let ready = false
  let system: Tile[] = []
  let built: Tile[] = []
  let refit: Tile[] = []
  let last = 0
  const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, on: false }

  const rel = (el: HTMLElement): Box => {
    const c = canvas.getBoundingClientRect()
    const q = el.getBoundingClientRect()
    return {
      l: q.left - c.left,
      t: q.top - c.top,
      r: q.right - c.left,
      b: q.bottom - c.top,
      w: q.width,
      h: q.height,
    }
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = canvas.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (ptr.on) {
      ptr.vx = x - ptr.x
      ptr.vy = y - ptr.y
    }
    ptr.x = x
    ptr.y = y
    ptr.on = true
  }
  const onLeave = (e: MouseEvent) => {
    if (!e.relatedTarget) ptr.on = false
  }
  if (options.interactive) {
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onLeave)
  }

  const paper = (rgb: string, a: number, edge: number) => {
    ctx.fillStyle = `rgba(${rgb},${a})`
    ctx.fill()
    ctx.lineJoin = 'round'
    ctx.lineWidth = 1
    ctx.strokeStyle = `rgba(${INK},${edge * a})`
    ctx.stroke()
  }

  /** which trace suits a tile of this shape: 4 letter, 5 swatch, 6 crop frame, 7 motion curve */
  const trace = (cells: number, ratio: number, v: number) => {
    if (cells >= 4) return v < 0.35 ? 4 : v < 0.7 ? 6 : 7
    if (ratio > 1.6) return v < 0.55 ? 7 : 5
    if (ratio < 0.75) return v < 0.5 ? 4 : 5
    return v < 0.5 ? 5 : 6
  }

  /**
   * A structure of tiles on one module grid around a card that spans nx × ny modules: tiles of one
   * or two modules, a few tints, a quiet mark each. Columns i0…i1 around the card's own (0…nx-1).
   */
  const structure = (
    g: Box,
    nx: number,
    ny: number,
    mw: number,
    mh: number,
    gap: number,
    i0: number,
    i1: number,
    seed: number,
    made = false
  ) => {
    const rnd = seeded(seed)
    const jit = seeded(seed + 101)
    const used = new Set<string>()
    const key = (i: number, j: number) => `${i},${j}`
    const out: Tile[] = []
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) used.add(key(i, j))
    const j0 = -Math.ceil((g.t - head + 40) / (mh + gap))
    const j1 = Math.ceil((H - g.t) / (mh + gap))
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (used.has(key(i, j))) continue
        let sx = 1
        let sy = 1
        const q = rnd()
        const freeX = !used.has(key(i + 1, j)) && i + 1 <= i1
        const freeY = !used.has(key(i, j + 1)) && j + 1 <= j1
        if (made) {
          // a composition on a finer grid, not a form: a few large pieces, some wide, some tall
          const fits = (a: number, b: number) => {
            for (let x = 0; x < a; x++)
              for (let y = 0; y < b; y++)
                if (i + x > i1 || j + y > j1 || used.has(key(i + x, j + y))) return false
            return true
          }
          // mostly larger pieces, few single cells: calm, not busy
          const big: number[][] = [
            [3, 2],
            [2, 2],
            [2, 1],
          ]
          const shapes =
            q < 0.3 ? big : q < 0.55 ? big.slice(1) : q < 0.75 ? [[2, 1]] : q < 0.88 ? [[1, 2]] : []
          for (const [a = 1, b = 1] of shapes)
            if (fits(a, b)) {
              sx = a
              sy = b
              break
            }
        } else if (q < 0.24 && freeX) sx = 2
        else if (q < 0.4 && freeY) sy = 2
        for (let a = 0; a < sx; a++) for (let b = 0; b < sy; b++) used.add(key(i + a, j + b))
        const far =
          Math.hypot(
            Math.max(0, i - (nx - 1), -(i + sx) + 1),
            Math.max(0, j - (ny - 1), -(j + sy) + 1)
          ) +
          jit() * 0.35
        const w = sx * mw + (sx - 1) * gap
        const h = sy * mh + (sy - 1) * gap
        const v = rnd()
        out.push({
          x: g.l + i * (mw + gap),
          y: g.t + j * (mh + gap),
          w,
          h,
          tint: made
            ? (MADE[Math.floor(rnd() * MADE.length)] ?? MADE[0])
            : (TINTS[Math.floor(rnd() * TINTS.length)] ?? TINTS[0]),
          a: 0.5 + rnd() * 0.4,
          mark: made ? trace(sx * sy, w / h, v) : Math.floor(rnd() * 4),
          ml: 0.2 + rnd() * 0.3,
          v,
          lift: 0,
          far,
          k: 0,
        })
      }
    }
    if (made) {
      // each trace once, on the tiles nearest the card; the rest stay plain paper
      for (const t of out) t.mark = 8
      // where a trace can be seen whole: below the bar, inside the screen
      const seen = (t: Tile) => t.y >= head && t.x >= 0 && t.x + t.w <= W && t.y + t.h <= H
      const near = [...out].sort((a, b) => Number(seen(b)) - Number(seen(a)) || a.far - b.far)
      const wants: [number, (t: Tile) => boolean][] = [
        [4, (t) => t.h >= t.w * 0.9 && t.w * t.h > mw * mh * 2.5],
        [7, (t) => t.w > t.h * 1.5],
        [6, (t) => t.w * t.h > mw * mh * 1.5],
        [5, () => true],
      ]
      for (const [mark, fits] of wants) {
        const t = near.find((x) => x.mark === 8 && fits(x))
        if (t) t.mark = mark
      }
    }
    return out
  }

  const layout = (folded?: { build: Box; with: Box }) => {
    W = canvas.clientWidth
    H = canvas.clientHeight
    if (!W || !H) return
    dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    phone = W <= 700
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    head = phone ? 64 : 84
    u = phone ? W / 390 : Math.min(W / 1440, H / 900)
    const g1 = rel(parts.build)
    const g2 = rel(parts.with)
    const gap = (phone ? 8 : 12) * u
    const nx = 3
    const mw = (g2.w - (nx - 1) * gap) / nx
    const ny = Math.max(2, Math.round((g2.h + gap) / (mw * 0.72 + gap)))
    const mh = (g2.h - (ny - 1) * gap) / ny
    // the system that is already there (right; on a phone the whole width)
    system = structure(g2, nx, ny, mw, mh, gap, 0, Math.ceil((W - g2.l) / (mw + gap)), 11)
    // the structure he builds (left): the same module; the card spans whole modules of it
    const ny1 = Math.max(2, Math.round((g1.h + gap) / (mh + gap)))
    const mh1 = (g1.h - (ny1 - 1) * gap) / ny1
    // his structure is laid on half modules where they are big enough to carry a trace (about 90 px), so it can
    // be composed (the card still spans whole ones); on small screens on the whole module
    const fine = (m: number) => (m - gap) / 2 >= 90
    const split = fine(mw) ? 2 : 1
    const part = (m: number) => (m - (split - 1) * gap) / split
    const hw = part(mw)
    const right = phone ? Math.ceil((W - g1.l) / (hw + gap)) : split * nx - 1
    built = structure(
      g1,
      split * nx,
      split * ny1,
      hw,
      part(mh1),
      gap,
      -Math.ceil(g1.l / (hw + gap)),
      right,
      23,
      true
    )
    const order = [...built].sort((a, b) => a.far - b.far)
    order.forEach((t, k) => {
      t.k = k / Math.max(1, order.length - 1)
    })
    // the same two structures around the folded cards: same module, each card a whole number of rows
    refit = []
    if (folded && !phone) {
      const rows = (g: Box) => Math.max(1, Math.round((g.h + gap) / (mh + gap)))
      const tall = (g: Box, n: number) => (g.h - (n - 1) * gap) / n
      const a = folded.build
      const b = folded.with
      const na = rows(a)
      const nb = rows(b)
      const sp = (mw - gap) / 2 >= 90 ? 2 : 1
      const hw = (mw - (sp - 1) * gap) / sp
      const left = -Math.ceil(a.l / (hw + gap))
      refit = [
        ...structure(
          a,
          sp * nx,
          sp * na,
          hw,
          (tall(a, na) - (sp - 1) * gap) / sp,
          gap,
          left,
          sp * nx - 1,
          37,
          true
        ),
        ...structure(b, nx, nb, mw, tall(b, nb), gap, 0, Math.ceil((W - b.l) / (mw + gap)), 41),
      ]
    }
    ready = true
  }

  /** the trace of creative work a tile of his structure carries, drawn inside its own edge */
  const made = (t: Tile, a: number) => {
    const w = t.w
    const h = t.h
    const m = 14 * u
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(-w / 2, -h / 2, w, h, 2 * u)
    ctx.clip()
    if (t.mark === 4) {
      // a letter of the display face, too big for its tile
      const size = Math.min(h * 1.15, w * 1.1)
      ctx.font = `900 ${size}px Mattone, system-ui, sans-serif`
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = `rgba(${INK},${0.09 * a})`
      const g = GLYPHS[Math.floor(spin(t.v, 7.31) * GLYPHS.length)] ?? 'a'
      ctx.fillText(g, -w / 2 + m * 0.6 - size * 0.04, h / 2 + size * 0.12)
    } else if (t.mark === 5) {
      // a swatch of the site's green, with its lighter steps (stacked in a tall tile)
      if (h > w * 1.3) {
        const sw = w - 2 * m
        const sh = (h - 2 * m) * 0.34
        const x = -w / 2 + m
        let y = h / 2 - m - sh
        for (const [k, al] of [
          [1, 0.5],
          [0.55, 0.24],
          [0.4, 0.1],
        ] as const) {
          ctx.fillStyle = `rgba(${GREEN},${al * a})`
          ctx.fillRect(x, y, sw, sh * k)
          y -= sh * (k === 1 ? 0.55 : 0.4) + 4 * u
        }
        ctx.restore()
        return
      }
      const bh = Math.min(h * 0.42, 70 * u)
      const y = h / 2 - m - bh
      const sw = (w - 2 * m) * 0.5
      ctx.fillStyle = `rgba(${GREEN},${0.42 * a})`
      ctx.fillRect(-w / 2 + m, y, sw, bh)
      ctx.fillStyle = `rgba(${GREEN},${0.24 * a})`
      ctx.fillRect(-w / 2 + m + sw + 4 * u, y, sw * 0.45, bh)
      ctx.fillStyle = `rgba(${GREEN},${0.1 * a})`
      ctx.fillRect(-w / 2 + m + sw * 1.45 + 8 * u, y, sw * 0.35, bh)
      ctx.fillStyle = `rgba(${INK},${0.19 * a})`
      ctx.fillRect(-w / 2 + m, -h / 2 + m, w * 0.22, 1.5 * u)
    } else if (t.mark === 6) {
      // a frame with crop marks: an image being placed
      const fx = -w / 2 + m * 1.6
      const fy = -h / 2 + m * 1.6
      const fw = w - m * 3.2
      const fh = h - m * 3.2
      ctx.fillStyle = `rgba(${INK},${0.05 * a})`
      ctx.fillRect(fx, fy, fw, fh)
      // the picture runs past the frame: faint outside it, whole inside it
      const px = fx + fw * (0.12 + spin(t.v, 3.7) * 0.45)
      const py = fy + fh * (0.12 + spin(t.v, 5.3) * 0.45)
      ctx.fillStyle = `rgba(${GREEN},${0.1 * a})`
      ctx.fillRect(px, py, fw * 0.95, fh * 0.95)
      ctx.save()
      ctx.beginPath()
      ctx.rect(fx, fy, fw, fh)
      ctx.clip()
      ctx.fillStyle = `rgba(${GREEN},${0.42 * a})`
      ctx.fillRect(px, py, fw * 0.95, fh * 0.95)
      ctx.restore()
      ctx.strokeStyle = `rgba(${INK},${0.42 * a})`
      ctx.lineWidth = 1
      const k = 11 * u
      const o = 5 * u
      ctx.beginPath()
      for (const [cx, cy, sx, sy] of [
        [fx, fy, -1, -1],
        [fx + fw, fy, 1, -1],
        [fx, fy + fh, -1, 1],
        [fx + fw, fy + fh, 1, 1],
      ] as const) {
        ctx.moveTo(cx + sx * o, cy)
        ctx.lineTo(cx + sx * (o + k), cy)
        ctx.moveTo(cx, cy + sy * o)
        ctx.lineTo(cx, cy + sy * (o + k))
      }
      ctx.stroke()
    } else {
      // a motion curve with its keyframes and the thing that moves along it
      const x0 = -w / 2 + m
      const y0 = h / 2 - m
      const x1 = w / 2 - m
      const y1 = -h / 2 + m * 1.4
      const bend = 0.25 + t.v * 0.5
      const c1x = x0 + (x1 - x0) * bend
      const c2x = x0 + (x1 - x0) * (1 - bend * 0.6)
      ctx.strokeStyle = `rgba(${INK},${0.26 * a})`
      ctx.lineWidth = 1.25 * u
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.bezierCurveTo(c1x, y0, c2x, y1, x1, y1)
      ctx.stroke()
      ctx.fillStyle = `rgba(${INK},${0.3 * a})`
      for (const p of [
        [x0, y0],
        [x1, y1],
      ] as const)
        ctx.fillRect(p[0] - 2.5 * u, p[1] - 2.5 * u, 5 * u, 5 * u)
      const q = 0.62
      const bx =
        (1 - q) ** 3 * x0 + 3 * (1 - q) ** 2 * q * c1x + 3 * (1 - q) * q * q * c2x + q ** 3 * x1
      const by =
        (1 - q) ** 3 * y0 + 3 * (1 - q) ** 2 * q * y0 + 3 * (1 - q) * q * q * y1 + q ** 3 * y1
      ctx.fillStyle = `rgba(${GREEN},${0.7 * a})`
      ctx.beginPath()
      ctx.arc(bx, by, 4.5 * u, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  /** tiles being lifted, drawn after the rest so nothing covers them or their shadow */
  let late: { t: Tile; a: number; pop: number }[] = []

  /**
   * One tile; `pop` 0…1 is how far it has been set down. True while it is still settling. With a
   * mouse the structure stays put and only the tile under the pointer is picked up a little, like a
   * sheet lifted off a desk: it rises, its shadow opens, and it settles back when the pointer leaves.
   */
  const drawTile = (t: Tile, a: number, pop: number, dt: number, top = false) => {
    let busy = false
    if (!top && !phone && pop >= 1) {
      const over = ptr.on && ptr.x > t.x && ptr.x < t.x + t.w && ptr.y > t.y && ptr.y < t.y + t.h
      t.lift += ((over ? 1 : 0) - t.lift) * (1 - Math.exp(-dt / 0.3))
      if (t.lift < 0.002 && !over) t.lift = 0
      busy = Math.abs((over ? 1 : 0) - t.lift) > 0.004
      if (t.lift > 0) {
        late.push({ t, a, pop })
        return busy
      }
    }
    const L = t.lift
    const e = L * L * (3 - 2 * L)
    const sc = (0.9 + 0.1 * pop) * (1 + 0.014 * e)
    ctx.save()
    ctx.translate(t.x + t.w / 2, t.y + t.h / 2 + 10 * u * (1 - pop) - 4 * u * e)
    ctx.scale(sc, sc)
    const air = Math.max(pop < 0.98 && pop > 0.02 ? 1 - pop : 0, e)
    if (air > 0.01) {
      ctx.shadowColor = `rgba(${INK},${0.13 * air})`
      ctx.shadowBlur = 22 * u * air
      ctx.shadowOffsetY = 10 * u * air
    }
    if (e > 0) {
      // a lifted sheet is opaque: the paper under it does not show through
      ctx.beginPath()
      ctx.roundRect(-t.w / 2, -t.h / 2, t.w, t.h, 2 * u)
      ctx.fillStyle = PAPER
      ctx.fill()
      ctx.shadowColor = 'transparent'
    }
    ctx.beginPath()
    ctx.roundRect(-t.w / 2, -t.h / 2, t.w, t.h, 2 * u)
    paper(t.tint, t.a * a, 0.16)
    ctx.shadowColor = 'transparent'
    if (t.mark === 8) {
      ctx.restore()
      return busy
    }
    if (t.mark >= 4) {
      made(t, a)
      ctx.restore()
      return busy
    }
    // a quiet mark of its own content: a short rule, two rules, a corner mark, or an inner panel
    ctx.fillStyle = `rgba(${INK},${0.19 * a})`
    const px = -t.w / 2 + 14 * u
    const py = -t.h / 2 + 15 * u
    if (t.mark === 0) ctx.fillRect(px, py, t.w * t.ml, 1.5 * u)
    else if (t.mark === 1) {
      ctx.fillRect(px, py, t.w * t.ml, 1.5 * u)
      ctx.fillRect(px, py + 9 * u, t.w * t.ml * 0.55, 1.5 * u)
    } else if (t.mark === 2) ctx.fillRect(t.w / 2 - 20 * u, py - 2 * u, 6 * u, 6 * u)
    else {
      ctx.fillStyle = `rgba(${INK},${0.035 * a})`
      ctx.fillRect(-t.w / 2 + 12 * u, -t.h / 2 + t.h * 0.42, t.w - 24 * u, t.h * 0.58 - 12 * u)
    }
    ctx.restore()
    return busy
  }

  /** a card being set down: from a little off its place, turned and lifted, into it */
  const card = (
    g: Box,
    rgb: string,
    e: number,
    fromX: number,
    fromY: number,
    turn: number,
    a: number
  ) => {
    ctx.save()
    ctx.translate(g.l + g.w / 2 + fromX * u * (1 - e), g.t + g.h / 2 + fromY * u * (1 - e))
    ctx.rotate(turn * (1 - e))
    ctx.scale(1 + 0.04 * (1 - e), 1 + 0.04 * (1 - e))
    if (e < 0.98) {
      ctx.shadowColor = `rgba(${INK},${0.16 * (1 - e)})`
      ctx.shadowBlur = 26 * (1 - e) * u
      ctx.shadowOffsetY = 12 * (1 - e) * u
    }
    ctx.beginPath()
    ctx.roundRect(-g.w / 2, -g.h / 2, g.w, g.h, 2 * u)
    paper(rgb, a, 0.16)
    ctx.restore()
  }

  const draw = (v: GroundState) => {
    if (!ready) return false
    const now = performance.now()
    const dt = Math.min(0.05, (now - (last || now)) / 1000)
    last = now
    let busy = false
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, W, H)
    const g1 = rel(parts.build)
    const g2 = rel(parts.with)
    const foot = rel(parts.foot)
    // the line that writes to him stands on plain paper
    const under = (t: Tile) =>
      t.y + t.h > foot.t - 6 * u &&
      t.y < foot.b + 6 * u &&
      t.x < foot.r + 6 * u &&
      t.x + t.w > foot.l - 6 * u
    // the system that is already there
    const sys = (phone ? v.sweep : 1) * (1 - v.leave)
    if (sys > 0.01) {
      for (const t of system) {
        if (phone && under(t)) continue
        busy = drawTile(t, sys, 1, dt) || busy
      }
    }
    // the structure he builds: outward from the card, tile by tile
    const mine = v.mine * (1 - v.leave)
    if (mine > 0.01) {
      for (const t of built) {
        if (under(t)) continue
        const e0 = Math.min(1, Math.max(0, (v.grow - t.k * 0.82) / 0.18))
        const e = 1 - (1 - e0) ** 3
        if (e > 0) busy = drawTile(t, mine * Math.min(1, e * 1.5), e, dt) || busy
      }
    }
    // once the cards have folded, the same structures stand around them again
    if (v.refit > 0.01) {
      for (const t of refit) {
        if (under(t)) continue
        busy = drawTile(t, v.refit, 1, dt) || busy
      }
    }
    // the lifted tiles last, on top of their neighbours
    for (const { t, a, pop } of late) drawTile(t, a, pop, dt, true)
    late = []
    // the two cards: one family, one finish
    const folded = v.fold > 0 ? 1 : 0
    if (v.land > 0.01 && (v.mine > 0.01 || folded)) {
      const a = Math.max(folded, Math.min(1, v.land * 1.6)) * (phone ? Math.max(v.mine, folded) : 1)
      card(g1, BUILD, v.land, 0, -38, 0, a)
    }
    if (v.slot > 0.01) {
      card(g2, WITH, v.slot, 30, -44, -0.045, Math.max(folded, Math.min(1, v.slot * 1.6)))
    }
    if (Math.abs(ptr.vx) + Math.abs(ptr.vy) > 0.05) busy = true
    const fade = Math.exp(-dt * 6)
    ptr.vx *= fade
    ptr.vy *= fade
    return busy
  }

  const destroy = () => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('mouseout', onLeave)
  }

  return { layout, draw, destroy }
}
