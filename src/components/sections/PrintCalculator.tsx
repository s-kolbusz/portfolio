'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { CalculatorPanel } from '@/components/features/CalculatorPanel'
import { Button } from '@/components/ui/Button'
import { ANIMATION } from '@/lib/constants/animations'

gsap.registerPlugin(ScrollTrigger)

export const PrintCalculator = () => {
  const t = useTranslations('calculator')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // 1. Header Reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION.duration.medium,
            stagger: ANIMATION.stagger.normal,
            ease: ANIMATION.ease.out,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: ANIMATION.scrollTrigger.start,
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }

      // 2. Panel Reveal (Blueprint unfurl effect)
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          {
            clipPath: 'inset(0 50% 0 50%)',
            opacity: 0,
          },
          {
            clipPath: 'inset(0 0% 0 0%)',
            opacity: 1,
            duration: 1.2,
            ease: ANIMATION.ease.inOut,
            scrollTrigger: {
              trigger: panelRef.current,
              start: 'top 80%',
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="calculator"
      className="bg-secondary/20 relative w-full overflow-hidden px-6 py-24 lg:px-24 lg:py-32"
    >
      <div className="container mx-auto flex flex-col items-center gap-16">
        <div ref={headerRef} className="flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-foreground font-serif text-5xl leading-[1.1] font-normal md:text-6xl lg:text-7xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground font-sans text-lg leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Blueprint Style Container */}
        <div
          ref={panelRef}
          className="border-border bg-background relative w-full max-w-4xl border p-1"
        >
          {/* Corner Markers */}
          <div className="border-primary absolute -top-1 -left-1 size-4 border-t-2 border-l-2" />
          <div className="border-primary absolute -top-1 -right-1 size-4 border-t-2 border-r-2" />
          <div className="border-primary absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2" />
          <div className="border-primary absolute -right-1 -bottom-1 size-4 border-r-2 border-b-2" />

          {/* Inner Content */}
          <div className="bg-secondary/10 p-6 md:p-12">
            <CalculatorPanel />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            href="#contact"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRightIcon className="size-4" />}
          >
            {t('cta')}
          </Button>
          <p className="text-muted-foreground font-mono text-xs opacity-60">{t('disclaimer')}</p>
        </div>
      </div>
    </section>
  )
}
