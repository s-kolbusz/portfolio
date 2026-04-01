'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon, CheckIcon, StarIcon } from '@phosphor-icons/react'

import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { services } from '@/data/services'
import { useTimeline } from '@/hooks/timeline'
import { ANIMATION } from '@/lib/constants/animations'

export function Services() {
  const t = useTranslations('services')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const primaryServiceRef = useRef<HTMLElement>(null)
  const secondaryServicesRef = useRef<(HTMLElement | null)[]>([])
  const viewAllServicesRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)
  const processStepsRef = useRef<HTMLDivElement>(null)
  const featuredService = services.find((service) => service.popular) ?? services[0]
  const secondaryServices = services.filter((service) => service.id !== featuredService.id)
  const featuredSplitLayout = 'lg:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)]'

  useTimeline(sectionRef, { id: 'services' }, (reveal) => {
    reveal(headerRef)
    reveal(primaryServiceRef, { y: 0, x: -100, self: true, duration: ANIMATION.duration.medium })

    secondaryServicesRef.current.forEach((ref) => {
      if (!ref) return
      reveal(ref, {
        y: 0,
        x: 100,
        self: true,
        duration: ANIMATION.duration.medium,
      })
    })

    reveal(viewAllServicesRef, { self: true, y: 100, delay: ANIMATION.delay.short })
    reveal(processRef, { self: true, delay: ANIMATION.delay.medium })
    reveal(processRef, { stagger: ANIMATION.stagger.slow })
    reveal(processStepsRef, { stagger: ANIMATION.stagger.slow })
  })

  return (
    <BaseSection id="services" ref={sectionRef} containerClassName="gap-12 md:gap-18">
      {/* Header */}
      <EditorialHeader
        ref={headerRef}
        title={t('title')}
        subtitle={t('intro')}
        tagline={t('limited_availability')}
      />

      <div className="grid grid-cols-1 gap-6 overflow-x-clip xl:grid-cols-12 xl:gap-8">
        <article
          ref={primaryServiceRef}
          className="border-border bg-card/60 relative overflow-hidden border px-8 py-10 md:px-10 md:py-12 xl:col-span-7"
        >
          <div className="bg-primary/8 pointer-events-none absolute -top-16 -right-20 size-72 rounded-full blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="flex flex-col gap-10">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/30 h-px w-8" />
                  <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                    {t(`${featuredService.id}.label`)}
                  </span>
                </div>
                <div className="border-primary/20 bg-accent text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                  <StarIcon weight="fill" className="size-3" />
                  {t('popular_badge')}
                </div>
              </div>

              <div className={`grid gap-10 lg:gap-8 ${featuredSplitLayout} lg:items-start`}>
                <div className="flex min-w-0 flex-col gap-5">
                  <h3 className="text-foreground max-w-3xl font-serif text-3xl leading-tight font-light text-balance md:text-5xl">
                    {t(`${featuredService.id}.title`)}
                  </h3>
                  <p className="text-muted-foreground max-w-2xl font-sans text-base leading-relaxed md:text-lg">
                    {t(`${featuredService.id}.description`)}
                  </p>
                </div>

                <div className="border-primary/20 flex min-w-0 flex-col gap-3 border-t pt-5 lg:h-full lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  <span className="text-primary font-serif text-4xl font-medium text-balance md:text-5xl">
                    {t(`${featuredService.id}.price`)}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px] leading-relaxed font-medium tracking-wider uppercase">
                    {t(`${featuredService.id}.unit`)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-border/70 border-t pt-8">
              <div className={`grid gap-8 lg:gap-8 ${featuredSplitLayout} lg:items-end`}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="text-primary mt-1 size-3 shrink-0" weight="bold" />
                      <span className="text-muted-foreground font-sans text-sm leading-relaxed md:text-base">
                        {t(`${featuredService.id}.features.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="lg:border-border/70 flex flex-col gap-5 lg:h-full lg:border-l lg:pl-8">
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed md:text-base">
                    {t(`${featuredService.id}.ideal_for`)}
                  </p>
                  <Button
                    href="#contact"
                    variant="primary"
                    size="sm"
                    className="w-full justify-between sm:w-auto"
                    rightIcon={<ArrowRightIcon className="size-3.5" weight="bold" />}
                  >
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                      {t(`${featuredService.id}.cta`)}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="flex flex-col gap-4 overflow-x-clip xl:col-span-5">
          {secondaryServices.map((service, index) => (
            <article
              ref={(el) => {
                secondaryServicesRef.current[index] = el
              }}
              key={service.id}
              className="border-border bg-card/45 hover:border-primary/30 hover:bg-card/70 relative flex flex-col gap-6 border px-7 py-8 transition-[border-color,background-color] duration-300"
            >
              <div className="bg-primary/15 absolute inset-y-0 left-0 w-px" />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/25 h-px w-6" />
                    <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
                      {t(`${service.id}.label`)}
                    </span>
                  </div>
                  <h3 className="text-foreground font-serif text-2xl leading-tight font-light text-balance md:text-[2rem]">
                    {t(`${service.id}.title`)}
                  </h3>
                </div>

                <div className="flex flex-col gap-1 sm:shrink-0 sm:items-end sm:text-right">
                  <span className="text-primary font-serif text-3xl font-medium text-balance">
                    {t(`${service.id}.price`)}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px] leading-relaxed tracking-wider uppercase">
                    {t(`${service.id}.unit`)}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground max-w-xl font-sans text-sm leading-relaxed md:text-base">
                {t(`${service.id}.ideal_for`)}
              </p>

              <div className="border-border/60 flex flex-col items-start gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-foreground/80 font-mono text-[10px] leading-relaxed tracking-[0.16em] uppercase">
                  {t(`${service.id}.features.0`)}
                </span>
                <Button
                  href="#contact"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] sm:self-auto"
                  rightIcon={<ArrowRightIcon className="size-3.5" weight="bold" />}
                >
                  <span className="font-mono font-bold tracking-widest uppercase">
                    {t(`${service.id}.cta`)}
                  </span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* View All Services CTA */}
      <div ref={viewAllServicesRef} className="flex justify-center">
        <Button
          href="/services"
          variant="outline"
          size="lg"
          rightIcon={<ArrowRightIcon className="size-4" />}
          className="border-primary/20 hover:border-primary px-8"
        >
          {t('view_details_cta')}
        </Button>
      </div>

      {/* Process / Workflow Section */}
      <div ref={processRef} className="mb-12 flex flex-col gap-4">
        <div className="border-border border-t pt-12">
          <h3 className="font-serif text-3xl font-light md:text-4xl">{t('process.title')}</h3>
          <p className="text-muted-foreground max-w-xl font-sans text-lg">{t('process.intro')}</p>
        </div>

        <div ref={processStepsRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <span className="text-primary/20 font-mono text-4xl font-bold">0{i + 1}</span>
              <h4 className="font-serif text-xl font-medium">{t(`process.steps.${i}.title`)}</h4>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                {t(`process.steps.${i}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BaseSection>
  )
}
