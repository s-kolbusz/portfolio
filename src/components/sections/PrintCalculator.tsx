'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon } from '@phosphor-icons/react'

import { CalculatorPanel } from '@/components/features/CalculatorPanel'
import { BaseSection } from '@/components/ui/BaseSection'
import { Button } from '@/components/ui/Button'
import { EditorialHeader } from '@/components/ui/EditorialHeader'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'
import { useSafeAnimation } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

export const PrintCalculator = () => {
  const t = useTranslations('calculator')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const ANIMATION = useSafeAnimation()
  useRevealAnimation(headerRef, { scope: sectionRef })
  useRevealAnimation(ctaRef, { stagger: ANIMATION.stagger.slow, scope: sectionRef })

  useGSAP(
    () => {
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
            duration: ANIMATION.duration.slow,
            ease: 'power2.inOut',
            scrollTrigger: {
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
              trigger: panelRef.current,
              start: 'top 80%',
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  return (
    <BaseSection
      id="calculator"
      ref={sectionRef}
      variant="secondary"
      containerClassName="items-center gap-16"
    >
      <EditorialHeader
        ref={headerRef}
        title={t('title')}
        subtitle={t('description')}
        className="vertical w-full"
        subtitleClassName="md:text-center mx-auto"
      />

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

      <div ref={ctaRef} className="flex flex-col items-center gap-4">
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
    </BaseSection>
  )
}
