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
  uniform float uImageRadius;
  // 0 = murky, rippling surface over the page; 1 = still, clear glass.
  uniform float uClarity;
  // How much the matter is a sheet of water: long swells and a sheen over
  // all of it (signature scene), 0 in the hero.
  uniform float uSurface;
  // Keeps the body's edge soft and moving after the matter has settled:
  // the water sheet leaving with its section still has a liquid rim.
  uniform float uLiquidEdge;

  // The soaking name (hero). uName: R glyph mask, G blurred mask (stroke
  // depth), B·256+A when the colour arrives (0–1). Drawn in uNameRect (xy
  // top-left, zw size, px); uNameZoom is the camera's zoom on it.
  uniform sampler2D uName;
  uniform float uNameOn;
  uniform vec4 uNameRect;
  uniform float uNameZoom;
  // Mask pixels per CSS px (before zoom), for anti-aliasing at any zoom.
  uniform float uNameScale;
  // Soak progress, 0–1 (2 = all done): letters turn from ink to green.
  uniform float uSoak;
  // The text colour the letters start as.
  uniform vec3 uInk;
  // How much colour the blob has given up: 0 green → 1 clear water.
  uniform float uDrain;

  // The hero's cursor ball, the part that stays liquid: xy position,
  // z radius, w smooth-union width with the body (all px).
  uniform vec4 uBall;

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

  // A letter's start time is packed in two bytes (B high, A low), which
  // linear filtering would scramble; decode the four nearest texels, then blend.
  float arrivalAt(ivec2 texel, ivec2 size) {
    vec4 t = texelFetch(uName, clamp(texel, ivec2(0), size - 1), 0);
    return (t.b * 255.0 * 256.0 + t.a * 255.0) / 65535.0;
  }

  float soakArrival(vec2 uv) {
    ivec2 size = textureSize(uName, 0);
    vec2 p = uv * vec2(size) - 0.5;
    ivec2 i = ivec2(floor(p));
    vec2 f = fract(p);
    float a = mix(arrivalAt(i, size), arrivalAt(i + ivec2(1, 0), size), f.x);
    float b = mix(arrivalAt(i + ivec2(0, 1), size), arrivalAt(i + ivec2(1, 1), size), f.x);
    return mix(a, b, f.y);
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

  // The water's height: three octaves of noise, each turned and drifting
  // its own way, over a domain that is itself slowly warped, with the swell
  // height varying across the sheet. No two stretches of it look alike, so
  // it never reads as a repeating tile.
  const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);
  float swell(vec2 p, vec2 warp, float t) {
    p += warp;
    float h = 0.0;
    float amp = 0.6;
    vec2 drift = vec2(0.03, 0.018);
    for (int i = 0; i < 3; i++) {
      h += amp * snoise(p + drift * t);
      p = TURN * p * 1.7 + 3.1;
      drift = TURN * drift * 1.3;
      amp *= 0.4;
    }
    return h;
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
    }

    float ball = sdCircle((px - uBall.xy) / unit, uBall.z / unit);
    float d = uBall.w > 0.5 ? smin(body, ball, uBall.w / unit) : min(body, ball);
    float ballness = smoothstep(-0.02, 0.02, body - ball);

    // Surface ripple: there while liquid, plus whatever the scroll stirs up.
    // Both die out as the matter sets, so it lands still and crisp.
    float settle = smoothstep(0.0, 0.25, uFluid);
    // The ball never sets, so its surface keeps moving.
    float bodyRipple = max(uFluid + uFlow * 1.5 * settle, uLiquidEdge * (1.6 + uFlow * 1.5));
    float ripple = mix(bodyRipple, 1.0 + uFlow, ballness) * uDetail;
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * ripple;

    float aa = mix(mix(0.75 / unit, 0.04, max(uFluid, uLiquidEdge)), 0.04, ballness);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 matter = mix(uColor, uTargetColor, uSolid);
    vec3 shaded = mix(matter, matter * 0.85, depthFactor * (1.0 - uSolid * 0.6));

    // The matter as a sheet of water over the whole frame: long, slow swells
    // with a soft sheen, and the page rising from under it in its own spot,
    // murky, bent and edgeless at first, then the water calms and clears
    // until it is plain glass and the page shows exactly as it is.
    // Scrolling stirs it again.
    vec3 bodyColor = shaded;
    if (uSurface > 0.0) {
      float unrest = (1.0 - uClarity) * (1.0 + uFlow * 2.0) * uSurface;

      vec2 q = px / unit * 0.8;
      vec2 warp = vec2(
        snoise(q * 0.3 + vec2(uTime * 0.012, 0.0)),
        snoise(q * 0.3 + vec2(4.7, 1.9) - vec2(0.0, uTime * 0.015))
      ) * 1.1;
      // Calm and choppy patches drift across the sheet.
      float chop = 0.55 + 0.45 * snoise(q * 0.18 + vec2(-uTime * 0.01, 2.3));
      float e = 0.05;
      float h = swell(q, warp, uTime) * chop;
      float hx = swell(q + vec2(e, 0.0), warp, uTime) * chop;
      float hy = swell(q + vec2(0.0, e), warp, uTime) * chop;
      vec2 slope = vec2(hx - h, hy - h) / e;

      // Swells tint the water a little: crests lighter, troughs deeper.
      vec3 water = shaded * (1.0 + h * 0.06 * unrest);

      if (uHasImage > 0.5 && uImageIn > 0.0) {
        vec2 bentPx = px + slope * uImageRect.z * 0.009 * unrest;
        vec2 imageUv = clamp((bentPx - uImageRect.xy) / uImageRect.zw, 0.0, 1.0);
        vec3 seen = texture(uImage, imageUv).rgb;
        float murk = (1.0 - uClarity) * 0.7;
        vec3 through = mix(seen, shaded, murk);

        // The page has no edge while it is deep under murky water; its
        // outline firms up as the surface clears, ending on the box exactly.
        vec2 halfBox = uImageRect.zw * 0.5;
        float boxD = sdRoundBox(bentPx - uImageRect.xy - halfBox, halfBox, uImageRadius);
        float soft = mix(0.5, unit * 0.45, (1.0 - uClarity) * (1.0 - uClarity));
        float inBox = smoothstep(soft, -soft, boxD) * uImageIn;
        water = mix(water, through, inBox);
      }

      // A broad, soft sheen rolling over the swells, everywhere: light
      // catching the slopes that face it, with no hard caustic lines.
      vec3 normal = normalize(vec3(-slope * 0.18 * unrest, 1.0));
      float facing = dot(normal, normalize(vec3(-0.35, -0.45, 1.0)));
      float sheen = smoothstep(0.8, 1.0, facing);
      water += (sheen - 0.6) * 0.08 * unrest;
      bodyColor = mix(shaded, water, uSurface);
    }

    // The ball stays liquid: it keeps the blob's own green.
    vec3 ballColor = mix(uColor, uColor * 0.85, depthFactor);
    vec3 finalColor = mix(bodyColor, ballColor, ballness);

    // On the water sheet the ball is the part that stays green: it sits in
    // the surface while the sheet darkens around it (a soft, merged rim),
    // and keeps its own crisp edge once it has come away.
    if (uSurface > 0.0) {
      float ballPx = length(px - uBall.xy) - uBall.z;
      ballPx += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * unit * (1.0 + uFlow) * uDetail;
      float drop = smoothstep(1.0, -1.0, ballPx);
      float rim = uBall.w > 0.5 ? smoothstep(uBall.w * 0.35, 0.0, ballPx) : 0.0;
      finalColor = mix(finalColor, ballColor, max(drop, rim * 0.85) * uSurface);
    }

    // Drained of its colour the blob is clear water: almost no fill, a faint
    // meniscus at the rim and a soft glint, still moving.
    if (uDrain > 0.0) {
      float rim = smoothstep(aa * 10.0, 0.0, abs(d)) * alpha;
      float glint = pow(max(snoise(uv * 1.2 + vec2(uTime * 0.05, 0.0)), 0.0), 3.0);
      // A hint of the green it had, so it reads as water on either theme.
      vec3 water = uColor * 1.1 + glint * 0.1;
      finalColor = mix(finalColor, water, uDrain);
      alpha = mix(alpha, alpha * 0.05 + rim * 0.16, uDrain);
    }

    // The name, drawn over everything: the text colour, and behind the
    // soaking front the blob's very green, shaded by stroke depth the way
    // the blob is by its own (so a filled frame matches the matter exactly).
    if (uNameOn > 0.5) {
      vec2 nameUv = (px - uNameRect.xy) / uNameRect.zw;
      float cover = 0.0;
      vec3 nameColor = uInk;
      if (all(greaterThanEqual(nameUv, vec2(0.0))) && all(lessThanEqual(nameUv, vec2(1.0)))) {
        vec4 mask = texture(uName, nameUv);
        // Edge width in mask density: about one screen pixel at any zoom.
        float texelsPerPx = uNameScale / uNameZoom;
        float k = clamp(0.55 * texelsPerPx, 0.015, 0.5);
        cover = smoothstep(0.5 - k, 0.5 + k, mask.r);

        // Each letter takes up the colour as a whole, ink turning slowly to
        // the blob's green, starting at its own time (nearest the blob first).
        float start = soakArrival(nameUv);
        // The cursor ball is a second source of water: letters under it
        // drink ahead of the scroll, and the green in them gathers towards
        // it, denser and brighter, relaxing again once it moves away.
        float near = smoothstep(uBall.z * 2.2, uBall.z * 0.2, length(px - uBall.xy));
        float soakStarted = smoothstep(0.0, 0.06, min(uSoak, 1.0));
        float wet = smoothstep(start * 0.5, start * 0.5 + 0.5, uSoak + near * 0.45 * soakStarted);
        vec3 soaked = mix(uColor, uColor * 0.85, smoothstep(0.35, 0.95, mask.g) * (1.0 - near * 0.8));
        soaked = mix(soaked, min(uColor * 1.15 + 0.03, vec3(1.0)), near * 0.5 * soakStarted);
        nameColor = mix(uInk, soaked, wet);
      }
      finalColor = mix(finalColor, nameColor, cover);
      // The name replaces solid DOM text, so it skips the canvas's fade-in.
      float opacity = max(alpha * uOpacity, cover);
      fragColor = vec4(finalColor * opacity, opacity);
      return;
    }

    float opacity = alpha * uOpacity;
    fragColor = vec4(finalColor * opacity, opacity);
  }
`
