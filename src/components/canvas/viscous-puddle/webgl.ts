import { FRAGMENT_SRC, VERTEX_SRC } from './shaders'

interface PuddleUniforms {
  uTime: WebGLUniformLocation | null
  uViewport: WebGLUniformLocation | null
  uDpr: WebGLUniformLocation | null
  uMouse: WebGLUniformLocation | null
  uScale: WebGLUniformLocation | null
  uOpacity: WebGLUniformLocation | null
  uDetail: WebGLUniformLocation | null
  uColor: WebGLUniformLocation | null
  uTargetColor: WebGLUniformLocation | null
  uSolid: WebGLUniformLocation | null
  uBody: WebGLUniformLocation | null
  uCenter: WebGLUniformLocation | null
  uHalfSize: WebGLUniformLocation | null
  uCorner: WebGLUniformLocation | null
  uFluid: WebGLUniformLocation | null
  uFlow: WebGLUniformLocation | null
  uImage: WebGLUniformLocation | null
  uHasImage: WebGLUniformLocation | null
  uImageRect: WebGLUniformLocation | null
  uImageIn: WebGLUniformLocation | null
  uClarity: WebGLUniformLocation | null
  uDropShape: WebGLUniformLocation | null
  uDrop: WebGLUniformLocation | null
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
    uViewport: gl.getUniformLocation(program, 'uViewport'),
    uDpr: gl.getUniformLocation(program, 'uDpr'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uOpacity: gl.getUniformLocation(program, 'uOpacity'),
    uDetail: gl.getUniformLocation(program, 'uDetail'),
    uColor: gl.getUniformLocation(program, 'uColor'),
    uTargetColor: gl.getUniformLocation(program, 'uTargetColor'),
    uSolid: gl.getUniformLocation(program, 'uSolid'),
    uBody: gl.getUniformLocation(program, 'uBody'),
    uCenter: gl.getUniformLocation(program, 'uCenter'),
    uHalfSize: gl.getUniformLocation(program, 'uHalfSize'),
    uCorner: gl.getUniformLocation(program, 'uCorner'),
    uFluid: gl.getUniformLocation(program, 'uFluid'),
    uFlow: gl.getUniformLocation(program, 'uFlow'),
    uImage: gl.getUniformLocation(program, 'uImage'),
    uHasImage: gl.getUniformLocation(program, 'uHasImage'),
    uImageRect: gl.getUniformLocation(program, 'uImageRect'),
    uImageIn: gl.getUniformLocation(program, 'uImageIn'),
    uClarity: gl.getUniformLocation(program, 'uClarity'),
    uDropShape: gl.getUniformLocation(program, 'uDropShape'),
    uDrop: gl.getUniformLocation(program, 'uDrop'),
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

/** Uploads a decoded image as the texture the matter turns into (unit 0). */
export function createImageTexture(gl: WebGL2RenderingContext, image: TexImageSource) {
  const texture = gl.createTexture()
  if (!texture) return null
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // Rows stay top-down: the shader samples with a top-left origin.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return texture
}

/** Mean sRGB colour of an image (0–1 floats), sampled on a tiny 2D canvas. */
export function averageColour(image: CanvasImageSource): [number, number, number] | null {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 18
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
  let r = 0
  let g = 0
  let b = 0
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  const count = (data.length / 4) * 255
  return [r / count, g / count, b / count]
}

export function disposePuddleWebGL({ gl, program, vao, vbo }: PuddleWebGLContext) {
  gl.deleteBuffer(vbo)
  gl.deleteVertexArray(vao)
  gl.deleteProgram(program)
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
