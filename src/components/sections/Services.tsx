'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon, CheckIcon, StarIcon } from '@phosphor-icons/react'

import { services } from '@/data/services'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

export function Services() {
  const t = useTranslations('services')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const processRef = useRef<HTMLDivElement>(null)

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

      // 2. Cards Reveal
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION.duration.medium,
            stagger: ANIMATION.stagger.normal,
            ease: ANIMATION.ease.out,
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 95%',
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }

      // 3. Process Reveal
      if (processRef.current) {
        gsap.fromTo(
          processRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION.duration.medium,
            stagger: ANIMATION.stagger.normal,
            ease: ANIMATION.ease.out,
            scrollTrigger: {
              trigger: processRef.current,
              start: 'top 90%',
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  const handleServiceClick = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="services"
      ref={sectionRef}
      className="bg-background relative min-h-screen w-full px-6 py-24 lg:px-24 lg:py-32"
    >
      <div className="container mx-auto flex flex-col gap-12 md:gap-18">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex max-w-2xl flex-col gap-6">
            <h2 className="text-foreground font-serif text-5xl leading-[1.1] font-normal md:text-6xl lg:text-7xl">
              {t('title')}
            </h2>
          </div>
          <div className="flex max-w-2xl flex-col gap-4 text-left md:text-right">
            <p className="text-muted-foreground font-sans text-lg leading-relaxed text-balance">
              {t('intro')}
            </p>
            {/* Scarcity Trigger */}
            <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              {t('limited_availability')}
            </p>
          </div>
        </div>

        {/* Adjusted Grid: Show all 4 in a row on large screens */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-4"
        >
          {services.map((service) => {
            const isPopular = service.popular
            return (
              <button
                key={service.id}
                onClick={handleServiceClick}
                className={cn(
                  'group bg-card hover:shadow-primary/5 relative flex flex-col justify-between gap-10 border p-8 text-left transition-all duration-500 hover:shadow-2xl md:p-10',
                  isPopular
                    ? 'border-primary/50 shadow-primary/5 hover:border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="bg-primary text-primary-foreground absolute -top-3 left-8 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-md transition-transform group-hover:-translate-y-1">
                    <StarIcon weight="fill" className="size-3" />
                    {t('popular_badge')}
                  </div>
                )}

                {/* Content Section */}
                <div className="flex flex-col gap-8">
                  {/* 1. Label */}
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/30 h-px w-6" />
                    <span className="text-muted-foreground group-hover:text-primary font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-colors">
                      {t(`${service.id}.label`)}
                    </span>
                  </div>

                  {/* 2. Price & Pricing Type - Consistent Layout */}
                  <div className="flex flex-col gap-2">
                    <span className="text-primary font-serif text-4xl font-medium whitespace-nowrap md:text-5xl">
                      {t(`${service.id}.price`)}
                    </span>
                    <span className="text-muted-foreground border-primary/20 border-l-2 pl-3 font-mono text-[10px] font-medium tracking-wider uppercase">
                      {t(`${service.id}.unit`)}
                    </span>
                  </div>

                  {/* 3. Psychological Subtitle */}
                  <h3 className="text-foreground font-serif text-2xl leading-tight font-light md:text-3xl">
                    {t(`${service.id}.title`)}
                  </h3>

                  {/* Features List */}
                  <ul className="border-border flex flex-col gap-3 border-t pt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckIcon
                          className={cn(
                            'mt-1 size-3 shrink-0 transition-all',
                            isPopular
                              ? 'text-primary opacity-100'
                              : 'text-primary opacity-50 group-hover:opacity-100'
                          )}
                          weight="bold"
                        />
                        <span className="text-muted-foreground group-hover:text-foreground font-sans text-sm transition-colors">
                          {t(`${service.id}.features.${i}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto pt-4">
                  <div
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-4 py-3 transition-all duration-300',
                      isPopular
                        ? 'border-primary bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                        : 'border-border text-muted-foreground group-hover:border-primary group-hover:text-primary'
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                      {t(`${service.id}.cta`)}
                    </span>
                    <ArrowRightIcon
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      weight="bold"
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Process / Workflow Section */}
        <div ref={processRef} className="border-border border-t pt-12">
          <div className="mb-12 flex flex-col gap-4">
            <h3 className="font-serif text-3xl font-light md:text-4xl">{t('process.title')}</h3>
            <p className="text-muted-foreground max-w-xl font-sans text-lg">{t('process.intro')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  )
}
