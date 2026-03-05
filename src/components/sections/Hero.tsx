'use client'

import { useMemo, useRef, useEffect, useState, lazy, Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowDownIcon } from '@phosphor-icons/react'

import { useHeroAnimation } from '@/hooks/useHeroAnimation'
import { usePrefersReducedMotion } from '@/hooks/useMedia'
import { Button } from '@/shared/ui/Button'

const HeroScene = lazy(() => import('@/components/canvas/HeroScene'))

export function Hero() {
  const t = useTranslations('hero')
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  // const roleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaIconRef = useRef<SVGSVGElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Delay the loading of the heavy 3D scene to free up main thread during hydration
  const [showScene, setShowScene] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => {
      setShowScene(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  useHeroAnimation({
    containerRef,
    caretRef,
    // roleRef,
    ctaRef,
    ctaIconRef,
    prefersReducedMotion,
  })

  const name = t('name')
  const splitName = useMemo(() => {
    return name.split(' ').map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split('').map((char, charIndex) => (
          <span key={charIndex} className="char inline-block">
            {char}
          </span>
        ))}
        {wordIndex < name.split(' ').length - 1 && (
          <span className="char inline-block whitespace-pre"> </span>
        )}
      </span>
    ))
  }, [name])

  const handleCtaClick = () => {
    const element = document.getElementById('about')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  // Delay the loading of the heavy 3D scene to free up main thread during hydration
  // (State and effect initialized at top of component)

  return (
    <section
      id="hero"
      ref={containerRef}
      className="bg-background text-foreground relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 pt-20"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 select-none">
        {showScene && (
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex max-w-6xl flex-col items-center gap-8 text-center">
        <div ref={headerRef} className="relative inline-block">
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

        {/* Role & Tagline */}
        {/* <div ref={roleRef} className="flex max-w-3xl flex-col gap-4"> */}
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 className="font-mono text-xl font-medium md:text-3xl">{t('role')}</h2>
          <p className="text-muted-foreground font-serif text-xl italic md:text-3xl">
            {t('tagline')}
          </p>
        </div>

        {/* CTA */}
        <div ref={ctaRef}>
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
      <div className="to-background absolute right-0 bottom-0 left-0 h-32 bg-linear-to-b from-transparent" />
    </section>
  )
}
