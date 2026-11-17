// All hero text drawn into images, so the liquid can refract it. Two mask textures on black:
// static: name (G), role, rule, CTA (R); lines: each in its own channel (R, G, B), because the
// highlight moves between them. Ported from textures() in cook/ciecz-czastki/index.html.

export interface HeroCopy {
  first: string
  last: string
  role: string
  lines: [string, string, string]
  cta: string
}

export interface NameMetrics {
  font: string
  ls: string
  S: number
  asc: number
  sx: number
  sy: number
  sw: number
  s1: number
  kx: number
  ky: number
  kw: number
  k1: number
}

export interface SelectableText {
  text: string
  font: string
  ls: string
  x: number
  y: number
  a: number
  d: number
}

export interface HeroTextures {
  s: HTMLCanvasElement
  l: HTMLCanvasElement
  fade: [number, number, number, number]
  name: NameMetrics
  sel: SelectableText[]
}

interface Frame {
  W: number
  H: number
  dpr: number
  INSET: number
  PORTRAIT: boolean
}

type Ctx = CanvasRenderingContext2D & { letterSpacing: string }

export function heroTextures(copy: HeroCopy, { W, H, dpr, INSET, PORTRAIT }: Frame): HeroTextures {
  const vw = W / 100,
    vh = H / 100
  const s = document.createElement('canvas')
  s.width = W
  s.height = H
  const g = s.getContext('2d') as Ctx
  g.fillStyle = '#000'
  g.fillRect(0, 0, W, H)
  let S = Math.min(11.4 * vw, 20 * vh)
  g.font = `900 ${S}px "Mattone"`
  g.letterSpacing = `${-0.02 * S}px`
  const bx = 6.67 * vw,
    bw = PORTRAIT ? W - 2 * bx : Math.min(30 * vw, 52 * vh)
  const room = PORTRAIT ? W - 2 * bx : W - 10.4 * vw - (bx + bw + 3 * vw)
  if (PORTRAIT) {
    S = W
    g.font = `900 ${S}px "Mattone"`
    g.letterSpacing = `${-0.02 * S}px`
    S = Math.min((S * room) / g.measureText(copy.first).width, 13 * vh)
    g.font = `900 ${S}px "Mattone"`
    g.letterSpacing = `${-0.02 * S}px`
  }
  S = Math.min(S, (S * room) / g.measureText(copy.last).width)
  g.font = `900 ${S}px "Mattone"`
  g.letterSpacing = `${-0.02 * S}px`
  g.fillStyle = '#0f0' // the name in channel G: the page shows it only once the loader hands it over
  const asc = g.measureText(copy.first).actualBoundingBoxAscent
  const name: NameMetrics = {
    font: g.font,
    ls: g.letterSpacing,
    S,
    asc,
    sx: bx,
    sy: 6 * vh + S * 0.45 + asc * 0.5,
    sw: g.measureText(copy.first).width,
    s1: g.measureText(copy.first[0]).width,
    kx: W - (PORTRAIT ? bx : 10.4 * vw) - g.measureText(copy.last).width,
    ky: H - INSET * dpr - 5.5 * vh - S * 0.2,
    kw: g.measureText(copy.last).width,
    k1: g.measureText(copy.last[0]).width,
  }
  g.fillText(copy.first, name.sx, name.sy)
  if (!PORTRAIT) g.fillText(copy.last, name.kx, name.ky) // in portrait only above the block, once its height is known
  g.fillStyle = '#fff'
  g.letterSpacing = '0px'

  // the block, from the bottom up
  const role = Math.max(13 * dpr, Math.min(20 * dpr, 1.55 * vh))
  let big = PORTRAIT ? 15 * dpr : Math.min(2.45 * vh, 1.37 * vw)
  const lines = copy.lines
  g.font = `700 ${big}px "Mattone"`
  big = Math.min(big, (big * bw) / Math.max(...lines.map((l) => g.measureText(l).width)))
  const ctaY = PORTRAIT ? H - INSET * dpr - 5 * vh : H - INSET * dpr - 7 * vh
  const linesBottom = ctaY - 22 * dpr - 12 * dpr
  const firstBase = PORTRAIT ? linesBottom : linesBottom - big * 1.3 * 2 // in portrait one line at a time, all in the same place
  const roleBase = firstBase - big * 1.3 - 14 * dpr
  const ruleY = roleBase - role - 14 * dpr
  if (PORTRAIT) {
    // only the drop separates first and last name: the last name sits right above the text block
    name.ky = ruleY - 4.5 * vh
    const f = g.font,
      ls = g.letterSpacing,
      fs = g.fillStyle
    g.font = name.font
    g.letterSpacing = name.ls
    g.fillStyle = '#0f0'
    g.fillText(copy.last, name.kx, name.ky)
    g.font = f
    g.letterSpacing = ls
    g.fillStyle = fs
  }
  g.fillStyle = 'rgba(255,255,255,0.2)'
  g.fillRect(bx, ruleY, bw, dpr)
  g.font = `400 ${role}px "Mattone"`
  g.fillStyle = 'rgba(255,255,255,0.7)'
  g.fillText(copy.role, bx, roleBase)
  g.font = `${12 * dpr}px ui-monospace, Menlo, monospace`
  g.letterSpacing = `${3.6 * dpr}px`
  g.fillStyle = '#fff'
  g.fillText(`${copy.cta.toLocaleUpperCase()} ↓`, bx, ctaY)

  const l = document.createElement('canvas')
  l.width = W
  l.height = H
  const h = l.getContext('2d') as Ctx
  h.fillStyle = '#000'
  h.fillRect(0, 0, W, H)
  h.font = `700 ${big}px "Mattone"`
  h.globalCompositeOperation = 'lighter'
  ;['#f00', '#0f0', '#00f'].forEach((c, i) => {
    h.fillStyle = c
    h.fillText(lines[i], bx, firstBase + (PORTRAIT ? 0 : i * big * 1.3))
  })
  // the block's rectangle (the contour lines fade under it), in q units (y from the bottom)
  const fade: [number, number, number, number] = [
    (bx - 20 * dpr) / H,
    (H - ctaY - 16 * dpr) / H,
    (bx + bw + 10 * dpr) / H,
    (H - ruleY + 24 * dpr) / H,
  ]
  // the same strings as DOM text (transparent, for selecting): font and baseline from the same measurement
  const sel: SelectableText[] = []
  const put = (text: string, font: string, ls: string, x: number, y: number) => {
    g.font = font
    g.letterSpacing = ls
    const m = g.measureText(text)
    sel.push({ text, font, ls, x, y, a: m.fontBoundingBoxAscent, d: m.fontBoundingBoxDescent })
  }
  put(copy.first, name.font, name.ls, name.sx, name.sy)
  put(copy.last, name.font, name.ls, name.kx, name.ky)
  put(copy.role, `400 ${role}px "Mattone"`, '0px', bx, roleBase)
  ;(PORTRAIT ? lines.slice(0, 1) : lines).forEach((t, i) =>
    put(t, `700 ${big}px "Mattone"`, '0px', bx, firstBase + i * big * 1.3)
  )
  return { s, l, fade, name, sel }
}
