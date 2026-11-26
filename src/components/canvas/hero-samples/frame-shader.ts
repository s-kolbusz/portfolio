/**
 * A still of the live blob, for the hero layout frames: the same surface as
 * the production shader (flat green, soft edge, slightly deeper middle, one
 * octave of ripple, the wandering outline), but for several bodies at once,
 * so a frame can show the blob pulled apart. Nothing here moves.
 */

export const FRAME_BODY_LIMIT = 12

export const FRAME_VERTEX = /* glsl */ `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

export const FRAME_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;

  // Positions are CSS pixels, viewport space, origin top-left.
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform float uScale;
  uniform float uTime;
  uniform vec3 uColor;

  // Each body runs from one end (uEnds.xy) to the other (uEnds.zw), px; a drop
  // has both ends in one place, a tongue of pulled matter tapers between them.
  // uShape: the radius at either end (px), the body's own seed, and how far
  // its outline wanders (share of its radius).
  uniform vec4 uEnds[${FRAME_BODY_LIMIT}];
  uniform vec4 uShape[${FRAME_BODY_LIMIT}];
  uniform int uCount;
  // Smooth-union width between bodies (px).
  uniform float uJoin;

  out vec4 fragColor;

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Distance to a segment whose thickness runs from r1 at a to r2 at b.
  float sdTaper(vec2 p, vec2 a, vec2 b, float r1, float r2) {
    vec2 ba = b - a;
    vec2 pa = p - a;
    float l2 = dot(ba, ba);
    if (l2 < 1e-3) return length(pa) - r1;
    float rr = r1 - r2;
    float a2 = l2 - rr * rr;
    // One end lies inside the other: it is just the larger drop.
    if (a2 <= 0.0) return r1 > r2 ? length(pa) - r1 : length(p - b) - r2;
    float il2 = 1.0 / l2;
    float y = dot(pa, ba);
    float z = y - l2;
    vec2 across = pa * l2 - ba * y;
    float x2 = dot(across, across);
    float y2 = y * y * l2;
    float z2 = z * z * l2;
    float k = sign(rr) * rr * rr * x2;
    if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
    if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
    return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
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

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uViewport.y - px.y;

    // Blob unit = half the viewport height, as in the production shader.
    float unit = uViewport.y * 0.5;

    float d = 1e3;
    for (int i = 0; i < ${FRAME_BODY_LIMIT}; i++) {
      if (i >= uCount) break;
      vec4 ends = uEnds[i];
      vec4 shape = uShape[i];
      float size = max(max(shape.x, shape.y), 0.5 * distance(ends.xy, ends.zw));
      // The body's own space, in its own size: every piece wanders like the whole blob does.
      vec2 q = (px - 0.5 * (ends.xy + ends.zw)) / size;
      vec2 seed = vec2(shape.z * 7.31, shape.z * 3.17);
      float own = sdTaper(px, ends.xy, ends.zw, shape.x, shape.y) / unit;
      vec2 warp = vec2(
        snoise(q * 0.3 + seed + vec2(0.0, 3.1)),
        snoise(q * 0.3 + seed + vec2(-1.7, 0.0))
      );
      float wander = snoise(q * 0.375 + warp * 0.35 + seed);
      own += wander * shape.w * size / unit;
      d = i == 0 ? own : smin(d, own, uJoin / unit);
    }

    vec2 uv = (px - uViewport * 0.5) / unit;
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale;

    float alpha = smoothstep(0.04, -0.04, d);
    float dither = snoise(px * 0.5) * 0.025;
    float depth = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 color = mix(uColor, uColor * 0.85, depth);

    fragColor = vec4(color * alpha, alpha);
  }
`
