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
  // 1 for the water sheet (signature scene): one flat colour, so it meets
  // the hero's last frame and the page exactly.
  uniform float uLiquidEdge;
  // The cursor ball's velocity (px/s, smoothed): moving through the sheet's
  // swell it pushes and drags the water around it.
  uniform vec2 uBallVelocity;
  // How far the ball has faded back into the water under the scene's text.
  uniform float uBallSink;

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
    // On the water sheet the ball is drawn as its own layer (below), so the
    // sheet's edge never reaches for it: no union, no shared ripple.
    float sheet = step(0.5, uLiquidEdge);
    float d = sheet > 0.5 ? body : uBall.w > 0.5 ? smin(body, ball, uBall.w / unit) : min(body, ball);
    float ballness = smoothstep(-0.02, 0.02, body - ball) * (1.0 - sheet);

    // Surface ripple: there while liquid, plus whatever the scroll stirs up.
    // Both die out as the matter sets, so it lands still and crisp.
    float settle = smoothstep(0.0, 0.25, uFluid);
    // The ball never sets, so its surface keeps moving.
    float bodyRipple = uFluid + uFlow * 1.5 * settle;
    float ripple = mix(bodyRipple, 1.0 + uFlow, ballness) * uDetail;
    d += snoise(uv * 1.5 + uTime * 0.15) * 0.04 * uScale * ripple;

    float aa = mix(mix(0.75 / unit, 0.04, uFluid), 0.04, ballness);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depthFactor = smoothstep(0.0, -0.5 * uScale, d + dither);
    vec3 matter = mix(uColor, uTargetColor, uSolid);
    vec3 shaded = mix(matter, matter * 0.85, depthFactor * (1.0 - uLiquidEdge));

    // The matter as a sheet of water over the whole frame: long, slow swells
    // with a soft sheen, and the page rising from under it in its own spot,
    // murky, bent and edgeless at first, then the water calms and clears
    // until it is plain glass and the page shows exactly as it is.
    // Scrolling stirs it again.
    vec3 bodyColor = shaded;
    if (uSurface > 0.0) {
      float unrest = (1.0 - uClarity) * (1.0 + uFlow * 2.0) * uSurface;

      vec2 q = px / unit * 0.8;
      // The ball in the water: the swell parts around it and is dragged
      // along as it moves. Only visible while the water is still moving.
      vec2 fromBall = (px - uBall.xy) / unit;
      float ballReach = max(uBall.z / unit, 1e-3) * 2.4;
      float nearBall = exp(-dot(fromBall, fromBall) / (ballReach * ballReach));
      q -= fromBall / max(length(fromBall), 1e-3) * nearBall * uBall.z / unit * 0.5;
      q -= uBallVelocity / unit * 0.18 * nearBall;
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
      vec2 slope = vec2(hx - h, hy - h) / e * unrest;

      // Swells tint the water a little: crests lighter, troughs deeper.
      vec3 water = shaded * (1.0 + h * 0.06 * unrest);

      if (uHasImage > 0.5 && uImageIn > 0.0) {
        vec2 bentPx = px + slope * uImageRect.z * 0.009;
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
      vec3 normal = normalize(vec3(-slope * 0.18, 1.0));
      float facing = dot(normal, normalize(vec3(-0.35, -0.45, 1.0)));
      float sheen = smoothstep(0.8, 1.0, facing);
      water += (sheen - 0.6) * 0.08 * min(1.0, length(slope) * 4.0 + unrest);
      bodyColor = mix(shaded, water, uSurface);
    }

    // The ball stays liquid: it keeps the blob's own green.
    vec3 ballColor = mix(uColor, uColor * 0.85, depthFactor);
    vec3 finalColor = mix(bodyColor, ballColor, ballness);

    // Inside the water sheet the body's union would swallow the ball, so it
    // is drawn on its own there, with exactly the hero's ball formula:
    // same circle, same noise field around the frame's middle, same ripple,
    // edge and shading.
    if (uLiquidEdge > 0.5 && uBall.z > 0.0) {
      vec2 heroUv = (px - uViewport * 0.5) / unit;
      float ballD = sdCircle((px - uBall.xy) / unit, uBall.z / unit);
      ballD += snoise(heroUv * 1.5 + uTime * 0.15) * 0.04 * uScale * (1.0 + uFlow) * uDetail;
      float ballAlpha = smoothstep(0.04, -0.04, ballD);
      // Over text the ball fades back into the water as a whole.
      ballAlpha *= 1.0 - 0.9 * uBallSink;
      float ballDepth = smoothstep(0.0, -0.5 * uScale, ballD + dither);
      finalColor = mix(finalColor, mix(uColor, uColor * 0.85, ballDepth), ballAlpha);
      alpha = max(alpha, ballAlpha);
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

    float opacity = alpha * uOpacity;
    fragColor = vec4(finalColor * opacity, opacity);
  }
`
