/**
 * Draws the matter as a field of many small drops: each drop adds a soft
 * spot to an off-screen field, and the field is then cut at a threshold. Where
 * drops are close the cut is one liquid surface; where they part it necks and
 * breaks, the way liquid does. Where drops have come to rest inside a
 * drawing, the drawing itself (crisp) replaces the liquid, so a thing sets
 * from wherever the matter has arrived.
 */

const POINT_VERTEX = /* glsl */ `#version 300 es
  in vec2 aPosition;
  // x: spot size (px), y: how settled (0–1), z: weight (wide spots add less)
  in vec3 aState;
  uniform vec2 uViewport;
  uniform float uScale;
  out float vSettled;
  out float vWeight;
  void main() {
    vec2 clip = aPosition / uViewport * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = aState.x * 6.0 * uScale;
    vSettled = aState.y;
    vWeight = aState.z;
  }
`

const POINT_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  in float vSettled;
  in float vWeight;
  uniform float uAmount;
  out vec4 fragColor;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    // Gaussian out to three sigma, eased to zero at the rim.
    float spot = exp(-r2 * 9.0) * (1.0 - r2 * r2);
    float add = uAmount * vWeight * spot;
    fragColor = vec4(add, add * vSettled, 0.0, 1.0);
  }
`

const QUAD_VERTEX = /* glsl */ `#version 300 es
  in vec2 aCorner;
  out vec2 vUv;
  void main() {
    vUv = aCorner * 0.5 + 0.5;
    gl_Position = vec4(aCorner, 0.0, 1.0);
  }
`

const SURFACE_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uField;
  uniform sampler2D uMask;
  uniform vec2 uViewport;
  // The square the drawing sits in: xy top-left, z size (px).
  uniform vec3 uStage;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uDpr;
  out vec4 fragColor;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 field = texture(uField, vUv).rg;
    float amount = field.r;
    // Share of the matter here that has come to rest.
    float settled = clamp(field.g / max(amount, 1e-4), 0.0, 1.0);
    float set = smoothstep(0.35, 0.92, settled);

    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uViewport;
    vec2 muv = (px - uStage.xy) / uStage.z;
    float inside = step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y) * step(muv.y, 1.0);
    vec4 drawing = texture(uMask, muv) * inside;

    // One contour for both states: the liquid's own level, and the
    // drawing's softened outline, blended by how much has set here. The
    // surface is where the blend crosses one half, so the edge travels from
    // the drop's outline to the drawing's instead of one fading over the other.
    float level = mix(amount / 0.5, drawing.g * step(0.12, amount), set);
    float slope = max(fwidth(level), 1e-4);
    // Signed distance to the surface in device pixels, positive inside.
    float sd = (level - 0.5) / slope;
    float alpha = clamp(sd + 0.5, 0.0, 1.0);
    // Fully set, the drawing is exact, fine details included.
    float exact = smoothstep(0.86, 1.0, set);
    alpha = mix(alpha, drawing.a * step(0.12, amount), exact);

    // Liquid is a bead: a thin light along the rim that faces up-left, a
    // thin shade along the one that faces away, and a body that deepens
    // inwards. Set matter is flat, in the drawing's tones.
    vec2 grad = vec2(dFdx(level), dFdy(level));
    vec2 facing = normalize(grad + 1e-5);
    // Only the outer rim: the body's own unevenness must not read as ridges.
    float outer = 1.0 - smoothstep(0.6, 0.82, level);
    float rim = smoothstep(9.0 * uDpr, 1.0 * uDpr, sd) * smoothstep(-1.0, 1.5 * uDpr, sd) * outer;
    float lit = dot(facing, normalize(vec2(1.0, -1.0)));
    float body = smoothstep(0.55, 0.95, level);
    vec3 wet = uColor * mix(1.04, 0.9, body);
    wet += rim * max(lit, 0.0) * 0.2;
    wet -= rim * max(-lit, 0.0) * 0.14;
    vec3 dry = uColor * mix(0.58, 0.94, drawing.r);
    vec3 color = mix(wet, dry, set * inside);
    color += (hash(px + fract(uTime) * 61.0) - 0.5) * 0.018;

    fragColor = vec4(color * alpha, alpha);
  }
`

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Matter shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Matter program:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}

export interface MatterRenderer {
  resize: (width: number, height: number, dpr: number) => void
  setMask: (mask: { data: Uint8Array; size: number }) => void
  /**
   * positions: xy pairs (CSS px); states: size, settled and weight triples.
   * stage: the drawing's square, CSS px.
   */
  draw: (frame: {
    positions: Float32Array
    states: Float32Array
    count: number
    stage: { x: number; y: number; size: number }
    color: readonly [number, number, number]
    time: number
  }) => void
  dispose: () => void
}

