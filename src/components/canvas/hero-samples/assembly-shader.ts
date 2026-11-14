/**
 * Shader for the combined hero sample ("złożenie"): the matter comes apart
 * into drops, and each drop sets into one part of a thing, laid out like an
 * exploded drawing. Same matter as the production blob: flat green, soft
 * liquid edge, the same noise.
 *
 * Positions are CSS pixels, origin top-left; distances are compared in
 * "units" (half the canvas height), as in the production shader.
 */
export const ASSEMBLY_ITEMS = 6

export const ASSEMBLY_FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;

  uniform float uTime;
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform vec3 uColor;

  // Item 0 is the body; 1–5 are the drops that become parts.
  // A: centre xy, half-size wh (px).  B: corner radius (px), rotation (rad),
  // set 0–1, liquid radius (px; 0 = unused).  C: type, pattern.
  uniform vec4 uItemA[6];
  uniform vec4 uItemB[6];
  uniform vec4 uItemC[6];
  // Smooth-union width between liquid items (px).
  uniform float uMerge;
  // The sheet over the whole frame on load: extra radius of the body (px).
  uniform float uCover;
  // Extra unrest of the edges while the matter changes state, 0–1.
  uniform float uWobble;
  // The small blob: xy, radius, smooth-union width (px).
  uniform vec4 uBall;

  out vec4 fragColor;

  float sdBox(vec2 p, vec2 b, float r) {
    r = min(r, min(b.x, b.y));
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // What is cut out of a part (px, in the part's own frame); 1e3 = nothing.
  float cut(vec2 q, vec2 b, int pattern) {
    float m = min(b.x, b.y);
    if (pattern == 1) {
      // Lines of text, ragged right.
      float hole = 1e3;
      for (int i = 0; i < 4; i++) {
        float y = (-0.6 + float(i) * 0.4) * b.y;
        float len = b.x * (0.42 + 0.32 * fract(sin(float(i) * 12.9898 + b.x) * 43758.5453));
        hole = min(hole, sdBox(q - vec2(-b.x * 0.78 + len, y), vec2(len, b.y * 0.075), b.y));
      }
      return hole;
    }
    if (pattern == 2) {
      // Layers: of a print, of a rack.
      float pitch = max(b.y * 0.26, 5.0);
      return abs(mod(q.y + pitch * 0.5, pitch) - pitch * 0.5) - max(pitch * 0.07, 0.7);
    }
    if (pattern == 3) {
      // A day of output in bars.
      float hole = 1e3;
      for (int i = 0; i < 5; i++) {
        float sun = exp(-pow((float(i) - 2.0) / 1.25, 2.0));
        float h = b.y * (0.14 + 0.5 * sun);
        hole = min(hole, sdBox(q - vec2((-0.62 + float(i) * 0.31) * b.x, b.y * 0.72 - h), vec2(b.x * 0.09, h), b.x * 0.05));
      }
      return hole;
    }
    if (pattern == 4) {
      // A photograph: sky cut out above a ridge.
      float sky = sdBox(q, b - m * 0.2, m * 0.08);
      vec2 n = q / m;
      float ridge = min(
        -0.2 + abs(n.x + 0.55) * 0.8 - n.y,
        min(0.05 + abs(n.x - 0.35) * 0.75 - n.y, 0.3 + abs(n.x - 1.2) * 0.9 - n.y)
      ) * m * 0.7;
      return max(sky, -ridge);
    }
    if (pattern == 5) {
      // Cells: a panel, a crop grid.
      float lines = min(
        min(abs(q.x - b.x / 3.0), abs(q.x + b.x / 3.0)),
        abs(q.y)
      ) - max(m * 0.035, 0.8);
      return max(lines, sdBox(q, b - m * 0.16, 0.0));
    }
    if (pattern == 6) {
      // A bore, a fan.
      return length(q) - m * 0.5;
    }
    if (pattern == 7) {
      // Three dots at the left end of a bar.
      float hole = 1e3;
      for (int i = 0; i < 3; i++) {
        hole = min(hole, length(q - vec2(-b.x + b.y * (1.3 + float(i) * 1.15), 0.0)) - b.y * 0.32);
      }
      return hole;
    }
    return 1e3;
  }

  // A part, set: px distance in its own (rotated) frame.
  float part(vec2 q, vec2 b, float radius, int type, int pattern) {
    float outer;
    if (type == 1) {
      // An open frame.
      outer = abs(sdBox(q, b, radius)) - max(min(b.x, b.y) * 0.09, 1.5);
    } else if (type == 2) {
      vec2 a = abs(q);
      outer = max(a.y, a.x * 0.866025 + a.y * 0.5) - b.y;
    } else if (type == 3) {
      // A spool.
      outer = abs(length(q) - b.x * 0.72) - b.x * 0.28;
    } else {
      outer = sdBox(q, b, radius);
    }
    return max(outer, -cut(q, b, pattern));
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uViewport.y - px.y;
    float unit = uViewport.y * 0.5;
    vec2 np = px / unit;

    float breathe = sin(uTime * 0.3) * 0.03;
    float cover = uCover / unit;
    float coverK = smoothstep(0.0, 0.5, cover);

    // Where the small blob touches set matter, the matter is wet again.
    vec2 toBall = (px - uBall.xy) / max(uBall.z * 1.5, 1.0);
    float wet = uBall.z > 0.0 ? exp(-dot(toBall, toBall)) : 0.0;

    float d = 1e3;
    // How set the matter is at this pixel (that of the nearest item).
    float setHere = 0.0;
    bool first = true;

    for (int i = 0; i < 6; i++) {
      vec4 A = uItemA[i];
      vec4 B = uItemB[i];
      if (B.w <= 0.0) continue;
      vec2 q = px - A.xy;
      float seed = float(i) * 7.31;

      // Liquid: a drop, never quite round, each with its own slow life.
      vec2 lob = vec2(
        snoise(vec2(uTime * 0.11 + seed, 1.7)),
        snoise(vec2(3.1, uTime * 0.13 + seed))
      );
      float squash = 1.0 + 0.12 * dot(normalize(q + 1e-3), lob);
      float liquid = (length(q) * squash - B.w) / unit - breathe * (i == 0 ? 1.0 : 0.4);
      if (i == 0) {
        float tongues =
          snoise(np * 0.9 + vec2(uTime * 0.21, -uTime * 0.13)) * 0.3 +
          snoise(np * 2.1 - vec2(uTime * 0.17, uTime * 0.29)) * 0.11 +
          snoise(np * 4.6 + uTime * 0.4) * 0.035;
        liquid = liquid - cover + tongues * coverK;
      }

      float set = B.z * (1.0 - wet * 0.7);
      float di = liquid;
      if (B.z > 0.001) {
        float c = cos(B.y);
        float s = sin(B.y);
        vec2 r = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
        float solid = part(r, A.zw, B.x, int(uItemC[i].x), int(uItemC[i].y)) / unit;
        di = mix(liquid, solid, set);
      }
      // Each item ripples on its own; none once set.
      float unrest = (1.0 - set) + uWobble * 2.0 * (1.0 - set * 0.5);
      di += snoise(np * 1.5 + uTime * 0.15 + seed) * 0.04 * unrest;
      di += snoise(np * 3.6 - uTime * 0.33 + seed) * 0.018 * uWobble;

      if (first) {
        d = di;
        setHere = set;
        first = false;
      } else {
        float k = uMerge / unit * (1.0 - set) * (1.0 - setHere);
        if (di < d) setHere = set;
        d = k > 1e-3 ? smin(d, di, k) : min(d, di);
      }
    }

    // The small blob: always liquid, clings to whatever is liquid near it.
    float body = d;
    float ballness = 0.0;
    if (uBall.z > 0.0) {
      float ball = (length(px - uBall.xy) - uBall.z) / unit;
      ball += snoise(np * 2.2 - uTime * 0.25) * 0.018;
      float k = uBall.w / unit * (1.0 - setHere);
      d = smin(d, ball, max(k, 1e-3));
      ballness = smoothstep(-0.02, 0.02, body - ball);
    }

    float fluid = mix(1.0 - setHere, 1.0, ballness);
    float crisp = 0.75 / (unit * uDpr);
    float aa = mix(crisp, 0.04, fluid * fluid);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depth = smoothstep(0.0, -0.5, d + dither) * fluid;
    vec3 color = mix(uColor, uColor * 0.85, depth * (1.0 - coverK));

    fragColor = vec4(color * alpha, alpha);
  }
`
