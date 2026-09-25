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
  uniform float uScale;
  uniform float uOpacity;
  uniform float uDetail;

  // Matter colour: the blob green (uColor) settling into the page's own colour.
  uniform vec3 uColor;
  uniform vec3 uTargetColor;
  uniform float uSolid;

  // Main body: one rounded box that starts as a circle.
  uniform float uBody;
  uniform vec2 uCenter;
  uniform vec2 uHalfSize;
  uniform float uCorner;
  // 1 = liquid, 0 = set.
  uniform float uFluid;
  // Smoothed scroll speed, 0–1: moving matter ripples, still matter sets.
  uniform float uFlow;

  // The page the matter becomes, drawn inside it.
  uniform sampler2D uImage;
  uniform float uHasImage;
  uniform vec4 uImageRect;
  uniform float uImageIn;
  uniform float uFront;

  // Detached droplet: xy position, z radius, w smooth-union width (px).
  uniform vec4 uDrop;

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

    float body = 1e3;
    if (uBody > 0.5) {
      vec2 halfSize = uHalfSize / unit + breathe * uScale;
      body = sdRoundBox(uv - drift, halfSize, uCorner / unit + breathe * uScale);

      vec2 mouseUV = (uMouse - uCenter) / unit;
      float cursor = sdCircle(uv - mouseUV, 0.25 * uScale);
      body = mix(body, smin(body, cursor, 0.6 * uScale), uFluid);
    }

    float drop = 1e3;
    if (uDrop.z > 0.0) {
      float dropBreathe = 1.0 + sin(uTime * 0.8) * 0.05;
      drop = (length(px - uDrop.xy) - uDrop.z * dropBreathe) / unit;
    }

    float d = uDrop.w > 0.0 ? smin(body, drop, uDrop.w / unit) : min(body, drop);

    // Surface ripple: there while liquid, plus whatever the scroll stirs up.
    // Both die out as the matter sets, so it lands still and crisp.
    float settle = smoothstep(0.0, 0.25, uFluid);
    float ripple = (uFluid + uFlow * 1.5 * settle) * uDetail;
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * ripple;

    float aa = mix(0.75 / unit, 0.04, uFluid);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 matter = mix(uColor, uTargetColor, uSolid);
    vec3 shaded = mix(matter, matter * 0.85, depthFactor * (1.0 - uSolid * 0.6));

    // The page inside the matter: refracted and tinted while liquid, sharp
    // and true behind the solidification front spreading from the centre.
    vec3 bodyColor = shaded;
    if (uHasImage > 0.5 && uImageIn > 0.0) {
      vec2 imageUv = clamp((px - uImageRect.xy) / uImageRect.zw, 0.0, 1.0);
      vec2 fromCenter = (px - uCenter) / max(uHalfSize, vec2(1.0));
      float reach = length(fromCenter) / 1.4142 + snoise(px / unit * 2.5) * 0.08;
      float front = uFront * 1.3 - 0.1;
      float solidified = 1.0 - smoothstep(front - 0.06, front, reach);

      vec2 bend = vec2(
        snoise(imageUv * 3.0 + uTime * 0.1),
        snoise(imageUv * 3.0 + 17.0 - uTime * 0.1)
      ) * 0.035 * (1.0 - solidified);
      vec3 liquid = mix(texture(uImage, clamp(imageUv + bend, 0.0, 1.0)).rgb, shaded, 0.55);
      vec3 sharp = texture(uImage, imageUv).rgb;

      bodyColor = mix(shaded, mix(liquid, sharp, solidified), uImageIn);
    }

    // The droplet stays liquid: it keeps the blob's own green.
    float dropness = smoothstep(-0.02, 0.02, body - drop);
    vec3 dropColor = mix(uColor, uColor * 0.85, depthFactor);
    vec3 finalColor = mix(bodyColor, dropColor, dropness);

    float opacity = alpha * uOpacity;
    fragColor = vec4(finalColor * opacity, opacity);
  }
`
