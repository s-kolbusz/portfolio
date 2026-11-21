/**
 * Shader for the hero story samples (docs/design/2026-11-14-otwarcie-diagnoza-telefon.md,
 * section 5). Same matter as the production blob (flat green, soft liquid
 * edge, the same noise), with three additions: a sheet that drains into the
 * blob on load, a liquid body that sets into crisp shapes, and a page seen
 * through the matter as through water.
 *
 * All positions are CSS pixels, origin top-left. Distances are in "units"
 * (half the canvas height), as in the production shader.
 */
export const SAMPLE_VERTEX_SRC = /* glsl */ `#version 300 es
  in vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

export const SAMPLE_FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;

  uniform float uTime;
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform vec3 uColor;

  // Liquid body: up to five drops (xy centre, z radius; radius 0 = unused).
  uniform vec4 uDrops[5];
  // Smooth-union width between the drops (px).
  uniform float uDropMerge;
  // The sheet over the whole frame on load: extra radius (px) added to the
  // body, draining to 0.
  uniform float uCover;
  // 0 liquid → 1 set into the shape.
  uniform float uSet;
  // Extra unrest of the edge while it changes state, 0–1.
  uniform float uWobble;
  uniform int uShape;
  // Shape centre (px) and half-size (px).
  uniform vec3 uShapeBox;
  // The pointer ball: xy, radius, smooth-union width (px).
  uniform vec4 uBall;

  // Window sample: pages under the water.
  uniform float uWindow;
  uniform sampler2D uImageA;
  uniform sampler2D uImageB;
  uniform float uImageMix;
  uniform vec2 uImageAspect;
  // Square the pages are laid into: xy centre, z half-size (px).
  uniform vec3 uImageBox;

  out vec4 fragColor;

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

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

  // --- Shapes, in their own space: the shape fits x −1…1, y −0.72…0.72. ---

  const vec2 PANEL = vec2(1.0, 0.72);

  // stronypodhale.pl: a browser window with the Tatra ridge in its hero.
  float shapeSite(vec2 p) {
    float outer = sdBox(p, PANEL, 0.09);
    float bar = sdBox(p - vec2(0.0, -0.5), vec2(0.92, 0.014), 0.014);
    float dots = min(
      sdCircle(p - vec2(-0.84, -0.61), 0.035),
      min(sdCircle(p - vec2(-0.72, -0.61), 0.035), sdCircle(p - vec2(-0.60, -0.61), 0.035))
    );
    float heroBox = sdBox(p - vec2(0.0, -0.12), vec2(0.86, 0.27), 0.04);
    float ridge = min(
      (-0.27 + abs(p.x + 0.34) * 0.85 - p.y),
      (-0.14 + abs(p.x - 0.2) * 0.8 - p.y)
    ) * 0.7;
    ridge = min(ridge, (0.02 + abs(p.x - 0.62) * 0.9 - p.y) * 0.7);
    float hero = max(heroBox, -ridge);
    float lines = min(
      sdBox(p - vec2(-0.44, 0.34), vec2(0.42, 0.035), 0.035),
      sdBox(p - vec2(-0.58, 0.5), vec2(0.28, 0.035), 0.035)
    );
    float button = sdBox(p - vec2(0.62, 0.42), vec2(0.22, 0.085), 0.085);
    float holes = min(min(bar, dots), min(hero, min(lines, button)));
    return max(outer, -holes);
  }

  // aspect-preview: a photo with a 4:5 crop frame, its handles and thirds.
  float shapeCrop(vec2 p) {
    float outer = sdBox(p, PANEL, 0.09);
    vec2 crop = vec2(0.44, 0.55);
    vec2 c = p - vec2(-0.3, 0.0);
    float frame = abs(sdBox(c, crop, 0.0)) - 0.02;
    vec2 corner = abs(c) - crop;
    float handles = sdBox(corner, vec2(0.07), 0.02);
    float thirds = min(
      min(abs(c.x - crop.x / 3.0), abs(c.x + crop.x / 3.0)),
      min(abs(c.y - crop.y / 3.0), abs(c.y + crop.y / 3.0))
    ) - 0.008;
    thirds = max(thirds, sdBox(c, crop, 0.0));
    // Ratio chips beside it: the chosen one is longer.
    float chips = min(
      sdBox(p - vec2(0.56, -0.42), vec2(0.3, 0.07), 0.07),
      min(
        sdBox(p - vec2(0.46, -0.18), vec2(0.2, 0.07), 0.07),
        sdBox(p - vec2(0.46, 0.06), vec2(0.2, 0.07), 0.07)
      )
    );
    float holes = min(min(frame, handles), min(thirds, chips));
    return max(outer, -holes);
  }

  // An editor: title bar, file tree, indented lines of code.
  float shapeEditor(vec2 p) {
    float outer = sdBox(p, PANEL, 0.09);
    float bar = sdBox(p - vec2(0.0, -0.5), vec2(0.92, 0.014), 0.014);
    float side = sdBox(p - vec2(-0.5, 0.11), vec2(0.014, 0.55), 0.014);
    float holes = min(bar, side);
    holes = min(holes, sdBox(p - vec2(-0.8, -0.61), vec2(0.12, 0.035), 0.035));
    for (int i = 0; i < 4; i++) {
      float y = -0.34 + float(i) * 0.15;
      float len = i == 1 ? 0.1 : 0.15;
      holes = min(holes, sdBox(p - vec2(-0.9 + len + (i == 1 ? 0.06 : 0.0), y), vec2(len, 0.028), 0.028));
    }
    for (int i = 0; i < 7; i++) {
      float y = -0.36 + float(i) * 0.145;
      float indent = (i == 0 || i == 6) ? 0.0 : (i == 3 || i == 4) ? 0.22 : 0.11;
      float len = 0.16 + 0.2 * fract(sin(float(i) * 12.9898) * 43758.5453);
      holes = min(holes, sdBox(p - vec2(-0.38 + indent + len, y), vec2(len, 0.03), 0.03));
    }
    return max(outer, -holes);
  }

  // A printed part: a hex nut, with the layer lines of the print.
  float shapePrint(vec2 p) {
    vec2 q = abs(p);
    float hex = max(q.y, q.x * 0.866025 + q.y * 0.5) - 0.66;
    float bore = sdCircle(p, 0.3);
    float pitch = 0.094;
    float layers = abs(mod(p.y + pitch * 0.5, pitch) - pitch * 0.5) - 0.007;
    return max(hex, -min(bore, layers));
  }

  // Home energy panel: a day of solar output in bars, a gauge, two readings.
  float shapeEnergy(vec2 p) {
    float outer = sdBox(p, PANEL, 0.09);
    float gauge = abs(sdCircle(p - vec2(-0.62, -0.32), 0.19)) - 0.035;
    float readings = min(
      sdBox(p - vec2(0.02, -0.4), vec2(0.3, 0.05), 0.05),
      sdBox(p - vec2(-0.1, -0.22), vec2(0.18, 0.035), 0.035)
    );
    readings = min(readings, sdBox(p - vec2(0.68, -0.4), vec2(0.16, 0.05), 0.05));
    float bars = 1e3;
    for (int i = 0; i < 9; i++) {
      float x = -0.8 + float(i) * 0.2;
      float sun = exp(-pow((float(i) - 4.0) / 2.1, 2.0));
      float h = 0.04 + 0.26 * sun;
      bars = min(bars, sdBox(p - vec2(x, 0.56 - h), vec2(0.06, h), 0.03));
    }
    return max(outer, -min(min(gauge, readings), bars));
  }

  float shape(vec2 p) {
    if (uShape == 0) return shapeSite(p);
    if (uShape == 1) return shapeCrop(p);
    if (uShape == 2) return shapeEditor(p);
    if (uShape == 3) return shapePrint(p);
    return shapeEnergy(p);
  }

  vec3 page(sampler2D image, float aspect, vec2 uv, float lod) {
    // Cover-fit into the square, from the top of the page.
    vec2 st = uv;
    if (aspect > 1.0) st.x = (st.x - 0.5) / aspect + 0.5;
    else st.y = st.y * aspect;
    return textureLod(image, clamp(st, 0.0, 1.0), lod).rgb;
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uViewport.y - px.y;
    float unit = uViewport.y * 0.5;

    // --- Liquid body ---
    float breathe = sin(uTime * 0.3) * 0.03;
    vec2 drift = vec2(
      snoise(vec2(uTime * 0.1, 0.0)),
      snoise(vec2(0.0, uTime * 0.15))
    ) * 0.06 * unit;

    float liquid = 1e3;
    for (int i = 0; i < 5; i++) {
      vec4 drop = uDrops[i];
      if (drop.z <= 0.0) continue;
      float dd = sdCircle((px - drop.xy - drift) / unit, drop.z / unit + breathe);
      liquid = liquid > 999.0 ? dd : smin(liquid, dd, max(uDropMerge / unit, 1e-3));
    }

    // The sheet: the same body grown past the frame. Its edge is irregular,
    // long tongues and bays that the drain pulls back into the blob.
    float cover = uCover / unit;
    float coverK = smoothstep(0.0, 0.5, cover);
    vec2 np = px / unit;
    float tongues =
      snoise(np * 0.9 + vec2(uTime * 0.21, -uTime * 0.13)) * 0.3 +
      snoise(np * 2.1 - vec2(uTime * 0.17, uTime * 0.29)) * 0.11 +
      snoise(np * 4.6 + uTime * 0.4) * 0.035;
    liquid -= cover;
    liquid += tongues * coverK;

    // --- Set shape ---
    vec2 sp = (px - uShapeBox.xy) / uShapeBox.z;
    float solid = shape(sp) * uShapeBox.z / unit;

    float set = uSet;
    float d = mix(liquid, solid, set);

    // The ball stays liquid and only clings to matter that is liquid too.
    float ball = sdCircle((px - uBall.xy) / unit, uBall.z / unit);
    float merge = uBall.w / unit * (1.0 - set);
    float body = d;
    if (uBall.z > 0.0) d = merge > 1e-3 ? smin(d, ball, merge) : min(d, ball);
    float ballness = uBall.z > 0.0 ? smoothstep(-0.02, 0.02, body - ball) : 0.0;

    // Surface ripple: full while liquid, none once set; changing state stirs it.
    float fluid = mix(1.0 - set, 1.0, ballness);
    float unrest = fluid + uWobble * 2.2 * (1.0 - ballness);
    d += snoise(np * 1.5 + uTime * 0.15) * 0.04 * unrest;
    d += snoise(np * 3.4 - uTime * 0.35) * 0.02 * uWobble * (1.0 - ballness);

    // Soft edge while liquid, a crisp one once set (half a device pixel).
    float crisp = 0.75 / (unit * uDpr);
    float aa = mix(crisp, 0.04, fluid * fluid);
    float alpha = smoothstep(aa, -aa, d);

    float dither = snoise(px * 0.5) * 0.025;
    float depth = smoothstep(0.0, -0.5, d + dither) * fluid;
    // Under the sheet the matter is one flat colour, like the water sheet later.
    vec3 color = mix(uColor, uColor * 0.85, depth * (1.0 - coverK));

    // --- Pages under the water (window sample) ---
    if (uWindow > 0.0) {
      vec2 q = px / unit * 0.9;
      float e = 0.05;
      float h = snoise(q + vec2(uTime * 0.05, uTime * 0.03)) * 0.6 + snoise(q * 1.9 - uTime * 0.04) * 0.25;
      float hx = snoise(q + vec2(e, 0.0) + vec2(uTime * 0.05, uTime * 0.03)) * 0.6 + snoise((q + vec2(e, 0.0)) * 1.9 - uTime * 0.04) * 0.25;
      float hy = snoise(q + vec2(0.0, e) + vec2(uTime * 0.05, uTime * 0.03)) * 0.6 + snoise((q + vec2(0.0, e)) * 1.9 - uTime * 0.04) * 0.25;
      vec2 slope = vec2(hx - h, hy - h) / e;

      // The ball is a patch of still, clear water.
      vec2 fromBall = (px - uBall.xy) / max(uBall.z * 1.7, 1.0);
      float clear = uBall.z > 0.0 ? exp(-dot(fromBall, fromBall)) : 0.0;
      clear = smoothstep(0.08, 0.75, clear);

      float murky = 1.0 - clear;
      vec2 bent = px + slope * uImageBox.z * 0.03 * murky;
      vec2 uv = (bent - uImageBox.xy) / (uImageBox.z * 2.0) + 0.5;
      float lod = 4.2 * murky;
      vec3 seenA = page(uImageA, uImageAspect.x, uv, lod);
      vec3 seenB = page(uImageB, uImageAspect.y, uv, lod);
      vec3 seen = mix(seenA, seenB, uImageMix);
      vec3 water = uColor * (1.0 + h * 0.05);
      // Deep water hides the page; changing pages clouds it over for a moment.
      float murk = mix(0.78, 0.0, clear);
      murk = max(murk, sin(uImageMix * 3.14159) * 0.97);
      vec3 through = mix(seen, water, murk);
      // Shallow at the rim: the page fades out before the blob's edge.
      float inside = smoothstep(0.0, -0.22, body) * (1.0 - ballness) * uWindow;
      color = mix(color, through, inside * (1.0 - coverK));
      // Sheen on the slopes that face the light.
      vec3 normal = normalize(vec3(-slope * 0.2, 1.0));
      float sheen = smoothstep(0.82, 1.0, dot(normal, normalize(vec3(-0.35, -0.45, 1.0))));
      color += (sheen - 0.5) * 0.05 * murky * inside * (1.0 - coverK);
    }

    fragColor = vec4(color * alpha, alpha);
  }
`
