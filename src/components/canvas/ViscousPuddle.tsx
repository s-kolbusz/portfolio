'use client'

import { useRef, useEffect, useMemo } from 'react'

import { useTheme } from 'next-themes'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uScale;
  uniform float uOpacity;
  
  varying vec2 vUv;

  // --------------------------------------------------------
  // SDF Primitives & Operations
  // --------------------------------------------------------
  
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // Smooth Min (Metaball blending)
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // --------------------------------------------------------
  // Noise (Simplex 2D)
  // --------------------------------------------------------
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
    // Normalize coordinates (-1 to 1), corrected for aspect ratio
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    // 1. Main Blob (Breathing)
    float breathe = sin(uTime * 0.3) * 0.03;
    vec2 mainPos = vec2(0.0, 0.0);
    
    // Subtle wandering
    mainPos.x += snoise(vec2(uTime * 0.1, 0.0)) * 0.15;
    mainPos.y += snoise(vec2(0.0, uTime * 0.15)) * 0.15;
    
    // Apply uScale to radius
    float d1 = sdCircle(uv - mainPos, (0.75 + breathe) * uScale);

    // 2. Mouse Blob (Interaction)
    vec2 mouseUV = uMouse * 2.0 - 1.0;
    mouseUV.x *= uResolution.x / uResolution.y;
    
    float d2 = sdCircle(uv - mouseUV, 0.25 * uScale);

    // 3. Blend (Metaballs)
    float d = smin(d1, d2, 0.6 * uScale); 

    // 4. Domain Warping (Organic Edge)
    float noise = snoise(uv * 1.5 + uTime * 0.15);
    d += noise * 0.04 * uScale;

    // 5. Coloring & Surface Tension
    // Smoothstep for slightly softer edge (surface tension look)
    float alpha = smoothstep(0.04, -0.04, d);
    
    // Internal gradient for liquid volume feel
    // High-frequency dither and wide range to eliminate banding
    float dither = snoise(uv * 200.0) * 0.025;
    float shadow = smoothstep(-0.8 * uScale, 0.6 * uScale, d + dither);
    
    // Mix between highlight and deeper core while keeping base color integrity
    vec3 highlight = uColor * 1.1;
    vec3 core = uColor * 0.8;
    vec3 finalColor = mix(highlight, core, shadow);
    
    // Vignette/Falloff for transparency
    float opacity = alpha * 0.65 * uOpacity; 
    
    gl_FragColor = vec4(finalColor, opacity);
  }
`

export function ViscousPuddle() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport, size } = useThree()
  const { resolvedTheme } = useTheme()
  const isPointerInsideWindow = useRef(false)

  // Mobile check
  const isMobile = size.width < 768

  // Mouse state - initialize to center
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5))

  // Global mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      isPointerInsideWindow.current = true
      const x = e.clientX / window.innerWidth
      const y = 1.0 - e.clientY / window.innerHeight
      targetMouseRef.current.set(x, y)
    }

    const handleMouseLeave = () => {
      isPointerInsideWindow.current = false
    }

    const handleMouseEnter = () => {
      isPointerInsideWindow.current = true
    }

    // Only add listeners if NOT mobile
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('mouseenter', handleMouseEnter)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isMobile])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uColor: { value: new THREE.Color('#34D399') },
      uScale: { value: 1.0 },
      uOpacity: { value: 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const lerpScroll = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return

    // 1. Robust Time Update
    materialRef.current.uniforms.uTime.value += Math.min(delta, 0.05)

    // Fade in opacity
    materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpacity.value,
      1.0,
      0.1
    )

    // 2. Parallax Effect
    const rawScroll = typeof window !== 'undefined' ? window.scrollY : 0
    // Clamp the scroll value used for parallax to prevent extreme transformations
    const currentScroll = Math.min(rawScroll, size.height * 1.5)

    // Faster lerp to prevent the "waiting" feel when returning from far away
    lerpScroll.current = THREE.MathUtils.lerp(lerpScroll.current, currentScroll, 0.15)

    // Snap if very close to avoid micro-updates and lag feel
    if (Math.abs(lerpScroll.current - currentScroll) < 0.1) {
      lerpScroll.current = currentScroll
    }

    // Cinematic Parallax: Stronger vertical shift + subtle horizontal drift
    // Stronger Z displacement (vertical on screen)
    meshRef.current.position.z = lerpScroll.current * 0.0045
    // meshRef.current.position.x = Math.sin(lerpScroll.current * 0.001) * 0.5

    // Scale up slightly as we scroll down to feel like it's coming closer/expanding
    const scrollScale = 1.0 + lerpScroll.current * 0.0015
    meshRef.current.scale.set(viewport.width * scrollScale, viewport.height * scrollScale, 1)

    // Stronger vertical tilt
    meshRef.current.rotation.x = -Math.PI / 2 + lerpScroll.current * 0.0005

    // 3. Sync resolution & Scale
    if (
      materialRef.current.uniforms.uResolution.value.x !== size.width ||
      materialRef.current.uniforms.uResolution.value.y !== size.height
    ) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }

    const targetScale = isMobile ? 0.6 : 1.0
    materialRef.current.uniforms.uScale.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uScale.value,
      targetScale,
      0.1
    )

    // 4. Color / Theme Update
    // Light Theme: Perfect Vibrant brand emerald (#34D399)
    // Dark Theme: Balanced Emerald-Teal mix (#12b893) to match #00c681 family
    const targetColor =
      resolvedTheme === 'dark' ? new THREE.Color('#12b893') : new THREE.Color('#34D399')

    materialRef.current.uniforms.uColor.value.lerp(targetColor, 0.05)

    // 5. Mouse Interaction & Merging
    const lerpFactor = isPointerInsideWindow.current ? 0.06 : 0.02

    // If mobile or pointer outside, force center
    if (isMobile || !isPointerInsideWindow.current) {
      targetMouseRef.current.set(0.5, 0.5)
    }

    mouseRef.current.lerp(targetMouseRef.current, lerpFactor)
    materialRef.current.uniforms.uMouse.value.copy(mouseRef.current)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[viewport.width, viewport.height, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  )
}
