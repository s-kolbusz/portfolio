'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'

import { useGSAP } from '@gsap/react'
import { ArrowDownIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { useMedia } from '@/hooks/useMedia'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

const HeroScene = dynamic(() => import('@/components/canvas/HeroScene'), {
  ssr: false,
  loading: () => null,
})

export function Hero() {
  const t = useTranslations('hero')
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaIconRef = useRef<SVGSVGElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useMedia('(prefers-reduced-motion: reduce)')

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

  useRevealAnimation(roleRef, { delay: 1, scope: headerRef })
  useRevealAnimation(ctaRef, { delay: 1.5, scope: headerRef, y: 20 })

  useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>('.char')
      if (chars.length === 0) return

      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1 })
        gsap.set(caretRef.current, { opacity: 0 })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      })

      // Initial state
      gsap.set(chars, { opacity: 0 })
      gsap.set(caretRef.current, { opacity: 1 })

      // Natural typing effect for name
      const parentRect = caretRef.current?.parentElement?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      }

      chars.forEach((char, i) => {
        const delay = i === 0 ? 0.4 : 0.03 + Math.random() * 0.12
        const charRect = char.getBoundingClientRect()
        const targetX = charRect.right - parentRect.left
        const targetY = charRect.top - parentRect.top

        tl.to(
          char,
          {
            opacity: 1,
            duration: 0.01,
          },
          `+=${delay}`
        )

        tl.set(
          caretRef.current,
          {
            x: targetX,
            y: targetY,
          },
          '<'
        )
      })

      // Blinking caret effect loop
      const blinkingCaret = gsap.to(caretRef.current, {
        opacity: 0,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      })

      // Cleanup caret
      tl.add(() => {
        blinkingCaret.kill()
      })
      tl.to(caretRef.current, {
        opacity: 0,
        duration: 0.4,
        delay: ANIMATION.delay.medium,
      })

      // 4. Arrow Bounce
      if (ctaIconRef.current) {
        gsap.to(ctaIconRef.current, {
          y: 6,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        })
      }
    },
    { scope: containerRef }
  )

  const handleCtaClick = () => {
    const element = document.getElementById('about')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="bg-background text-foreground relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 pt-20"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 select-none">
        <HeroScene />
      </div>

      {/* Content */}
      <div className="relative z-10 flex max-w-6xl flex-col items-center gap-8 text-center">
        <div ref={headerRef} className="relative inline-block">
          {/* Name with Typewriter */}
          <h1 className="font-serif text-6xl leading-[0.9] font-semibold tracking-tight text-balance md:text-8xl lg:text-9xl">
            {splitName}
          </h1>
          {/* Caret */}
          <span
            ref={caretRef}
            className="bg-foreground absolute top-0 left-0 h-14 w-0.5 md:h-20 md:w-0.75 lg:h-32 lg:w-1"
            style={{ translate: '0 0.15em' }}
          />
        </div>

        {/* Role & Tagline */}
        <div ref={roleRef} className="flex max-w-3xl flex-col gap-4">
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
