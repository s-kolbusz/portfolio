import { FRAGMENT_SRC, VERTEX_SRC } from './shaders'

interface PuddleUniforms {
  uTime: WebGLUniformLocation | null
  uMouse: WebGLUniformLocation | null
  uResolution: WebGLUniformLocation | null
  uColor: WebGLUniformLocation | null
  uScale: WebGLUniformLocation | null
  uOpacity: WebGLUniformLocation | null
}

interface PuddleWebGLContext {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  vao: WebGLVertexArrayObject
  vbo: WebGLBuffer
  uniforms: PuddleUniforms
}

// prettier-ignore
const QUAD_VERTICES = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
])

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('Unable to create shader')
  }

  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }

  return shader
}

function createProgram(gl: WebGL2RenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)

  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    throw new Error('Unable to create WebGL program')
  }

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${info}`)
  }

  gl.detachShader(program, vs)
  gl.detachShader(program, fs)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  return program
}

export function setupPuddleWebGL(canvas: HTMLCanvasElement): PuddleWebGLContext | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
    depth: false,
    stencil: false,
  })

  if (!gl) return null

  const program = createProgram(gl)

  const vao = gl.createVertexArray()
  const vbo = gl.createBuffer()

  if (!vao || !vbo) {
    if (vao) gl.deleteVertexArray(vao)
    if (vbo) gl.deleteBuffer(vbo)
    gl.deleteProgram(program)
    throw new Error('Unable to create WebGL buffers')
  }

  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW)

  const aPosition = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  gl.useProgram(program)

  const uniforms: PuddleUniforms = {
    uTime: gl.getUniformLocation(program, 'uTime'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uColor: gl.getUniformLocation(program, 'uColor'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uOpacity: gl.getUniformLocation(program, 'uOpacity'),
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  return {
    gl,
    program,
    vao,
    vbo,
    uniforms,
  }
}

export function disposePuddleWebGL({ gl, program, vao, vbo }: PuddleWebGLContext) {
  gl.deleteBuffer(vbo)
  gl.deleteVertexArray(vao)
  gl.deleteProgram(program)
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
