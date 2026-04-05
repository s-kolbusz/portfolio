'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon } from '@phosphor-icons/react'

import { CalculatorPanel } from '@/components/features/calculator/calculator-panel'
import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { useTimeline } from '@/hooks/timeline'
import { ANIMATION } from '@/lib/constants/animations'

export const PrintCalculator = () => {
  const t = useTranslations('calculator')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useTimeline(sectionRef, { id: 'calculator' }, (reveal) => {
    reveal(headerRef)
    reveal(panelRef, {
      self: true,
      clipPath: { from: 'inset(0 50% 0 50%)', to: 'inset(0 0% 0 0%)' },
      y: 0,
      duration: ANIMATION.duration.slow,
      ease: ANIMATION.ease.inOut,
    })
    reveal(ctaRef, { self: true, stagger: ANIMATION.stagger.slow })
  })

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
      <div ref={panelRef} className="relative w-full max-w-4xl">
        {/* Corner Markers */}
        <div className="border-primary absolute -top-1 -left-1 size-4 border-t-2 border-l-2" />
        <div className="border-primary absolute -top-1 -right-1 size-4 border-t-2 border-r-2" />
        <div className="border-primary absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2" />
        <div className="border-primary absolute -right-1 -bottom-1 size-4 border-r-2 border-b-2" />

        {/* Inner Content */}
        <div className="border-border bg-background border p-6 md:p-12">
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
