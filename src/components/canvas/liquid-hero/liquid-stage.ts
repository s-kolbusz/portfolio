import { heroTextures, type HeroCopy } from './hero-textures'
import { startLoader } from './loader'
// The home hero's liquid and the stronypodhale.pl scene it turns into: WebGL2 renderer, input
// (mouse, touch, tilt), the scroll-driven transition into the water sheet and the timed act.
// A faithful port of cook/ciecz-czastki/index.html (the accepted test page): numbers, order of
// passes and timings are the same. Differences are only where the page now lives inside the site:
// the canvas sits in a sticky stage of a tall track instead of a fixed full page, scroll is measured
// from the track's top, the page does not reload on rotation (the component remounts instead), and
// the debug readout is gone.
import type { PhysicsInMessage, PhysicsOutMessage } from './physics.worker'
import {
  BLUR_FRAGMENT,
  FLOOD_FRAGMENT,
  HEIGHT_FRAGMENT,
  JFA_DIST_FRAGMENT,
  JFA_INIT_FRAGMENT,
  JFA_STEP_FRAGMENT,
  MAIN_FRAGMENT,
  SPLAT_FRAGMENT,
  SPLAT_VERTEX,
  VERTEX,
} from './shaders'
import { STEPS_PER_SECOND } from './sim'
import type { Terrain } from './terrain'
import { loadTerrain } from './terrain'

export interface LiquidStageElements {
  track: HTMLElement
  stage: HTMLElement
  canvas: HTMLCanvasElement
  loaderCanvas: HTMLCanvasElement
  sel: HTMLElement
  scene: HTMLElement
  pins: HTMLElement
  tilt: HTMLButtonElement
}

export interface LiquidStageOptions {
  copy: HeroCopy
  /** WebGL2 (or something it needs) is missing, or setup failed: show the static page. */
  onFail: () => void
  /** The viewport changed shape (rotation, a real resize): build the stage again. */
  onRemount: () => void
}

/**
 * The scroll the stage stays pinned for, in screen heights. The test page's body was 400vh; here one
 * screen more, so the finished scene (wordmark, line, pins) holds for 1.5 screens before the next
 * section scrolls in (owner, 2026-11-17: it left too soon).
 */
export const TRACK_SCREENS = 5
/** The scroll transition into the water sheet: where it starts and how long it runs, in screen heights. */
const TRANSITION_FROM = 0.1,
  TRANSITION_LEN = 2.4
/** The transition's progress at which the scene's act starts (it stops below ACT_OFF_P: hysteresis). */
const ACT_ON_P = 0.86,
  ACT_OFF_P = 0.84
/** Where the act has started for sure: anchor for "See the work" (scroll in screen heights). */
export const WORK_AT = TRANSITION_FROM + TRANSITION_LEN
/** Where the act starts, in screen heights: the hold runs from here to the unpin. */
export const HOLD_FROM = TRANSITION_FROM + ACT_ON_P * TRANSITION_LEN

const FG = '#2b2620'
const ADAPT_THEME_SELECTOR = '[data-adapt-theme]'

// keeps the JIT probe loop from being optimised away
const jitProbe = { sink: 0 }

/** WebGL2 with float render targets: what the liquid needs to run at all. */
export function supportsLiquid(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return false
    const ok = !!gl.getExtension('EXT_color_buffer_float')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

export function startLiquidStage(els: LiquidStageElements, opts: LiquidStageOptions): () => void {
  let alive = true
  const cleanups: Array<() => void> = []
  const abort = new AbortController()
  cleanups.push(() => abort.abort())
  const listen = <K extends keyof WindowEventMap>(
    target: Window | HTMLElement,
    type: K,
    fn: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, fn as EventListener, options)
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, options))
  }

  run(els, opts, {
    alive: () => alive,
    listen,
    cleanup: (fn) => cleanups.push(fn),
    signal: abort.signal,
  }).catch((error: unknown) => {
    if (!alive) return
    console.warn('liquid hero: falling back to the static page', error)
    opts.onFail()
  })

  return () => {
    alive = false
    for (const fn of cleanups.splice(0)) fn()
  }
}

