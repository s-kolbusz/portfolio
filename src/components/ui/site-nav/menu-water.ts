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
out vec4 o;   // premultiplied: the page shows through the liquid
const vec3 PAPER = vec3(0.984, 0.976, 0.957);
const vec3 TINT = vec3(0.03, 0.575, 0.363);     // the hero's liquid
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hsh(i), hsh(i+vec2(1,0)), u.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), u.x), u.y); }

// A bead of liquid lying across the front, u px in from its outer edge, B px wide, drawn like the hero's glass:
// no diffuse shading (that made it plasticine, and a dark charred rim at the edge), but a tinted see-through body,
// a softly rolled-under edge that reflects the room, and a glint that comes and goes along the front.
// Returns premultiplied colour and coverage.
vec4 bead(float u, float B, vec2 dir, vec2 q, float opaque){
  float s = clamp(u/max(B, 1.), 0.001, 0.999);
  float c = 2.*s - 1.;
  float hh = sqrt(max(1. - c*c, 0.));
  // slope across the bead: steep at both edges, flat on top; capped so the edges roll under, not fold
  float slope = clamp(-c/max(hh, 0.18), -5.5, 5.5)*0.8;
  vec3 n = normalize(vec3(dir*slope, 1.));
  float curl = smoothstep(0.55, 0.95, abs(c));
  vec3 r = reflect(vec3(0., 0., -1.), n);
  vec3 L = normalize(vec3(-0.55 + 0.12*sin(q.y*7. + uTime*0.21), 0.62 + 0.08*cos(q.x*5.3 - uTime*0.17), 0.56));
  // the room it reflects: light above, a little grey below (as the hero's env)
  vec3 env = mix(vec3(0.70, 0.72, 0.68), vec3(0.99, 0.98, 0.95), smoothstep(-0.35, 0.45, r.y));
  env += vec3(0.25)*smoothstep(0.5, 0.9, dot(r, L));
  float F = 0.02 + 0.98*pow(1. - max(n.z, 0.), 5.);
  // body: the hero green, a little less light through where the edge rolls under
  float a = mix(0.62, 1., opaque);
  vec3 body = TINT*(1. - 0.18*curl)*a;
  vec3 col = body*(1. - F) + env*F*0.6;
  a = a*(1. - F) + F*0.6;
  // a soft glint, broken up along the front so it never runs round as a bright line
  float sp = max(dot(r, L), 0.);
  float glint = (pow(sp, 6.)*0.04 + pow(sp, 40.)*0.12)*(0.35 + 0.65*smoothstep(0.35, 0.75, vnoise(q*4.2 + uTime*0.15)));
  col += vec3(1.)*glint;
  a = min(a + glint*0.5, 1.);
  return vec4(col, a);
}

void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 q = p/uRes.y;
  float soft = 2.2*uDpr;   // a wet edge is a few pixels soft, not cut
  // the front: uneven like the hero's flood, and it keeps moving as it runs
  float n = vnoise(q*2.0 + vec2(uTime*0.04, -uTime*0.03))*0.75 + vnoise(q*4.3 - vec2(uTime*0.05))*0.25;
  float d = length(p - uOrigin) - uR*(0.62 + 0.5*n);
  vec2 g = vec2(dFdx(d), dFdy(d));
  vec2 dir = length(g) > 1e-4 ? normalize(g) : vec2(0.);
  float u = -d;
  // a faint, wide shadow just ahead of the liquid (the hero casts one too), no dark line
  float shadow = 0.05*(1. - smoothstep(0., 34.*uDpr, d))*smoothstep(-soft, soft, d);
  vec4 col;
  if (uMode > 0.5) {
    // the flood: an opaque body with the same soft front, so the page can change underneath
    float B = 70.*uDpr;
    vec4 b = bead(min(u, B*0.5), B, dir, q, 1.);
    float inside = smoothstep(-soft, soft, u);
    col = b*inside;
  } else {
    // while small it is all liquid (a drop out of the button); as it grows, paper opens up behind it.
    // The bead's width changes slowly along the front, so it reads as one body of liquid, not a charred band.
    float B = min(uR*0.62*0.75, (48. + 24.*vnoise(q*1.6 + vec2(-uTime*0.05, uTime*0.04)))*uDpr);
    float inBead = smoothstep(-soft, soft, u)*(1. - smoothstep(B - soft, B + soft, u));
    vec4 b = bead(u, B, dir, q, 0.);
    // under the liquid the page is wiped to paper: from its middle on, clean paper shows through it
    float paperUnder = smoothstep(B*0.5, B*0.78, u);
    vec4 under = vec4(PAPER*(1. - 0.04*(1. - smoothstep(B, B*1.3, u))), 1.)*paperUnder;   // wet for a moment
    vec4 bed = b + under*(1. - b.a);
    col = mix(under, bed, inBead);
  }
  o = col + vec4(0., 0., 0., shadow)*(1. - col.a);
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

export const OPEN_SECONDS = 1.6
const FLOOD_SECONDS = OPEN_SECONDS / 2

// the front's radius as a share of the full radius at time k (0…1): it eases in and out without a surge in the
// middle (the cubic one rushed through the page at 3× its average speed, owner 2026-11-21: "spokojniej")
export const openEase = (k: number) => k * k * k * (k * (6 * k - 15) + 10)

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
      const need = (Math.hypot(point.x - o.x, point.y - o.y) + 80) / (0.62 * fullRadius(o))
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
