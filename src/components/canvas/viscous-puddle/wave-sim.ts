/**
 * The water sheet's surface as a real wave field: a small height map stepped
 * with the wave equation on the GPU (ping-pong float textures). The blob
 * floating in it is a moving body that pushes the water: it raises a bow
 * wave ahead, leaves a trough behind, and those spread, cross and fade the
 * way water does. The render shader adds this field to the ambient swell,
 * so the blob moves the water itself, not just the light on it.
 *
 * The field covers the pinned stage (one viewport) and rides with it.
 * Needs rendering to float textures (EXT_color_buffer_float); without it
 * there is simply no wave field and the sheet keeps its swell.
 */

const SIM_VERTEX = /* glsl */ `#version 300 es
  out vec2 vUv;
  void main() {
    // One triangle covering the target, no buffers needed.
    vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    vUv = p;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  }
`

const SIM_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  uniform sampler2D uState;
  uniform vec2 uSize;
  // The blob in field texels: xy centre, z radius; its velocity per step.
  uniform vec3 uBlob;
  uniform vec2 uVelocity;
  uniform float uPush;
  uniform float uDamping;
  in vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec2 texel = 1.0 / uSize;
    vec4 here = texture(uState, vUv);
    float l = texture(uState, vUv - vec2(texel.x, 0.0)).r;
    float r = texture(uState, vUv + vec2(texel.x, 0.0)).r;
    float d = texture(uState, vUv - vec2(0.0, texel.y)).r;
    float u = texture(uState, vUv + vec2(0.0, texel.y)).r;
    // Wave equation (speed² = 0.5 texel²/step), then a little damping.
    float next = ((l + r + u + d) * 0.5 - here.g) * uDamping;

    // The moving blob displaces the water around its rim: up where it
    // moves into the water, down where it moves away.
    vec2 fromBlob = vUv * uSize - uBlob.xy;
    float distance = length(fromBlob);
    float rim = exp(-pow((distance - uBlob.z) / (uBlob.z * 0.45), 2.0));
    vec2 outward = fromBlob / max(distance, 1e-3);
    next += dot(uVelocity, outward) * rim * uPush;

    fragColor = vec4(next, here.r, 0.0, 1.0);
  }
`

export interface WaveSim {
  /** Steps the field once with the blob at (x, y) moving by (vx, vy), all in viewport px. */
  step(
    blob: { x: number; y: number; radius: number; vx: number; vy: number },
    stageTop: number
  ): void
  /** The current height field (bind to a texture unit to sample). */
  texture(): WebGLTexture
  resize(viewportWidth: number, viewportHeight: number): void
  /** Lets the water fall still (when the sheet is off screen). */
  clear(): void
  dispose(): void
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Wave field shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function createWaveSim(gl: WebGL2RenderingContext, resolution: number): WaveSim | null {
  if (!gl.getExtension('EXT_color_buffer_float')) return null

  const vs = compile(gl, gl.VERTEX_SHADER, SIM_VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, SIM_FRAGMENT)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const uState = uniform('uState')
  const uSize = uniform('uSize')
  const uBlob = uniform('uBlob')
  const uVelocity = uniform('uVelocity')
  const uPush = uniform('uPush')
  const uDamping = uniform('uDamping')
  const vao = gl.createVertexArray()

  let width = 1
  let height = 1
  let viewportWidth = 1
  let viewportHeight = 1
  let targets: Array<{ texture: WebGLTexture; framebuffer: WebGLFramebuffer }> = []
  let current = 0

  const release = () => {
    for (const target of targets) {
      gl.deleteTexture(target.texture)
      gl.deleteFramebuffer(target.framebuffer)
    }
    targets = []
  }

  const allocate = () => {
    release()
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const framebuffer = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      targets.push({ texture, framebuffer })
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.activeTexture(gl.TEXTURE0)
    clear()
  }

  const clear = () => {
    const previous = gl.getParameter(gl.COLOR_CLEAR_VALUE) as Float32Array
    gl.clearColor(0, 0, 0, 0)
    for (const target of targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clearColor(previous[0], previous[1], previous[2], previous[3])
  }

  const resize = (nextWidth: number, nextHeight: number) => {
    viewportWidth = Math.max(1, nextWidth)
    viewportHeight = Math.max(1, nextHeight)
    const w = resolution
    const h = Math.max(1, Math.round((resolution * viewportHeight) / viewportWidth))
    if (w === width && h === height && targets.length) return
    width = w
    height = h
    allocate()
  }

  return {
    step(blob, stageTop) {
      if (!targets.length) return
      const toTexelX = width / viewportWidth
      const toTexelY = height / viewportHeight
      const source = targets[current]
      const target = targets[1 - current]

      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
      gl.viewport(0, 0, width, height)
      gl.disable(gl.BLEND)
      gl.disable(gl.SCISSOR_TEST)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, source.texture)
      gl.uniform1i(uState, 2)
      gl.uniform2f(uSize, width, height)
      // Field rows run top-down like the page (v = 0 at the stage's top).
      gl.uniform3f(
        uBlob,
        blob.x * toTexelX,
        (blob.y - stageTop) * toTexelY,
        Math.max(1, blob.radius * toTexelX)
      )
      // Capped, so a flick of the mouse makes a splash, not a blow-up.
      const vx = Math.max(-1.5, Math.min(1.5, blob.vx * toTexelX))
      const vy = Math.max(-1.5, Math.min(1.5, blob.vy * toTexelY))
      gl.uniform2f(uVelocity, vx, vy)
      gl.uniform1f(uPush, 0.06)
      gl.uniform1f(uDamping, 0.988)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.bindVertexArray(null)
      gl.enable(gl.BLEND)
      gl.activeTexture(gl.TEXTURE0)
      current = 1 - current
    },
    texture: () => targets[current].texture,
    resize,
    clear,
    dispose() {
      release()
      gl.deleteProgram(program)
      gl.deleteVertexArray(vao)
    },
  }
}
