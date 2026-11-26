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
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uScale;
  uniform float uOpacity;

  in vec2 vUv;
  out vec4 fragColor;

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
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
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    float breathe = sin(uTime * 0.3) * 0.03;
    vec2 mainPos = vec2(0.0, 0.0);

    mainPos.x += snoise(vec2(uTime * 0.1, 0.0)) * 0.15;
    mainPos.y += snoise(vec2(0.0, uTime * 0.15)) * 0.15;

    float d1 = sdCircle(uv - mainPos, (0.75 + breathe) * uScale);

    vec2 mouseUV = uMouse * 2.0 - 1.0;
    mouseUV.x *= uResolution.x / uResolution.y;

    float d2 = sdCircle(uv - mouseUV, 0.25 * uScale);

    float d = smin(d1, d2, 0.6 * uScale);

    float noise = snoise(uv * 1.5 + uTime * 0.15);
    d += noise * 0.04 * uScale;

    float alpha = smoothstep(0.04, -0.04, d);
    float dither = snoise(uv * 200.0) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 finalColor = mix(uColor, uColor * 0.85, depthFactor);
    float opacity = alpha * uOpacity;

    fragColor = vec4(finalColor * opacity, opacity);
  }
`
