// The menu's liquid, all in one canvas:
// - opening: a front of the hero's green liquid runs out from the MENU button and leaves clean paper behind;
//   closing runs the same pour backwards (same length, or as long as the opening had run if it is cut short);
// - choosing: the liquid floods the screen from the chosen tick, the page moves underneath while it is covered,
//   then it drains back into the tick and uncovers the page there.

const VERTEX = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes, uOrigin;
uniform float uDpr, uTime, uR, uMode;      // uMode 0: paper poured by a green front; 1: green flood
out vec4 o;
const vec3 PAPER = vec3(0.984, 0.976, 0.957);
const vec3 LIQUID = vec3(0.059, 0.616, 0.388);   // the hero's liquid (#0f9d63)
const vec3 DEEP = vec3(0.027, 0.42, 0.255);
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hsh(i), hsh(i+vec2(1,0)), u.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), u.x), u.y); }

// shading of a rounded body of liquid from its distance field d (<0 inside) and its thickness w
vec3 liquidBody(float d, float w, out float spec){
  float t = clamp(-d/max(w, 1.), 0., 1.);
  float hgt = sqrt(t)*w*0.55;
  vec3 nrm = normalize(vec3(-dFdx(hgt), -dFdy(hgt), 1.));
  vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
  spec = pow(max(dot(nrm, normalize(L + vec3(0., 0., 1.))), 0.), 70.);
  vec3 c = mix(DEEP, LIQUID, smoothstep(0., 0.35, t));
  c += vec3(0.25, 0.45, 0.35)*0.3*(1. - smoothstep(0.2, 0.8, t))*smoothstep(0.03, 0.2, t);
  return c;
}

