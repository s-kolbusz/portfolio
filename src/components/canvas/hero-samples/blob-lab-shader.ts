/**
 * The live site's blob as the hero draws it at rest (see
 * viscous-puddle/shaders.ts: the same circle, breathing, drift, ripple,
 * smooth union with the cursor ball, edge and shading), plus what
 * blob-lab.ts adds. Every addition is nil at zero, so with all dials at zero
 * the picture is the production one.
 */

export const BLOB_LAB_VERTEX = /* glsl */ `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

export const BLOB_LAB_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;

  uniform float uTime;
  // Everything positional is in CSS pixels, viewport space, origin top-left.
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform float uScale;
  uniform float uOpacity;
  uniform float uDetail;
  uniform vec3 uColor;

  // The body: centre and radius (px), and the axis and amount it is drawn out along.
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform vec3 uSquash;
  // The cursor ball: xy position, z radius, w smooth-union width (px);
  // the axis and amount it is drawn out along.
  uniform vec4 uBall;
  uniform vec3 uStretch;
  // Radius of the bridge between body and ball (px).
  uniform float uThread;
  // How far the outline wanders, and its own clock.
  uniform vec2 uMutate;

  out vec4 fragColor;

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

  // A circle drawn out along an axis and narrowed across it.
  float drawnOut(vec2 p, float radius, vec2 axis, float amount, float narrowing) {
    float along = dot(p, axis);
    vec2 across = p - along * axis;
    vec2 q = axis * along / (1.0 + amount) + across * (1.0 + amount * narrowing);
    return (length(q) - radius) / (1.0 + max(amount, 0.0) * narrowing);
  }

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uViewport.y - px.y;

    // Blob unit = half the viewport height, as on the live site.
    float unit = uViewport.y * 0.5;
    vec2 uv = (px - uCenter) / unit;

    float breathe = sin(uTime * 0.3) * 0.03;
    vec2 drift = vec2(
      snoise(vec2(uTime * 0.1, 0.0)),
      snoise(vec2(0.0, uTime * 0.15))
    ) * 0.15;

    float body = drawnOut(uv - drift, uRadius / unit + breathe * uScale, uSquash.xy, uSquash.z, 0.6);
    float ball = drawnOut((px - uBall.xy) / unit, uBall.z / unit, uStretch.xy, uStretch.z, 0.35);
    float d = smin(body, ball, uBall.w / unit);

    // The bridge: the body reaching for the ball, and the ball's thread as it leaves.
    if (uThread > 0.0) {
      float thread = sdSegment(px, uCenter + drift * unit, uBall.xy) / unit - uThread / unit;
      d = smin(d, thread, 0.16 * uScale);
    }

    float ballness = smoothstep(-0.02, 0.02, body - ball);

    // The outline wanders: slow, large, and never the same way twice. The
    // ball keeps most of its own shape.
    if (uMutate.x > 0.0) {
      float t = uMutate.y;
      vec2 warp = vec2(
        snoise(uv * 0.4 + vec2(t * 0.07, 3.1)),
        snoise(uv * 0.4 + vec2(-1.7, t * 0.06))
      );
      // One long wave, bent by a slower one: broad lobes, no corners.
      float wander = snoise(uv * 0.5 + warp * 0.35 + vec2(t * 0.05, -t * 0.04));
      d += wander * uMutate.x * uScale * mix(1.0, 0.25, ballness);
    }

    // Surface ripple, as on the live site.
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * uDetail;

    float aa = 0.04;
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 colour = mix(uColor, uColor * 0.85, depthFactor);

    float opacity = alpha * uOpacity;
    fragColor = vec4(colour * opacity, opacity);
  }
`