interface Life {
  alive: () => boolean
  listen: <K extends keyof WindowEventMap>(
    target: Window | HTMLElement,
    type: K,
    fn: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => void
  cleanup: (fn: () => void) => void
  signal: AbortSignal
}

class Cancelled extends Error {}

async function run(els: LiquidStageElements, opts: LiquidStageOptions, life: Life) {
  const { track, stage, canvas, sel: selLayer, scene, pins: pinsEl, tilt: tiltBtn } = els
  const check = () => {
    if (!life.alive()) throw new Cancelled()
  }
  // measurement on devices: ?dpr=1 forces the render resolution; ?lekko forces light mode
  const qs = new URLSearchParams(location.search)
  const dpr = +(qs.get('dpr') ?? '') || Math.min(window.devicePixelRatio || 1, 2)
  // height captured on load: on a phone the address bar hides while scrolling and changes innerHeight,
  // and the page must stay the same then (no recalculation, no rebuild).
  // The canvas is as tall as the screen with the bar hidden (100lvh); text sits in the part that is
  // visible with the bar too (INSET from the bottom).
  const lvhProbe = document.createElement('div')
  lvhProbe.style.cssText = 'position:absolute;top:0;height:100lvh;width:1px;visibility:hidden'
  document.body.append(lvhProbe)
  // INSET is only the browser bar (up to ~15% of the height); a bigger difference means the window was
  // squeezed for a moment, and then it is not trusted
  const VW = document.documentElement.clientWidth,
    VH0 = Math.max(innerHeight, lvhProbe.offsetHeight)
  const VH = VH0 - innerHeight > 0.15 * VH0 ? innerHeight : VH0,
    INSET = VH - innerHeight
  lvhProbe.remove()
  const W = Math.round(VW * dpr),
    H = Math.round(VH * dpr)
  canvas.width = W
  canvas.height = H
  stage.style.height = VH + 'px'
  track.style.height = TRACK_SCREENS * VH + 'px'
  const A = VW / VH
  const PORTRAIT = A < 0.9 // phone upright: text block above the last name, smaller drop
  // light mode for browsers without a JIT (e.g. Safari on iPad in some settings): physics is ~30× slower
  // there. A simple loop measures it right away: with a JIT a few to a dozen ms, without over 30.
  const jitMs = (() => {
    const t = performance.now()
    let a = 0
    for (let i = 0; i < 3e6; i++) a += (i & 7) * 0.5
    jitProbe.sink = a
    return performance.now() - t
  })()
  const LIGHT = qs.has('lekko') || jitMs > 24
  // in light mode particles are bigger (radius 0.03 instead of 0.021), so there are about half as many
  const Hq = LIGHT ? 0.03 : 0.021,
    SPACING = 0.42 // particle interaction radius in screen heights

  await Promise.all([
    document.fonts.load('500 40px "Cabinet Grotesk"'),
    document.fonts.load('800 40px "Cabinet Grotesk"'),
    document.fonts.load('900 40px "Mattone"'),
    document.fonts.load('700 20px "Mattone"'),
    document.fonts.load('400 20px "Mattone"'),
  ])
  check()

  const T = heroTextures(opts.copy, { W, H, dpr, INSET, PORTRAIT })
  // where the name's S and K stand (CSS px in the stage, baselines): the site bar's initials leave the name from there
  stage.dataset.name = JSON.stringify({
    s: [T.name.sx / dpr, T.name.sy / dpr],
    k: [T.name.kx / dpr, T.name.ky / dpr],
    size: T.name.S / dpr,
    ls: parseFloat(T.name.ls) / dpr,
  })
  life.cleanup(() => delete stage.dataset.name)

  const glc = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false })
  if (!glc) throw new Error('no WebGL2')
  const gl = glc
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no EXT_color_buffer_float')
  life.cleanup(() => gl.getExtension('WEBGL_lose_context')?.loseContext())
  function program(v: string, f: string) {
    const p = gl.createProgram()
    for (const [type, src] of [
      [gl.VERTEX_SHADER, v],
      [gl.FRAGMENT_SHADER, f],
    ] as const) {
      const s = gl.createShader(type)
      if (!s) throw new Error('createShader failed')
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      gl.attachShader(p, s)
    }
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(p) ?? 'link')
    return p
  }
  const main = program(VERTEX, MAIN_FRAGMENT),
    splat = program(SPLAT_VERTEX, SPLAT_FRAGMENT)
  const tex = (unit: number, filter: number = gl.LINEAR) => {
    const t = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, t)
    for (const [p, v] of [
      [gl.TEXTURE_MIN_FILTER, filter],
      [gl.TEXTURE_MAG_FILTER, filter],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ])
      gl.texParameteri(gl.TEXTURE_2D, p, v)
    return t
  }

  // the transparent, selectable DOM copy of the hero text
  selLayer.replaceChildren()
  for (const t of T.sel) {
    const el = document.createElement('span')
    el.textContent = t.text
    const px = (v: number) => v / dpr + 'px'
    el.style.cssText = `left:${px(t.x)};top:${px(t.y - t.a)};line-height:${px(t.a + t.d)};font:${t.font.replace(/([\d.]+)px/, (_, n: string) => +n / dpr + 'px')};letter-spacing:${parseFloat(t.ls) / dpr}px`
    selLayer.append(el)
  }
  life.cleanup(() => selLayer.replaceChildren())
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  tex(0)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.s)
  tex(1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.l)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  // terrain (1.2 MB) loaded with real progress; the loader shows it by filling the initials
  let TER: Terrain | null = null
  const loader = startLoader({
    canvas: els.loaderCanvas,
    name: T.name,
    first: opts.copy.first,
    last: opts.copy.last,
    W,
    H,
    dpr,
    ink: FG,
    terrain: () => TER,
    // a reload or a jump further down the page: the hero is out of sight, so its show is skipped
    skip: () => -track.getBoundingClientRect().top > VH * 0.5,
  })
  life.cleanup(loader.stop)
  TER = await loadTerrain((f) => {
    loader.progress = f
  }, life.signal)
  check()
  tex(2)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R16F,
    TER.w,
    TER.h,
    0,
    gl.RED,
    gl.FLOAT,
    new Float32Array(TER.data)
  )
  // density field
  const DW = Math.round(W / 2),
    DH = Math.round(H / 2)
  const dTex = tex(3)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, DW, DH, 0, gl.RGBA, gl.HALF_FLOAT, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dTex, 0)
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    throw new Error('density FBO incomplete')
  // full 32-bit precision where the card can blend such textures: 16 bits gave steps that read as a grid in the light
  const f32 = !!(gl.getExtension('EXT_float_blend') && gl.getExtension('OES_texture_float_linear'))
  gl.useProgram(main)
  gl.uniform2f(gl.getUniformLocation(main, 'uDomeSize'), Math.round(W / 4), Math.round(H / 4))
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  // distance from the liquid's edge (jump flooding) at density resolution, then a blur so the ridge in the middle has no crease
  const jfaInit = program(VERTEX, JFA_INIT_FRAGMENT)
  // the sheet's front: spreads from the liquid's edge, unevenly, so it floods the frame like spilled water
  const flood = program(VERTEX, FLOOD_FRAGMENT)
  const jfaStep = program(VERTEX, JFA_STEP_FRAGMENT)
  const jfaDist = program(VERTEX, JFA_DIST_FRAGMENT)
  const blur = program(VERTEX, BLUR_FRAGMENT)
  const fl = f32 ? gl.FLOAT : gl.HALF_FLOAT
  const JW = Math.round(DW / 2),
    JH = Math.round(DH / 2) // distance field at 1/4 resolution: accurate enough and cheap
  const mkTarget = (unit: number, fmt: number, filter: number) => {
    const t = tex(unit, filter)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      fmt,
      JW,
      JH,
      0,
      fmt === gl.RG32F || fmt === gl.RG16F ? gl.RG : gl.RED,
      fl,
      null
    )
    const f = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, f)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error('distance field FBO incomplete')
    return { t, f }
  }
  const jA = mkTarget(6, f32 ? gl.RG32F : gl.RG16F, gl.NEAREST),
    jB = mkTarget(6, f32 ? gl.RG32F : gl.RG16F, gl.NEAREST)
  const dRaw = mkTarget(6, f32 ? gl.R32F : gl.R16F, gl.NEAREST),
    dTmp = mkTarget(6, f32 ? gl.R32F : gl.R16F, gl.NEAREST)
  const dOut = mkTarget(5, f32 ? gl.R32F : gl.R16F, gl.LINEAR),
    dU = mkTarget(5, f32 ? gl.R32F : gl.R16F, gl.LINEAR)
  let floodR = 0
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  const hgtPass = program(VERTEX, HEIGHT_FRAGMENT)
  const hOut = mkTarget(7, f32 ? gl.R32F : gl.R16F, gl.LINEAR)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(gl.getAttribLocation(main, 'aPos'))
  gl.vertexAttribPointer(gl.getAttribLocation(main, 'aPos'), 2, gl.FLOAT, false, 0, 0)

  const tr = { spread: 0, dark: 0, imageIn: 0, clarity: 0, P: 0 }
  let time = 0

  function distanceField() {
    gl.disable(gl.BLEND)
    gl.viewport(0, 0, JW, JH)
    gl.bindVertexArray(vao)
    const pass = (
      prog: WebGLProgram,
      target: { f: WebGLFramebuffer },
      src: WebGLTexture,
      setup?: (p: WebGLProgram) => void
    ) => {
      gl.useProgram(prog)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.f)
      gl.activeTexture(gl.TEXTURE6)
      gl.bindTexture(gl.TEXTURE_2D, src)
      gl.uniform1i(gl.getUniformLocation(prog, prog === jfaInit ? 'uD' : 'uS'), 6)
      if (setup) setup(prog)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const jfa = (inv: number) => {
      pass(jfaInit, jA, dTex, (p) => {
        gl.uniform1f(gl.getUniformLocation(p, 'uIso'), 0.38)
        gl.uniform1f(gl.getUniformLocation(p, 'uInv'), inv)
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
    }
    jfa(0)
    pass(blur, dTmp, dRaw.t, (p) => gl.uniform2f(gl.getUniformLocation(p, 'uDir'), 1, 0))
    pass(blur, dOut, dTmp.t, (p) => gl.uniform2f(gl.getUniformLocation(p, 'uDir'), 0, 1))
    let dist = dOut
    if (floodR > 0) {
      // the sheet: distance outward from the liquid, and from it the front that floods the frame
      jfa(1)
      gl.useProgram(flood)
      gl.bindFramebuffer(gl.FRAMEBUFFER, dU.f)
      gl.activeTexture(gl.TEXTURE5)
      gl.bindTexture(gl.TEXTURE_2D, dOut.t)
      gl.uniform1i(gl.getUniformLocation(flood, 'uIn'), 5)
      gl.activeTexture(gl.TEXTURE9)
      gl.bindTexture(gl.TEXTURE_2D, dRaw.t)
      gl.uniform1i(gl.getUniformLocation(flood, 'uOut'), 9)
      gl.uniform1f(gl.getUniformLocation(flood, 'uR'), floodR)
      gl.uniform1f(gl.getUniformLocation(flood, 'uTime'), time)
      gl.uniform2f(gl.getUniformLocation(flood, 'uJ'), JW, JH)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      dist = dU
    }
    gl.activeTexture(gl.TEXTURE5)
    gl.bindTexture(gl.TEXTURE_2D, dist.t)
    // the liquid's height once per frame, at the distance field's resolution
    gl.useProgram(hgtPass)
    gl.bindFramebuffer(gl.FRAMEBUFFER, hOut.f)
    gl.uniform1i(gl.getUniformLocation(hgtPass, 'uDist'), 5)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uDH'), JH)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uTime'), time)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uSpread'), tr.spread)
    gl.uniform1f(gl.getUniformLocation(hgtPass, 'uClarity'), tr.clarity)
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, dTex)
    gl.uniform1i(gl.getUniformLocation(hgtPass, 'uDens'), 3)
    gl.uniform2f(gl.getUniformLocation(hgtPass, 'uJ'), JW, JH)
    gl.uniform2f(gl.getUniformLocation(hgtPass, 'uRes'), W, H)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.activeTexture(gl.TEXTURE7)
    gl.bindTexture(gl.TEXTURE_2D, hOut.t)
  }

  gl.useProgram(main)
  const U = (n: string) => gl.getUniformLocation(main, n)
  ;['uStatic', 'uLines', 'uTer', 'uDens', 'uDome', 'uDist'].forEach((n, i) => gl.uniform1i(U(n), i))
  gl.uniform1i(U('uHgt'), 7)
  gl.uniform1f(U('uDH'), Math.round(Math.round(H / 2) / 2))
  gl.uniform2f(U('uHgtSize'), JW, JH)
  // terrain: at the start a cut with an even density of contour lines; scroll moves the view across the map (uphill) and zooms in a little
  const [sx0, sy0, sw0, sh0] = TER.start
  const sc0 = Math.max(W / sw0, H / sh0)
  gl.uniform2f(U('uTerSize'), TER.w, TER.h)
  gl.uniform2f(U('uRes'), W, H)
  gl.uniform1f(U('uDpr'), dpr)
  function terrainView(s: number) {
    // s = scroll in px
    const pan = Math.min(s * 0.075, 300) // terrain pixels
    const sc = sc0 * (1 + Math.min(s, 4000) * 0.00004)
    const cx = sx0 + sw0 / 2 - pan * 0.18,
      cy = sy0 + sh0 / 2 - pan
    gl.uniform1f(U('uTerSc'), sc)
    gl.uniform2f(U('uTerOff'), cx * sc - W / 2, cy * sc - H / 2)
  }
  gl.uniform4f(U('uFade'), ...T.fade)
  gl.uniform1f(U('uBlockRight'), T.fade[2] + 0.02)
  gl.uniform1f(U('uNameOn'), 0)
  let signed = false
  // the stronypodhale.pl screenshot: in the middle of the frame, where it will later stand in the scene.
  // On phones it is the site as seen on a phone (portrait, owner 2026-11-14); elsewhere the desktop view, 16:9.
  const PHONE_SHOT = VW < 700
  const IA = PHONE_SHOT ? 390 / 844 : 16 / 9 // the screenshot's width / height
  {
    const img = new Image()
    img.src = PHONE_SHOT
      ? '/images/projects/stronypodhale-mobile.avif'
      : '/images/projects/stronypodhale.avif'
    img
      .decode()
      .then(() => {
        if (!life.alive()) return
        tex(8)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.useProgram(main)
        gl.uniform1i(U('uImg'), 8)
        // the sheet's colour: the page background from the screenshot, computed as on the live scene
        // (median of channels along the left, right and bottom edges)
        const c = Object.assign(document.createElement('canvas'), { width: 64, height: 36 }),
          g = c.getContext('2d', { willReadFrequently: true })
        if (!g) return
        g.drawImage(img, 0, 0, 64, 36)
        const d = g.getImageData(0, 0, 64, 36).data,
          ch: number[][] = [[], [], []]
        const take = (x: number, y: number) => {
          const i = (y * 64 + x) * 4
          for (let k = 0; k < 3; k++) ch[k].push(d[i + k])
        }
        for (let y = 0; y < 36; y++) for (const x of [1, 2, 61, 62]) take(x, y)
        for (let x = 0; x < 64; x++) take(x, 34)
        const med = (v: number[]) => v.sort((a, b) => a - b)[v.length >> 1] / 255
        const [r, gg, b] = ch.map(med)
        gl.useProgram(main)
        gl.uniform3f(U('uDarkCol'), r, gg, b)
        stage.style.setProperty(
          '--scene',
          `rgb(${[r, gg, b].map((v) => Math.round(v * 255)).join(' ')})`
        )
      })
      .catch(() => {})
  }
  gl.uniform3f(U('uDarkCol'), 21 / 255, 48 / 255, 31 / 255)

  // --- the stronypodhale scene. While the screenshot is alone it stands in the middle; once the water
  // settles the act starts (in time, like reveals on the rest of the site, and in reverse when scrolling
  // back): the frame moves to its place, the brand's huge wordmark rises letter by letter, then the line
  // and the link, and finally pins with notes stick into the screenshot.
  const VIS = VH - INSET
  const wm = scene.querySelector<HTMLElement>('.wm'),
    row = scene.querySelector<HTMLElement>('.row')
  if (!wm || !row) throw new Error('scene markup missing')
  const pad = Math.max(24, 0.0667 * VW)
  const cw = Math.min(VW - 2 * pad, 1240)
  scene.style.left = (VW - cw) / 2 + 'px'
  scene.style.width = cw + 'px'
  // the wordmark across the whole block (it is the brand that should stay in memory). Measured on an
  // unsplit copy, as the test page measured it before splitting it into letters.
  {
    const probe = wm.cloneNode(false) as HTMLElement
    for (const part of Array.from(wm.children)) {
      const p = part.cloneNode(false) as HTMLElement
      p.textContent = part.textContent
      probe.append(p)
    }
    probe.removeAttribute('aria-label')
    probe.setAttribute('aria-hidden', 'true')
    probe.style.fontSize = '100px'
    scene.append(probe)
    wm.style.fontSize = Math.min((100 * cw) / probe.scrollWidth, 0.3 * VIS) + 'px'
    probe.remove()
  }
  if (VW < 700) {
    row.style.flexDirection = 'column'
    row.style.gap = '14px'
  }
  const wmH = wm.offsetHeight,
    rowH = row.offsetHeight
  const overlap = wmH * 0.16 // the frame slides a little under the wordmark: the wordmark lies on top, as if stuck onto the water
  const gapY = PORTRAIT ? 18 : 26,
    vpad = 2 * Math.min(pad, 36)
  // the portrait phone screenshot is capped at 60% of the visible height: the scene must not run under the site's bar
  const fw = Math.min(
      cw,
      (VIS - (wmH - overlap) - gapY - rowH - vpad) * IA,
      PHONE_SHOT ? 0.6 * VIS * IA : Infinity
    ),
    fh = fw / IA
  const stackTop = (VIS - (wmH - overlap + fh + gapY + rowH)) / 2
  const placed = { x: (VW - fw) / 2, y: stackTop + wmH - overlap }
  scene.style.top = stackTop + 'px'
  row.style.top = wmH - overlap + fh + gapY + 'px'
  if (fw < cw && !PHONE_SHOT) {
    row.style.left = (cw - fw) / 2 + 'px'
    row.style.right = (cw - fw) / 2 + 'px'
  }

  // pins: places on the screenshot (fractions of width and height) with notes about decisions in this project
  const hoverNone = matchMedia('(hover: none)').matches
  const pins = Array.from(pinsEl.querySelectorAll<HTMLElement>('.pin')).map((el) => {
    const u = +((PHONE_SHOT ? el.dataset.mu : el.dataset.u) ?? 0),
      v = +((PHONE_SHOT ? el.dataset.mv : el.dataset.v) ?? 0)
    const x = placed.x + u * fw,
      y = placed.y + v * fh
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    const note = el.querySelector<HTMLElement>('p')
    const btn = el.querySelector<HTMLButtonElement>('button')
    if (!note || !btn) throw new Error('pin markup missing')
    // a note may not leave the screen: then it goes down and shifts towards the middle
    const fit = () => {
      const r = note.getBoundingClientRect()
      return r.left >= 12 && r.right <= VW - 12
    }
    if (!fit()) el.dataset.d = 'b'
    {
      const r = note.getBoundingClientRect()
      if (r.right > VW - 12) note.style.left = VW - 12 - r.width - x + 'px'
      if (r.left < 12) note.style.left = 12 - x + 'px'
    }
    const toggle = () => {
      const open = !el.classList.contains('open')
      // on a narrow screen a note covers the neighbouring pins, so one is open at a time (it stays until you close it)
      if (open && VW < 700)
        for (const o of Array.from(pinsEl.querySelectorAll('.pin.open'))) {
          o.classList.remove('open')
          o.querySelector('button')?.setAttribute('aria-expanded', 'false')
        }
      el.classList.toggle('open', open)
      btn.setAttribute('aria-expanded', String(open))
    }
    if (!hoverNone) {
      life.listen(el, 'mouseenter', () => el.classList.add('peek'))
      life.listen(el, 'mouseleave', () => el.classList.remove('peek'))
    }
    life.listen(btn, 'click', toggle)
    // on a narrow screen an open note covers the pins under it: a tap on the note closes it
    if (VW < 700)
      life.listen(note, 'click', () => {
        if (el.classList.contains('open')) toggle()
      })
    return { el, btn }
  })
  life.cleanup(() => {
    for (const p of pins) {
      p.el.classList.remove('on', 'open', 'peek')
      p.btn.setAttribute('aria-expanded', 'false')
    }
  })

  let actT = 0,
    actOn = false // seconds of the act (0…ACT_LEN), forwards or backwards
  const ACT_LEN = 2.8
  const cl01 = (x: number) => Math.min(Math.max(x, 0), 1)
  const ease3 = (x: number) => 1 - (1 - x) ** 3
  const chars = Array.from(wm.querySelectorAll<HTMLElement>('.ch')),
    rest = Array.from(row.querySelectorAll<HTMLElement>('.i'))
  const masks = [...chars, ...rest]
  const startAt = [...chars.map((_, i) => 0.45 + i * 0.035), ...rest.map((_, i) => 1.15 + i * 0.1)]
  function imgRect(zoom: number) {
    const mv = ease3(cl01(actT / 1.0)) // the frame moves to its place during the act's first second
    const cx0 = VW / 2,
      cy0 = VIS / 2,
      cx1 = placed.x + fw / 2,
      cy1 = placed.y + fh / 2
    const cx = cx0 + (cx1 - cx0) * mv,
      cy = cy0 + (cy1 - cy0) * mv
    const w = fw * zoom,
      h = w / IA
    gl.useProgram(main)
    gl.uniform4f(U('uImgRect'), (cx - w / 2) / VH, 1 - (cy + h / 2) / VH, w / VH, h / VH)
    gl.uniform1f(U('uImgR'), (16 * zoom) / VH)
  }
  function act(dt: number, P: number) {
    actOn = P > ACT_ON_P ? true : P < ACT_OFF_P ? false : actOn
    actT = Math.min(Math.max(actT + (actOn ? dt : -dt * 1.4), 0), ACT_LEN)
    // once the stage leaves upwards the scene is simply finished: a fast scroll or a reload further down
    // must not play its entrance while it slides away (or when it comes back down from above)
    if (actOn && stageTop < -1) actT = ACT_LEN
    scene.style.visibility = actT > 0 ? 'visible' : 'hidden'
    masks.forEach((el, i) => {
      const k = ease3(cl01((actT - startAt[i]) / 0.8))
      el.style.transform = `translateY(${(1 - k) * 135}%)`
    })
    // pins stick in one by one when everything stands; when going back they hide together with their notes
    pins.forEach((p, i) => {
      const on = actT > 1.9 + i * 0.12
      p.el.classList.toggle('on', on)
      if (!on && p.el.classList.contains('open')) {
        p.el.classList.remove('open')
        p.btn.setAttribute('aria-expanded', 'false')
      }
    })
  }

  // --- simulation
  // upright, the drop sits in the free band between the first name and the block's rule (q from the bottom)
  const gapTop = 1 - (T.name.sy + T.name.S * 0.12) / H,
    gapBot = 1 - (T.name.ky - T.name.asc) / H
  const blobY = PORTRAIT ? (gapTop + gapBot) / 2 : INSET / VH + 0.5 * (1 - INSET / VH)
  const blobR = PORTRAIT ? Math.min(0.44 * A, (gapTop - gapBot) * 0.6) : 0.235
  // physics runs in its own thread; here we only draw its result, smoothed between the last two states.
  // On touch there is no cursor, so no cursor drop either: the finger grabs liquid from the body.
  const physics = new Worker(new URL('./physics.worker.ts', import.meta.url), { type: 'module' })
  life.cleanup(() => physics.terminate())
  const post = (message: PhysicsInMessage, transfer?: Transferable[]) =>
    transfer ? physics.postMessage(message, transfer) : physics.postMessage(message)
  const cur = {
    x: -99,
    y: -99,
    vx: 0,
    vy: 0,
    inside: false,
    down: false,
    impulse: 0,
    grabR: undefined as number | undefined,
    grabK: undefined as number | undefined,
  }
  let snapA: Float32Array | null = null,
    snapB: Float32Array | null = null,
    tB = 0,
    gapMs = 1000 / 60
  const simState = { mainMass: 0, pieces: 0, pieceList: [] as number[] }
  let rebelN = 0
  const N = await new Promise<number>((ok, fail) => {
    let n = 0
    physics.onerror = (e) => fail(new Error(e.message || 'physics worker failed'))
    physics.onmessage = ({ data }: MessageEvent<PhysicsOutMessage>) => {
      if (data.ready) {
        n = data.N ?? 0
        rebelN = data.rebelN ?? 0
        return
      }
      if (!data.pos) return
      const now = performance.now()
      if (snapA && snapA !== snapB) post({ buf: snapA }, [snapA.buffer]) // the old buffer goes back to the thread
      snapA = snapB || data.pos
      snapB = data.pos
      if (tB) gapMs += (Math.min(now - tB, 100) - gapMs) * 0.2 // average gap between states
      tB = now
      if (data.state) Object.assign(simState, data.state)
      if (n) ok(n)
    }
    post({
      light: LIGHT,
      init: {
        width: A / Hq,
        height: 1 / Hq,
        center: { x: A / 2 / Hq, y: blobY / Hq },
        radius: blobR / Hq,
        spacing: SPACING,
        rebelAt: hoverNone ? null : { x: (A * 0.245) / Hq, y: 0.57 / Hq },
        rebelRadius: (2.3 * 0.021) / Hq,
      },
    })
  })
  check()
  const pos = new Float32Array(N * 2)
  const pBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuf)
  gl.bufferData(gl.ARRAY_BUFFER, pos.byteLength, gl.DYNAMIC_DRAW)
  const pVao = gl.createVertexArray()
  gl.bindVertexArray(pVao)
  gl.enableVertexAttribArray(gl.getAttribLocation(splat, 'aP'))
  gl.vertexAttribPointer(gl.getAttribLocation(splat, 'aP'), 2, gl.FLOAT, false, 0, 0)
  gl.useProgram(splat)
  const splatR = 3.3 * SPACING * Hq // splat radius in q units
  gl.uniform1f(gl.getUniformLocation(splat, 'uA'), A)
  const perParticle = ((SPACING * Hq) ** 2 * Math.sqrt(3)) / 2
  const norm1 = 1 / ((Math.PI * splatR * splatR) / 4 / perParticle)
  const sMask = gl.getUniformLocation(splat, 'uMask'),
    sSize = gl.getUniformLocation(splat, 'uSize'),
    sNorm = gl.getUniformLocation(splat, 'uNorm')

  // --- cursor and touch (units of h, velocity in h per step)
  let stageTop = stage.getBoundingClientRect().top
  let last: { x: number; y: number; t: number } | null = null
  const toSim = (clientX: number, clientY: number) => ({
    x: clientX / VH / Hq,
    y: (1 - (clientY - stageTop) / VH) / Hq,
    t: performance.now(),
  })
  let selecting = false
  life.listen(window, 'pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const p = toSim(e.clientX, e.clientY)
    cur.inside = true
    // while selecting text the cursor does not drag the liquid
    if (selecting) {
      cur.vx = 0
      cur.vy = 0
      cur.x = p.x
      cur.y = p.y
      last = p
      return
    }
    // a jump (e.g. the cursor comes back into the window elsewhere) is not a movement
    if (last && Math.hypot(p.x - last.x, p.y - last.y) < 8) {
      const dt = Math.max(((p.t - last.t) / 1000) * STEPS_PER_SECOND, 0.5)
      cur.vx = cur.vx * 0.5 + ((p.x - last.x) / dt) * 0.5
      cur.vy = cur.vy * 0.5 + ((p.y - last.y) / dt) * 0.5
    }
    cur.x = p.x
    cur.y = p.y
    last = p
  })
  // --- mouse: hover, move, click, hold
  const inStage = (e: Event) => e.target instanceof Node && stage.contains(e.target)
  const onText = (e: Event) =>
    e.target instanceof Element &&
    !!e.target.closest('.sel span, .scene .wm, .scene .say, .scene a, .pin')
  life.listen(window, 'pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || !inStage(e)) return
    if (onText(e)) {
      selecting = true // selecting text wins over breaking the drop
      return
    }
    const p = toSim(e.clientX, e.clientY)
    cur.x = p.x
    cur.y = p.y
    cur.inside = true
    cur.down = true
    cur.impulse = (1.1 * 0.021) / Hq
  })
  life.listen(window, 'pointerup', (e) => {
    if (e.pointerType === 'mouse') {
      cur.down = false
      selecting = false
    }
  })

  // --- touch: its own rules. A finger outside the liquid scrolls the page and leaves the liquid alone.
  // A finger on the liquid grabs it (the page does not scroll then): dragging pulls, a fast flick tears,
  // a short tap splashes. The cursor drop is under the finger only while touching, then flows back.
  const isTouch = hoverNone
  if (isTouch) {
    cur.grabR = 5.5
    cur.grabK = 0.1
  } // a finger grabs wider and firmer than the mouse: there is no hover, only the grab
  function onLiquid(clientX: number, clientY: number) {
    if (!snapB) return false
    const x = clientX / VH / Hq,
      y = (1 - (clientY - stageTop) / VH) / Hq
    let n = 0
    for (let i = 0; i < N; i++) {
      const dx = snapB[i * 2] - x,
        dy = snapB[i * 2 + 1] - y
      if (dx * dx + dy * dy < 2.5) {
        if (++n > 2) return true
      }
    }
    return false
  }
  let touchId: number | null = null,
    touchStart: { x: number; y: number; t: number; cx: number; cy: number } | null = null
  life.listen(
    window,
    'touchstart',
    (e) => {
      if (touchId !== null) return
      const t = e.changedTouches[0]
      if (!inStage(e) || onText(e) || !onLiquid(t.clientX, t.clientY)) return // on text: selecting; off the liquid: normal scrolling
      e.preventDefault() // on the liquid: the finger belongs to the liquid
      touchId = t.identifier
      const p = toSim(t.clientX, t.clientY)
      touchStart = { ...p, cx: t.clientX, cy: t.clientY }
      cur.x = p.x
      cur.y = p.y
      cur.vx = 0
      cur.vy = 0
      cur.inside = true
      cur.down = true
      last = p
    },
    { passive: false }
  )
  life.listen(
    window,
    'touchmove',
    (e) => {
      if (touchId === null) return
      const t = Array.from(e.changedTouches).find((c) => c.identifier === touchId)
      if (!t) return
      e.preventDefault()
      const p = toSim(t.clientX, t.clientY)
      if (last) {
        const dt = Math.max(((p.t - last.t) / 1000) * STEPS_PER_SECOND, 0.5)
        cur.vx = cur.vx * 0.5 + ((p.x - last.x) / dt) * 0.5
        cur.vy = cur.vy * 0.5 + ((p.y - last.y) / dt) * 0.5
      }
      cur.x = p.x
      cur.y = p.y
      last = p
    },
    { passive: false }
  )
  let touchTimer: ReturnType<typeof setTimeout> | undefined
  life.cleanup(() => clearTimeout(touchTimer))
  function endTouch(e: TouchEvent) {
    if (touchId === null || !touchStart) return
    const t = Array.from(e.changedTouches).find((c) => c.identifier === touchId)
    if (!t) return
    // a short tap without moving: a splash
    if (
      performance.now() - touchStart.t < 250 &&
      Math.hypot(t.clientX - touchStart.cx, t.clientY - touchStart.cy) < 12
    )
      cur.impulse = (1.1 * 0.021) / Hq
    touchId = null
    cur.down = false
    touchTimer = setTimeout(() => {
      if (touchId === null) cur.inside = false
    }, 60) // the hit has time to act
  }
  life.listen(window, 'touchend', endTouch)
  life.listen(window, 'touchcancel', endTouch)

  // --- tilt: turned on with a button. "Level" is however you hold the device when you turn it on,
  // a small hand movement does nothing (dead zone), and the response is smoothed, so tilting feels predictable.
  type OrientationCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  const D = (window as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent
  if (isTouch && D && isSecureContext) tiltBtn.style.display = 'flex' // iOS gives the sensor only to HTTPS pages
  life.cleanup(() => {
    tiltBtn.style.display = ''
    tiltBtn.setAttribute('aria-pressed', 'false')
  })
  // upright, the name stands across the top, so the button sits in the "See the work" row, on the right
  if (PORTRAIT) {
    tiltBtn.style.top = `${VH - INSET - 0.05 * VH - 21}px`
    tiltBtn.style.right = `${0.0667 * VW}px`
  }
  let tiltOn = false,
    tgx = 0,
    tgy = 0,
    tiltListening = false,
    tiltBase: number[] | null = null
  function sendTilt(gx: number, gy: number, on: boolean) {
    post({
      P: on
        ? { gx, gy, anchor: 0.00002, anchorDamp: 0.003 }
        : { gx: 0, gy: 0, anchor: 0.00008, anchorDamp: 0.02 },
    })
  }
  // the "down" direction in the device frame (x right, y up the screen, z out of the screen) from beta/gamma
  // (Z-X'-Y'' order from the spec): down = (sin γ · cos β, −sin β, −cos γ · cos β).
  // The position at the moment of turning on is "straight": the liquid flows where "down" moved relative
  // to it, the faster the bigger the tilt (a difference of 0…~1 is 0…~60°).
  function down(o: DeviceOrientationEvent) {
    const b = ((o.beta ?? 0) * Math.PI) / 180,
      g = ((o.gamma || 0) * Math.PI) / 180
    return [Math.sin(g) * Math.cos(b), -Math.sin(b), -Math.cos(g) * Math.cos(b)]
  }
  function onOrient(o: DeviceOrientationEvent) {
    if (!tiltOn || o.beta == null) return
    const d = down(o)
    if (!tiltBase) {
      tiltBase = d
      return
    }
    const dx = d[0] - tiltBase[0],
      dy = d[1] - tiltBase[1]
    // screen rotation: the device turned by angle a counter-clockwise
    const legacy = (window as { orientation?: number }).orientation
    const a = ((legacy ?? screen.orientation?.angle ?? 0) * Math.PI) / 180
    let sx = dx * Math.cos(a) - dy * Math.sin(a),
      sy = dx * Math.sin(a) + dy * Math.cos(a)
    const m = Math.hypot(sx, sy),
      DZ = 0.05 // hand tremor (~3°) does nothing
    const k = m < DZ ? 0 : (m - DZ) / m
    sx *= k
    sy *= k
    tgx += (sx - tgx) * 0.25
    tgy += (sy - tgy) * 0.25
    sendTilt(tgx * 0.006, tgy * 0.006, true)
  }
  function setTilt(on: boolean) {
    tiltOn = on
    tiltBase = null
    tgx = tgy = 0
    tiltBtn.setAttribute('aria-pressed', on ? 'true' : 'false')
    if (!on) sendTilt(0, 0, false)
    else if (!tiltListening) {
      tiltListening = true
      life.listen(window, 'deviceorientation', onOrient)
    }
  }
  life.listen(tiltBtn, 'click', () => {
    if (tiltOn) return setTilt(false)
    if (D && typeof D.requestPermission === 'function')
      D.requestPermission()
        .then((r) => {
          if (r === 'granted' && life.alive()) setTilt(true)
        })
        .catch(() => {})
    else setTilt(true)
  })
  life.listen(document.documentElement, 'pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return
    cur.inside = false
    last = null
  })
  const scrollNow = () => Math.max(0, -track.getBoundingClientRect().top)
  // the eased scroll starts where the page is (a reload in the middle must not replay the transition
  // from the top), and a jump of more than a screen (restored scroll, a key, an anchor) is taken at once
  let shift = scrollNow(),
    shiftTarget = shift
  life.listen(
    window,
    'scroll',
    () => {
      const next = scrollNow()
      if (Math.abs(next - shiftTarget) > VH) shift = next
      shiftTarget = next
    },
    { passive: true }
  )

  // --- lines: they change at the moment of an event (tearing, first contact, whole again)
  // 0 "Nothing off the shelf." (rest), 1 "I take things apart." (tearing), 2 "I put them back…" (merging), whole → 0 again
  // upright only the current line shows (the others fade out fully); on a wide screen the others are dimmed
  const DIM = PORTRAIT ? 0 : 0.28
  const ink = [1, DIM, DIM],
    wave = [0, 0, 0]
  let active = 0,
    prevPieces = 0,
    wholeSince = 0,
    lastTear = -9,
    lastFast = -9
  function setLine(i: number) {
    if (i === active) return
    active = i
    wave[i] = 1
  }

  // --- transition: everything is a function of the scroll (P 0…1 over 2.4 screens), so it works the same backwards and when interrupted
  const ss = (a: number, b: number, x: number) => {
    const t = cl01((x - a) / (b - a))
    return t * t * (3 - 2 * t)
  }
  const p2out = (x: number) => 1 - (1 - x) ** 2
  let sentSpread = -1
  function transition(scroll: number) {
    const P = cl01((scroll - TRANSITION_FROM * VH) / (TRANSITION_LEN * VH))
    tr.spread = ss(0, 0.42, P)
    tr.dark = ss(0.08, 0.42, P)
    tr.imageIn = p2out(cl01((P - 0.4) / 0.28))
    tr.clarity = p2out(cl01((P - 0.52) / 0.32))
    // the screenshot rises from the depth: it grows as it surfaces, then moves to its place in the scene as the heading comes in
    const zoom = 0.62 + 0.38 * p2out(cl01((P - 0.4) / 0.44))
    tr.P = P
    imgRect(zoom)
    // the sheet's front in distance-field pixels: up to the frame's diagonal (with headroom for the uneven front)
    floodR = Math.hypot(JW, JH) * 1.25 * ss(0.1, 0.56, P) ** 1.7
    if (Math.abs(tr.spread - sentSpread) > 0.003) {
      sentSpread = tr.spread
      post({ P: { spread: tr.spread } })
    }
  }

  // the site's fixed chrome (docks, cursor) takes the dark palette over the darkened water sheet
  let pointerY = -1
  life.listen(
    window,
    'pointermove',
    (e) => {
      pointerY = e.clientY
    },
    { passive: true }
  )
  function adaptChrome(stageRect: DOMRect) {
    const sheetDark = tr.dark >= 0.5
    for (const element of Array.from(
      document.querySelectorAll<HTMLElement>(ADAPT_THEME_SELECTOR)
    )) {
      let y = pointerY
      if (element.dataset.adaptTheme !== 'pointer') {
        const rect = element.getBoundingClientRect()
        y = rect.top + rect.height / 2
      }
      const dark = sheetDark && y >= stageRect.top && y < stageRect.bottom
      if (element.classList.contains('dark') !== dark) element.classList.toggle('dark', dark)
    }
  }
  life.cleanup(() => {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(ADAPT_THEME_SELECTOR)))
      element.classList.remove('dark')
  })

  let tPrev = performance.now()
  let raf = 0
  let running = false
  function frame(now: number) {
    if (!snapA || !snapB) {
      raf = requestAnimationFrame(frame)
      return
    }
    // in this very frame, before the page is drawn: the site bar places its flying S and K and says whether
    // the name should still draw its own (sk-flight.tsx reads the frame time, so both agree; no flicker)
    stage.dispatchEvent(new CustomEvent('lq-frame', { bubbles: true, detail: now }))
    const dt = Math.min((now - tPrev) / 1000, 0.05)
    tPrev = now
    time += dt
    const stageRect = stage.getBoundingClientRect()
    stageTop = stageRect.top
    // cursor/finger motion to the physics thread; the hit is sent once
    post({ cur })
    cur.impulse = 0
    cur.vx *= 0.85
    cur.vy *= 0.85 // a cursor that stands still has no velocity

    const big = simState.pieceList.filter((s) => s >= 12).length
    // "put back" only once the breaking has stopped: nothing new tore off and the cursor slowed down
    const cs = Math.hypot(cur.vx, cur.vy)
    if (cs > 0.06) lastFast = time
    if (big > prevPieces) {
      lastTear = time
      setLine(1)
    }
    if (big > 0 && time - lastTear > 0.9 && time - lastFast > 0.5) setLine(2)
    if (big !== 0) wholeSince = time
    if (big === 0 && active === 2 && time - wholeSince > 1.2) setLine(0)
    prevPieces = big
    for (let i = 0; i < 3; i++) {
      ink[i] += ((i === active ? 1 : DIM) - ink[i]) * Math.min(dt * 6, 1)
      wave[i] *= Math.exp(-dt * 2.5)
    }

    // the image between the last two physics states (one state behind), so motion is smooth at any physics rate
    const k = Math.min(Math.max((now - tB) / gapMs, 0), 1)
    for (let i = 0; i < N * 2; i++) pos[i] = (snapA[i] + (snapB[i] - snapA[i]) * k) * Hq
    // signing: once the name is in place, the usual change wave passes through the active line
    if (!signed && loader.done) {
      signed = true
      wave[active] = 1
    }
    // 1) density
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
    gl.uniform1f(sSize, splatR * 2 * DH)
    gl.uniform1f(sNorm, norm1)
    // the cursor drop (the last rebelN particles) also in channel G: on the sheet it stays green and raised
    gl.uniform2f(sMask, 1, 0)
    gl.drawArrays(gl.POINTS, 0, N - rebelN)
    if (rebelN) {
      gl.uniform2f(sMask, 1, 1)
      gl.drawArrays(gl.POINTS, N - rebelN, rebelN)
    }
    gl.disable(gl.BLEND)
    transition(shift)
    act(dt, tr.P)
    // the hero's selection layer only while the hero is visible
    selLayer.style.visibility = loader.handoff && tr.dark < 0.5 ? 'visible' : 'hidden'
    // tilt means something only in the hero: past it the button goes and tilt switches off (owner, 2026-11-17)
    const away = tr.dark >= 0.5
    if (tiltBtn.hasAttribute('data-away') !== away) {
      tiltBtn.toggleAttribute('data-away', away)
      if (away && tiltOn) setTilt(false)
    }
    adaptChrome(stageRect)
    distanceField()
    // 2) the picture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, W, H)
    gl.useProgram(main)
    gl.bindVertexArray(vao)
    shift += (shiftTarget - shift) * Math.min(dt * 4, 1)
    // a fast scroll: the transition trails the page by at most half a screen, so it never replays
    // a part the reader has long scrolled past
    const lag = shiftTarget - shift
    if (Math.abs(lag) > VH * 0.5) shift = shiftTarget - Math.sign(lag) * VH * 0.5
    terrainView(shift)
    gl.uniform1f(U('uMorph'), shift * 0.0015)
    gl.uniform1f(U('uTime'), time)
    gl.uniform3f(U('uInk'), ink[0], ink[1], ink[2])
    gl.uniform3f(U('uWave'), wave[0], wave[1], wave[2])
    gl.uniform1f(U('uNameOn'), loader.handoff ? 1 : 0)
    gl.uniform1f(U('uSkCut'), +(stage.dataset.skCut ?? 0))
    gl.uniform1f(U('uBoardT'), loader.boardT)
    gl.uniform2f(U('uHRange'), loader.hRange[0], loader.hRange[1])
    gl.uniform1f(U('uSpread'), floodR > 0 ? 1 : 0)
    gl.uniform1f(U('uDark'), tr.dark)
    gl.uniform1f(U('uImageIn'), tr.imageIn)
    gl.uniform1f(U('uClarity'), tr.clarity)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    loader.glFrame() // in the same frame: the loader disappears exactly when the page shows the name
    stage.dataset.ready = '1'
    raf = requestAnimationFrame(frame)
  }
  // draw only while the stage is on screen; the physics thread pauses with it
  const setRunning = (on: boolean) => {
    if (on === running) return
    running = on
    if (on) {
      tPrev = performance.now()
      post({ pause: false })
      raf = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(raf)
      post({ pause: true })
    }
  }
  const visibility = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting))
  visibility.observe(stage)
  setRunning(true)
  life.cleanup(() => {
    visibility.disconnect()
    cancelAnimationFrame(raf)
  })
  // rebuild only when the width changes (rotation); the height alone changes when the browser bar hides
  life.listen(window, 'resize', () => {
    if (
      Math.abs(document.documentElement.clientWidth - VW) > 2 ||
      Math.abs(innerHeight - (VH - INSET)) > 0.2 * VH
    )
      opts.onRemount()
  })
}
