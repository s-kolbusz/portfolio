export const VERTEX_SRC = /* glsl */ `#version 300 es
  in vec2 aPosition;
  out vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

/** Most drips the melting name can run at once. */
export const MAX_DRIPS = 32

export const FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;
  #define MAX_DRIPS ${MAX_DRIPS}

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
  // 0 = murky, rippling surface over the page; 1 = still, clear glass.
  uniform float uClarity;

  // The melting name (hero). uName: R crisp glyph mask, G softened mask,
  // drawn in uNameRect (xy top-left, zw size, px), lowered by uNameSag.
  uniform sampler2D uName;
  uniform float uNameOn;
  uniform vec4 uNameRect;
  uniform float uNameSag;
  // 0 crisp type → 1 edges softened like warm wax; blur radius of G, px.
  uniform float uNameSoften;
  uniform float uNameSoftRadius;
  // Colour: the text colour (uInk) taking on the matter's (uNameTint), and
  // how far it has dissolved into the blob (uNameFade).
  uniform vec3 uInk;
  uniform float uNameTint;
  uniform float uNameFade;
  // Drips: xy root, z length, w head radius (px); neck radius per drip in uDripNecks.
  uniform vec4 uDrips[MAX_DRIPS];
  uniform float uDripNecks[MAX_DRIPS];
  uniform int uDripCount;

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

  // A tapering capsule hanging down from the origin: r1 at the root, r2 at
  // the end h below (y grows downwards). Inigo Quilez's uneven capsule.
  float sdDrip(vec2 p, float r1, float r2, float h) {
    p.x = abs(p.x);
    float b = (r1 - r2) / h;
    float a = sqrt(max(1.0 - b * b, 0.0));
    float k = dot(p, vec2(-b, a));
    if (k < 0.0) return length(p) - r1;
    if (k > a * h) return length(p - vec2(0.0, h)) - r2;
    return dot(p, vec2(a, b)) - r1;
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
    }

    // The melting name: its glyphs (crisp, then softened like warm wax) and
    // the drips running off them, one liquid shape, in px.
    float name = 1e5;
    if (uNameOn > 0.5) {
      vec2 nameUv = (px - uNameRect.xy - vec2(0.0, uNameSag)) / uNameRect.zw;
      if (all(greaterThanEqual(nameUv, vec2(0.0))) && all(lessThanEqual(nameUv, vec2(1.0)))) {
        vec2 mask = texture(uName, nameUv).rg;
        float density = mix(mask.r, mask.g, uNameSoften);
        // Density → distance: 0.5 is the edge. The ramp is kept well above the
        // anti-aliasing width, so empty mask reads as fully outside (no halo);
        // it widens with the blur, which keeps the softened edge smooth.
        float ramp = mix(3.0, uNameSoftRadius * 1.6, uNameSoften);
        name = (0.5 - density) * ramp;
      }
      for (int i = 0; i < MAX_DRIPS; i++) {
        if (i >= uDripCount) break;
        vec4 drip = uDrips[i];
        float neck = uDripNecks[i];
        if (drip.w <= 0.0) continue;
        float h = max(drip.z, abs(neck - drip.w) + 0.5);
        // A slight sway, so the runs are not ruled lines.
        vec2 q = px - drip.xy;
        q.x += sin(q.y * 0.045 + float(i) * 1.7) * min(q.y, 40.0) * 0.06;
        name = smin(name, sdDrip(q, neck, drip.w, h), max(neck, 1.0) * 2.5);
      }
    }

    float ball = sdCircle((px - uBall.xy) / unit, uBall.z / unit);
    float d = uBall.w > 0.5 ? smin(body, ball, uBall.w / unit) : min(body, ball);
    float ballness = smoothstep(-0.02, 0.02, body - ball);

    // Surface ripple: there while liquid, plus whatever the scroll stirs up.
    // Both die out as the matter sets, so it lands still and crisp.
    float settle = smoothstep(0.0, 0.25, uFluid);
    // The ball never sets, so its surface keeps moving.
    float ripple = mix(uFluid + uFlow * 1.5 * settle, 1.0 + uFlow, ballness) * uDetail;
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * ripple;

    float aa = mix(mix(0.75 / unit, 0.04, uFluid), 0.04, ballness);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 matter = mix(uColor, uTargetColor, uSolid);
    vec3 shaded = mix(matter, matter * 0.85, depthFactor * (1.0 - uSolid * 0.6));

    // The page under the matter, seen through its surface: murky and bent by
    // waves at first, then the water calms and clears until it is plain
    // glass and the page shows exactly as it is. Scrolling stirs it again.
    vec3 bodyColor = shaded;
    if (uHasImage > 0.5 && uImageIn > 0.0) {
      vec2 imageUv = clamp((px - uImageRect.xy) / uImageRect.zw, 0.0, 1.0);
      float unrest = (1.0 - uClarity) * (1.0 + uFlow * 2.0);

      // Long, slow swells: a settling surface, not a choppy one.
      vec2 q = (px - uImageRect.xy) / unit * 1.1;
      float e = 0.05;
      vec2 t1 = vec2(uTime * 0.07, uTime * 0.05);
      vec2 t2 = vec2(-uTime * 0.09, uTime * 0.06);
      float h = snoise(q + t1) + 0.3 * snoise(q * 1.9 + t2);
      float hx = snoise(q + vec2(e, 0.0) + t1) + 0.3 * snoise((q + vec2(e, 0.0)) * 1.9 + t2);
      float hy = snoise(q + vec2(0.0, e) + t1) + 0.3 * snoise((q + vec2(0.0, e)) * 1.9 + t2);
      vec2 slope = vec2(hx - h, hy - h) / e;

      vec2 bent = clamp(imageUv + slope * 0.009 * unrest, 0.0, 1.0);
      vec3 seen = texture(uImage, bent).rgb;

      // A soft sheen rolling over the swells.
      vec3 normal = normalize(vec3(-slope * 0.25 * unrest, 1.0));
      float sheen = pow(max(dot(normal, normalize(vec3(-0.35, -0.45, 1.0))), 0.0), 12.0);
      float murk = (1.0 - uClarity) * 0.7;

      vec3 through = mix(seen, shaded, murk) + (sheen - 0.55) * 0.12 * unrest;
      bodyColor = mix(shaded, through, uImageIn);
    }

    // The ball stays liquid: it keeps the blob's own green.
    vec3 ballColor = mix(uColor, uColor * 0.85, depthFactor);
    vec3 finalColor = mix(bodyColor, ballColor, ballness);

    // The name is drawn over the blob in its own colour, turning green as it
    // melts (the runs first), and finally dissolving into the body.
    if (uNameOn > 0.5) {
      float cover = smoothstep(0.7, -0.7, name) * (1.0 - uNameFade);
      float below = clamp((px.y - (uNameRect.y + uNameSag + uNameRect.w * 0.8)) / uNameRect.w, 0.0, 1.0);
      vec3 nameColor = mix(uInk, matter * 0.8, clamp(uNameTint + below * 0.6, 0.0, 1.0));
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
