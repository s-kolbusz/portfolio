'use client'

import { useMemo, useRef, useEffect, useState, lazy, Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowDownIcon } from '@phosphor-icons/react'

import { smoothstep } from '@/components/canvas/viscous-puddle/choreography'
import {
  HERO_CHAR_SELECTOR,
  HERO_STAGE_SELECTOR,
  SIGNATURE_STATIC_ATTR,
  SIGNATURE_TRACK_SELECTOR,
  subscribeSignature,
} from '@/components/canvas/viscous-puddle/signature-bus'
import { Button } from '@/components/ui/button'
import { useHeroAnimation } from '@/hooks/use-hero-animation'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useScrollStore } from '@/lib/stores'

const HeroScene = lazy(() =>
  import('@/components/canvas/hero-scene').then((mod) => ({ default: mod.HeroScene }))
)

/** Layout offset of an element within an ancestor (ignores transforms). */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let left = 0
  let top = 0
  let current: HTMLElement | null = element
  while (current && current !== ancestor) {
    left += current.offsetLeft
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return { left, top }
}

export function Hero() {
  const t = useTranslations('hero')
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaIconRef = useRef<SVGSVGElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Delay the loading of the heavy 3D scene to free up main thread during hydration
  const [showScene, setShowScene] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      setShowScene(true)
    }, 900)
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  useHeroAnimation({
    containerRef,
    caretRef,
    ctaRef,
    ctaIconRef,
    prefersReducedMotion,
  })

  // The hero scroll (docs/design/2026-09-25-scroll-hero-scenariusz.md): the
  // blob canvas reports each frame and the DOM side is written here. The
  // name stays real text throughout, as crisp as the rest of the page at any
  // zoom: each letter turns from ink to the blob's green, the cursor ball
  // pulls the green towards it, and the camera's fly-in is a CSS transform.
  useEffect(() => {
    const name = headerRef.current
    const content = contentRef.current
    const caret = caretRef.current
    const stage = name?.closest<HTMLElement>(HERO_STAGE_SELECTOR)
    if (!name || !content || !caret || !stage) return
    const chars = Array.from(name.querySelectorAll<HTMLElement>(HERO_CHAR_SELECTOR))

    // Layout positions (stage px) are unaffected by transforms, so they can
    // be read at any time; refreshed when the layout changes.
    let nameRest = { left: 0, top: 0 }
    let charRest: Array<{ left: number; top: number; width: number; height: number }> = []
    const measure = () => {
      nameRest = offsetWithin(name, stage)
      charRest = chars.map((char) => ({
        ...offsetWithin(char, stage),
        width: char.offsetWidth,
        height: char.offsetHeight,
      }))
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage)

    const clearLetters = () => {
      for (const char of chars) {
        char.style.color = ''
        char.style.backgroundImage = ''
        char.style.backgroundClip = ''
        char.style.webkitBackgroundClip = ''
      }
    }
    const reset = () => {
      name.style.opacity = ''
      name.style.transform = ''
      name.style.transformOrigin = ''
      content.style.opacity = ''
      caret.style.visibility = ''
      clearLetters()
    }

    const unsubscribe = subscribeSignature((frame) => {
      if (!frame) {
        reset()
        return
      }
      const { hero, name: soaking } = frame.step
      // Past the hero the stroke that filled the frame is the water sheet.
      name.style.opacity = hero ? '' : '0'
      content.style.opacity = hero ? hero.contentOpacity.toFixed(3) : '0'
      caret.style.visibility = hero && hero.progress < 0.04 ? '' : 'hidden'
      if (!hero || !soaking) return

      const { originX, originY, shiftX, shiftY, zoom, soak, letters } = soaking
      name.style.transformOrigin = `${(originX - nameRest.left).toFixed(2)}px ${(originY - nameRest.top).toFixed(2)}px`
      name.style.transform =
        zoom === 1 && shiftX === 0 && shiftY === 0
          ? ''
          : `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px) scale(${zoom.toFixed(5)})`

      const started = smoothstep(0, 0.06, Math.min(soak, 1))
      if (started === 0) {
        clearLetters()
        return
      }

      // The ball in stage px, and in the name's own (unzoomed) space.
      const stageTop = stage.getBoundingClientRect().top
      const ballX = frame.ball.x
      const ballY = frame.ball.y - stageTop
      const localX = originX + (ballX - shiftX - originX) / zoom
      const localY = originY + (ballY - shiftY - originY) / zoom
      const reach = frame.ball.radius * 2.2
      const [r, g, b] = frame.startColour
      const green = `rgb(${r * 255} ${g * 255} ${b * 255})`
      const glow = (a: number) =>
        `rgb(${Math.min(255, r * 293 + 8)} ${Math.min(255, g * 293 + 8)} ${Math.min(255, b * 293 + 8)} / ${a.toFixed(3)})`

      chars.forEach((char, index) => {
        const rest = charRest[index]
        if (!rest) return
        // The ball is a second source of water: letters near it drink ahead
        // of the scroll…
        const centreX = originX + shiftX + (rest.left + rest.width / 2 - originX) * zoom
        const centreY = originY + shiftY + (rest.top + rest.height / 2 - originY) * zoom
        const near = smoothstep(
          reach,
          frame.ball.radius * 0.2,
          Math.hypot(ballX - centreX, ballY - centreY)
        )
        const wet = Math.min(1, (letters[index] ?? 0) + near * 0.45 * started)
        const colour = `color-mix(in srgb, ${green} ${(wet * 100).toFixed(1)}%, var(--foreground))`
        // …and the green in them gathers towards it, denser and brighter.
        const radius = (reach / zoom).toFixed(1)
        const x = (localX - rest.left).toFixed(1)
        const y = (localY - rest.top).toFixed(1)
        char.style.backgroundImage = `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${glow(0.55 * started * wet)}, transparent), linear-gradient(${colour}, ${colour})`
        char.style.backgroundClip = 'text'
        char.style.webkitBackgroundClip = 'text'
        char.style.color = 'transparent'
      })
    })

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      reset()
    }
  }, [])

  const name = t('name')
  const splitName = useMemo(() => {
    return name.split(' ').map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split('').map((char, charIndex) => (
          // opacity: 0.01 (not 0) is intentional — Lighthouse treats opacity: 0 as
          // invisible and excludes it from LCP. At 0.01 the element is technically
          // visible to LCP measurement but imperceptible to users until GSAP animates it.
          <span key={charIndex} className="char inline-block" style={{ opacity: 0.01 }}>
            {/* Inner span: typing animates the outer one; the soak colours this one. */}
            <span data-hero-char className="inline-block">
              {char}
            </span>
          </span>
        ))}
        {wordIndex < name.split(' ').length - 1 && (
          <span className="char inline-block whitespace-pre" style={{ opacity: 0.01 }}>
            {' '}
          </span>
        )}
      </span>
    ))
  }, [name])

  const handleCtaClick = () => {
    // Land where the signature scene has finished forming, so the whole
    // sequence (hero and transformation) plays on the way like a film.
    // Without the pin, just go to the scene.
    const pinned =
      !prefersReducedMotion &&
      !document.querySelector(`${SIGNATURE_TRACK_SELECTOR}[${SIGNATURE_STATIC_ATTR}]`)
    const target = pinned ? '#work-formed' : '#work'
    const lenis = useScrollStore.getState().lenis
    if (lenis) {
      lenis.scrollTo(target, { duration: pinned ? 5 : 1.2 })
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      data-hero-track
      className="text-foreground relative h-[300svh] w-full data-hero-static:h-auto motion-reduce:h-auto"
    >
      <noscript>
        <style>{`
          .char, .hero-cta { opacity: 1 !important; }
        `}</style>
      </noscript>
      {/* Blob: fixed canvas behind the page, carried into the first scene on scroll */}
      {showScene && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}
      {/* Pinned for two screens while the hero plays (static without motion or WebGL). */}
      <div
        data-hero-stage
        className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-6 pt-20 in-data-hero-static:static in-data-hero-static:h-auto in-data-hero-static:min-h-screen motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-screen"
      >
        <div className="relative flex max-w-6xl flex-col items-center gap-8 text-center">
          <div ref={headerRef} data-hero-name className="relative inline-block">
            {' '}
            {/* Name with Typewriter */}
            <h1
              className="font-serif text-6xl leading-[0.9] font-semibold tracking-tight text-balance md:text-8xl lg:text-9xl"
              aria-label={name}
            >
              <span aria-hidden="true">{splitName}</span>
            </h1>
            {/* Caret */}
            <span
              ref={caretRef}
              className="bg-foreground absolute top-0 left-0 h-14 w-0.5 md:h-20 md:w-0.75 lg:h-32 lg:w-1"
              style={{ translate: '0 0.15em' }}
            />
          </div>

          <div ref={contentRef} className="flex flex-col items-center gap-8">
            {/* Role & Tagline */}
            <div className="flex max-w-3xl flex-col gap-4">
              <h2 className="font-mono text-xl font-medium md:text-3xl">{t('role')}</h2>
              <p className="text-muted-foreground font-serif text-xl italic md:text-3xl">
                {t('tagline')}
              </p>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="hero-cta opacity-0">
              <Button
                onClick={handleCtaClick}
                size="lg"
                variant="ghost"
                className="group flex flex-col gap-2 hover:bg-transparent"
              >
                <span className="font-mono text-xs tracking-widest uppercase">{t('cta')}</span>
                <ArrowDownIcon ref={ctaIconRef} className="text-accent-foreground mx-auto size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
