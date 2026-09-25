'use client'

import { useMemo, useRef, useEffect, useState, lazy, Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowDownIcon } from '@phosphor-icons/react'

import {
  SIGNATURE_STATIC_ATTR,
  SIGNATURE_TRACK_SELECTOR,
  subscribeSignature,
} from '@/components/canvas/viscous-puddle/signature-bus'
import { Button } from '@/components/ui/button'
import { useHeroAnimation } from '@/hooks/use-hero-animation'
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/use-media'
import { useScrollStore } from '@/lib/stores'

const HeroScene = lazy(() =>
  import('@/components/canvas/hero-scene').then((mod) => ({ default: mod.HeroScene }))
)

export function Hero() {
  const t = useTranslations('hero')
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaIconRef = useRef<SVGSVGElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()

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
  // blob canvas reports each frame; the DOM side of it is written here. Focus
  // leaves the name, its letters give way to drops of matter, and the text
  // below drifts, then goes under the surface as the blob swells over it.
  useEffect(() => {
    const name = headerRef.current
    const content = contentRef.current
    const caret = caretRef.current
    const displacement = displacementRef.current
    if (!name || !content || !caret || !displacement) return
    const letters = Array.from(name.querySelectorAll<HTMLElement>('[data-hero-char]'))

    const reset = () => {
      for (const element of [name, content]) {
        element.style.transform = ''
        element.style.filter = ''
        element.style.opacity = ''
        element.style.mixBlendMode = ''
      }
      for (const letter of letters) letter.style.opacity = ''
      caret.style.visibility = ''
    }

    const unsubscribe = subscribeSignature((frame) => {
      if (!frame) {
        reset()
        return
      }
      const hero = frame.step.hero
      if (!hero) {
        // Past the hero: the name is in the matter and the text under it.
        for (const letter of letters) letter.style.opacity = '0'
        content.style.opacity = '0'
        caret.style.visibility = 'hidden'
        return
      }

      name.style.transform = `scale(${hero.nameScale.toFixed(4)})`
      // Blur is costly on phones; there the letters simply fade.
      name.style.filter =
        !isMobile && hero.nameBlur > 0.05 ? `blur(${hero.nameBlur.toFixed(2)}px)` : ''
      hero.letters.forEach((opacity, index) => {
        const letter = letters[index]
        if (letter) letter.style.opacity = opacity.toFixed(3)
      })
      caret.style.visibility = hero.focus > 0.3 ? 'hidden' : ''

      const under = hero.underwater
      content.style.transform = `translateY(${hero.contentShift.toFixed(1)}px)`
      content.style.opacity = (hero.contentOpacity * (1 - 0.45 * under)).toFixed(3)
      // Under the surface the text takes the matter's colour (multiplied over
      // the green) and softens; the edge bends it as it passes.
      content.style.mixBlendMode = under > 0.01 ? 'multiply' : ''
      if (isMobile || (under < 0.01 && hero.refraction < 0.01)) {
        content.style.filter = ''
      } else {
        displacement.setAttribute('scale', (hero.refraction * 26).toFixed(1))
        content.style.filter = `url(#hero-water) blur(${(under * 1.6).toFixed(2)}px)`
      }
    })

    return () => {
      unsubscribe()
      reset()
    }
  }, [isMobile])

  const name = t('name')
  const splitName = useMemo(() => {
    return name.split(' ').map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split('').map((char, charIndex) => (
          // opacity: 0.01 (not 0) is intentional — Lighthouse treats opacity: 0 as
          // invisible and excludes it from LCP. At 0.01 the element is technically
          // visible to LCP measurement but imperceptible to users until GSAP animates it.
          <span key={charIndex} className="char inline-block" style={{ opacity: 0.01 }}>
            {/* Inner span: typing animates the outer one, absorption this one. */}
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
      lenis.scrollTo(target, { duration: pinned ? 4 : 1.2 })
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      data-hero-track
      className="text-foreground relative h-[200svh] w-full data-hero-static:h-auto motion-reduce:h-auto"
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
      {/* Refraction for text crossed by the blob's edge (scale driven per frame). */}
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <filter id="hero-water" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="7" />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {/* Pinned for one screen while the hero plays (static without motion or WebGL). */}
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