void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 q = p/uRes.y;
  float aa = 1.2*uDpr;
  // the front: uneven like the hero's flood, and it keeps moving as it runs
  float n = vnoise(q*2.3 + vec2(uTime*0.06, -uTime*0.05))*0.65 + vnoise(q*5.7 - vec2(uTime*0.09))*0.35;
  float d = length(p - uOrigin) - uR*(0.62 + 0.76*n);
  float shadow = 0.16*(1. - smoothstep(0., 22.*uDpr, d))*step(0., d);
  float inside = smoothstep(aa, -aa, d);
  vec3 col;
  float spec;
  if (uMode > 0.5) {
    // the flood: all liquid, with its rounded front lit
    col = liquidBody(d, 60.*uDpr, spec) + vec3(0.85, 1., 0.92)*spec*0.5;
  } else {
    // while small it is all liquid (a drop out of the button); as it grows, paper opens up behind it
    float band = min(uR*0.62*0.75, (40. + 80.*vnoise(q*3.1 + vec2(-uTime*0.08, uTime*0.07)))*uDpr);
    float t = clamp(-d/max(band, 1.), 0., 1.);
    vec3 liquid = liquidBody(d, band*0.35, spec);
    float cover = 1. - smoothstep(0.45, 1., t);
    col = mix(PAPER, liquid, cover) + vec3(0.85, 1., 0.92)*spec*0.6*cover;
    col *= 1. - 0.035*smoothstep(1.6, 1., -d/max(band, 1.))*step(1., t);   // the paper is wet for a moment

  }
  float a = inside + shadow*(1. - inside);
  o = vec4(col*inside, a);
}`

export interface MenuWater {
  open(origin: { x: number; y: number }): void
  close(origin: { x: number; y: number }): void
  /** flood the screen from a point; `covered` runs when the screen is covered, `done` when it has drained */
  navigate(point: { x: number; y: number }, covered: () => void, done: () => void): void
  /** seconds from the start of opening until the paper is clean at a point (for revealing what is there) */
  arrival(origin: { x: number; y: number }, point: { x: number; y: number }): number
  destroy(): void
}

export const OPEN_SECONDS = 1.3
const FLOOD_SECONDS = OPEN_SECONDS / 2

// the front's radius as a share of the full radius at time k (0…1): it gathers, then slows as it spreads
export const openEase = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2)

type State = 'closed' | 'opening' | 'open' | 'closing' | 'flooding' | 'draining'

export function createMenuWater(
  canvas: HTMLCanvasElement,
  onDrained: () => void
): MenuWater | null {
  const gl = canvas.getContext('webgl2', {
    premultipliedAlpha: true,
    antialias: false,
    alpha: true,
  })
  if (!gl) return null

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('menu water:', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = (name: string) => gl.getUniformLocation(prog, name)

  let W = 0,
    H = 0,
    dpr = 1
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    W = Math.round(window.innerWidth * dpr)
    H = Math.round(window.innerHeight * dpr)
    canvas.width = W
    canvas.height = H
    gl!.viewport(0, 0, W, H)
    gl!.uniform2f(U('uRes'), W, H)
    gl!.uniform1f(U('uDpr'), dpr)
  }
  size()

  // big enough that the front's deepest dent, and the liquid band behind it, are past every corner
  const fullRadius = (o: { x: number; y: number }) => {
    const far = Math.max(
      Math.hypot(o.x, o.y),
      Math.hypot(window.innerWidth - o.x, o.y),
      Math.hypot(o.x, window.innerHeight - o.y),
      Math.hypot(window.innerWidth - o.x, window.innerHeight - o.y)
    )
    return ((far + 140) / 0.62) * 1.04
  }

  let raf = 0
  let state: State = 'closed'
  let from = 0,
    to = 0,
    r = 0,
    tA = 0,
    dur = OPEN_SECONDS,
    origin = { x: 0, y: 0 }
  let onCovered: (() => void) | null = null,
    onDone: (() => void) | null = null
  const t0 = performance.now()

  function frame(now: number) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const k = reduced ? 1 : Math.min((now - tA) / 1000 / dur, 1)
    if (state !== 'open') r = from + (to - from) * openEase(k)

    gl!.uniform1f(U('uTime'), (now - t0) / 1000)
    gl!.uniform1f(U('uR'), r * dpr)
    gl!.uniform1f(U('uMode'), state === 'flooding' || state === 'draining' ? 1 : 0)
    gl!.uniform2f(U('uOrigin'), origin.x * dpr, H - origin.y * dpr)
    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)

    if (k >= 1 && state !== 'open') {
      if (state === 'opening') state = 'open'
      else if (state === 'flooding') {
        // covered: the page moves underneath, then the liquid drains back into the tick
        onCovered?.()
        state = 'draining'
        from = r
        to = 0
        tA = now
      } else {
        // closing or draining has finished
        const done = state === 'draining' ? onDone : onDrained
        state = 'closed'
        raf = 0
        gl!.clear(gl!.COLOR_BUFFER_BIT)
        done?.()
        return
      }
    }
    // an open menu is still paper: no frames until something moves again
    raf = state === 'open' ? 0 : requestAnimationFrame(frame)
  }
  const run = () => {
    if (!raf) {
      raf = requestAnimationFrame(frame)
    }
  }
  const resize = () => {
    size()
    if (state === 'open') {
      to = from = r = fullRadius(origin)
      run()
    }
  }
  window.addEventListener('resize', resize)

  return {
    open(o) {
      origin = o
      to = fullRadius(o)
      // reopening mid-close continues from where the front is, at the same pace
      from = state === 'closing' ? r : 0
      dur = OPEN_SECONDS * (1 - from / to)
      tA = performance.now()
      state = 'opening'
      run()
    },
    close(o) {
      if (state !== 'opening' && state !== 'open') return
      origin = o
      const now = performance.now()
      // closing takes exactly as long as the opening took (all of it, or the part that had run)
      dur = state === 'opening' ? Math.max((now - tA) / 1000, 0.15) : OPEN_SECONDS
      from = r
      to = 0
      tA = now
      state = 'closing'
      run()
    },
    navigate(point, covered, done) {
      origin = point
      onCovered = covered
      onDone = done
      from = 0
      to = fullRadius(point)
      dur = FLOOD_SECONDS
      tA = performance.now()
      state = 'flooding'
      run()
    },
    arrival(o, point) {
      // a point is clean paper once the front's deepest dent (0.62 of the radius) is a full band past it
      const need = (Math.hypot(point.x - o.x, point.y - o.y) + 90) / (0.62 * fullRadius(o))
      const share = Math.min(Math.max(need, 0), 1)
      let lo = 0,
        hi = 1
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2
        if (openEase(mid) < share) lo = mid
        else hi = mid
      }
      return OPEN_SECONDS * hi
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      // free what we made, but keep the context: the same canvas may get a new water (React remounts in dev)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      gl.clear(gl.COLOR_BUFFER_BIT)
    },
  }
}
