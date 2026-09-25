export const VERTEX_SRC = /* glsl */ `#version 300 es
  in vec2 aPosition;
  out vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

export const FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;

  uniform float uTime;
  // Everything positional is in CSS pixels, viewport space, origin top-left.
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform vec2 uMouse;
  uniform vec3 uColor;
  uniform float uScale;
  uniform float uOpacity;
  uniform float uDetail;

  // Signature transition: one rounded box that starts as a circle.
  uniform vec2 uCenter;
  uniform vec2 uHalfSize;
  uniform float uCorner;
  // 1 = liquid hero blob, 0 = solid frame.
  uniform float uFluid;
  // Smoothed scroll speed, 0–1: moving matter ripples, still matter sets.
  uniform float uFlow;

  in vec2 vUv;
  out vec4 fragColor;

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
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

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uViewport.y - px.y;

    // Blob unit = half the viewport height, as when the canvas filled the hero.
    float unit = uViewport.y * 0.5;
    vec2 uv = (px - uCenter) / unit;

    float breathe = sin(uTime * 0.3) * 0.03 * uFluid;
    vec2 drift = vec2(
      snoise(vec2(uTime * 0.1, 0.0)),
      snoise(vec2(0.0, uTime * 0.15))
    ) * 0.15 * uFluid;

    vec2 halfSize = uHalfSize / unit + breathe * uScale;
    float d1 = sdRoundBox(uv - drift, halfSize, uCorner / unit + breathe * uScale);

    vec2 mouseUV = (uMouse - uCenter) / unit;
    float d2 = sdCircle(uv - mouseUV, 0.25 * uScale);
    float d = mix(d1, smin(d1, d2, 0.6 * uScale), uFluid);

    // Surface ripple: always there while liquid, plus whatever the scroll
    // stirs up. Both die out as the shape sets, so it lands still and crisp.
    float settle = smoothstep(0.0, 0.25, uFluid);
    float ripple = (uFluid + uFlow * 1.5 * settle) * uDetail;
    float noise = snoise(uv * 1.5 + uTime * 0.15);
    d += noise * 0.04 * uScale * ripple;

    float aa = mix(0.75 / unit, 0.04, uFluid);
    float alpha = smoothstep(aa, -aa, d);
    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 finalColor = mix(uColor, uColor * 0.85, depthFactor);
    float opacity = alpha * uOpacity;

    fragColor = vec4(finalColor * opacity, opacity);
  }
`