export function createMatterRenderer(canvas: HTMLCanvasElement): MatterRenderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
  })
  if (!gl) return null
  const points = link(gl, POINT_VERTEX, POINT_FRAGMENT)
  const surface = link(gl, QUAD_VERTEX, SURFACE_FRAGMENT)
  if (!points || !surface) return null

  // A float field keeps the liquid's edge smooth; 8 bits bands a little but works.
  const float = Boolean(
    gl.getExtension('EXT_color_buffer_float') ?? gl.getExtension('EXT_color_buffer_half_float')
  )
  gl.getExtension('OES_texture_float_linear')

  const pointVao = gl.createVertexArray()
  const positionBuffer = gl.createBuffer()
  const stateBuffer = gl.createBuffer()
  gl.bindVertexArray(pointVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const aPosition = gl.getAttribLocation(points, 'aPosition')
  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer)
  const aState = gl.getAttribLocation(points, 'aState')
  gl.enableVertexAttribArray(aState)
  gl.vertexAttribPointer(aState, 3, gl.FLOAT, false, 0, 0)

  const quadVao = gl.createVertexArray()
  const quadBuffer = gl.createBuffer()
  gl.bindVertexArray(quadVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  )
  const aCorner = gl.getAttribLocation(surface, 'aCorner')
  gl.enableVertexAttribArray(aCorner)
  gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  const fieldTexture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()
  const maskTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, maskTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))

  const size = { width: 1, height: 1, dpr: 1, fieldWidth: 1, fieldHeight: 1 }
  /** The field is smooth by nature, so it is drawn at CSS resolution, not the device's. */
  const fieldScale = () => 1 / size.dpr

  const uPoint = {
    viewport: gl.getUniformLocation(points, 'uViewport'),
    scale: gl.getUniformLocation(points, 'uScale'),
    amount: gl.getUniformLocation(points, 'uAmount'),
  }
  const uSurface = {
    field: gl.getUniformLocation(surface, 'uField'),
    mask: gl.getUniformLocation(surface, 'uMask'),
    viewport: gl.getUniformLocation(surface, 'uViewport'),
    dpr: gl.getUniformLocation(surface, 'uDpr'),
    stage: gl.getUniformLocation(surface, 'uStage'),
    color: gl.getUniformLocation(surface, 'uColor'),
    time: gl.getUniformLocation(surface, 'uTime'),
  }

  return {
    resize(width, height, dpr) {
      size.width = width
      size.height = height
      size.dpr = dpr
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      size.fieldWidth = Math.max(2, Math.round(canvas.width * fieldScale()))
      size.fieldHeight = Math.max(2, Math.round(canvas.height * fieldScale()))
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        float ? gl.RGBA16F : gl.RGBA8,
        size.fieldWidth,
        size.fieldHeight,
        0,
        gl.RGBA,
        float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTexture, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    },
    setMask(mask) {
      gl.bindTexture(gl.TEXTURE_2D, maskTexture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        mask.size,
        mask.size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        mask.data
      )
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    },
    draw({ positions, states, count, stage, color, time }) {
      // 1. The field.
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.viewport(0, 0, size.fieldWidth, size.fieldHeight)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE)
      gl.useProgram(points)
      gl.uniform2f(uPoint.viewport, size.width, size.height)
      gl.uniform1f(uPoint.scale, size.dpr * fieldScale())
      gl.uniform1f(uPoint.amount, 0.062)
      gl.bindVertexArray(pointVao)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, states, gl.DYNAMIC_DRAW)
      gl.drawArrays(gl.POINTS, 0, count)

      // 2. The surface.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.disable(gl.BLEND)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(surface)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fieldTexture)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, maskTexture)
      gl.uniform1i(uSurface.field, 0)
      gl.uniform1i(uSurface.mask, 1)
      gl.uniform2f(uSurface.viewport, size.width, size.height)
      gl.uniform1f(uSurface.dpr, size.dpr)
      gl.uniform3f(uSurface.stage, stage.x, stage.y, stage.size)
      gl.uniform3f(uSurface.color, color[0], color[1], color[2])
      gl.uniform1f(uSurface.time, time)
      gl.bindVertexArray(quadVao)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindVertexArray(null)
    },
    dispose() {
      gl.deleteTexture(fieldTexture)
      gl.deleteTexture(maskTexture)
      gl.deleteFramebuffer(framebuffer)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(stateBuffer)
      gl.deleteBuffer(quadBuffer)
      gl.deleteVertexArray(pointVao)
      gl.deleteVertexArray(quadVao)
      gl.deleteProgram(points)
      gl.deleteProgram(surface)
    },
  }
}
