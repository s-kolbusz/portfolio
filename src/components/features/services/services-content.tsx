'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon, CheckIcon, StarIcon } from '@phosphor-icons/react'

import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { FaqAccordion } from '@/components/ui/faq-accordion'
import { services } from '@/data/services'
import { useTimeline } from '@/hooks/timeline'
import { useSafeAnimation } from '@/hooks/use-safe-animation'
import { cn } from '@/lib/cn'

export function ServicesContent() {
  const t = useTranslations('services_page')
  const tServices = useTranslations('services')

  const animation = useSafeAnimation()

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  // Create refs for individual services to trigger them separately
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([])

  useTimeline(sectionRef, { id: 'services-page' }, (reveal) => {
    reveal(headerRef)
    reveal(introRef, { y: 30 })

    // Reveal each service individually as it enters the viewport
    serviceRefs.current.forEach((ref) => {
      if (ref) {
        reveal(ref, { y: 150, self: true, duration: animation.duration.medium })
        reveal(ref, {
          y: 250,
          stagger: animation.stagger.normal,
          duration: animation.duration.slow,
        })
      }
    })

    reveal(trustRef, { y: 150, self: true, duration: animation.duration.slow })
    reveal(trustRef, { y: 250, duration: animation.duration.slow })
    reveal(faqRef, { y: 150 })
  })

  const faqItems = [0, 1, 2]

  return (
    <BaseSection
      id="services-page"
      ref={sectionRef}
      className="min-h-0 pt-32 pb-24 xl:pt-40 xl:pb-32"
      containerClassName="gap-24 md:gap-32"
    >
      {/* Hero Section */}
      <div className="flex flex-col gap-12">
        <EditorialHeader
          ref={headerRef}
          title={t('h1')}
          subtitle={t('h2_niche')}
          tagline={tServices('limited_availability')}
        />
        <div ref={introRef} className="max-w-3xl">
          <p className="text-muted-foreground font-sans text-xl leading-relaxed">
            {tServices('intro')}
          </p>
        </div>
      </div>

      {/* Services List - Vertical bespoke layout */}
      <div className="flex flex-col gap-8 md:gap-16">
        <div className="border-border border-b pb-6">
          <h2 className="font-serif text-3xl font-light md:text-4xl">{t('h2_offer')}</h2>
        </div>

        <div ref={servicesRef} className="mt-8 flex flex-col gap-24 xl:gap-32">
          {services.map((service, index) => {
            const isPopular = service.popular
            const isEven = index % 2 !== 0

            return (
              <div
                key={service.id}
                ref={(el) => {
                  serviceRefs.current[index] = el
                }}
                className={cn(
                  'group relative grid grid-cols-1 items-start gap-12 xl:grid-cols-12 xl:gap-24',
                  isPopular ? 'border-primary/20 bg-primary/5 rounded-3xl border p-8 xl:p-16' : ''
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="bg-primary text-primary-foreground absolute -top-4 left-8 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-md xl:left-16">
                    <StarIcon weight="fill" className="size-3" />
                    {tServices('popular_badge')}
                  </div>
                )}

                {/* Text Content Column */}
                <div
                  className={cn(
                    'flex flex-col gap-8 xl:col-span-6',
                    isEven ? 'xl:order-2' : 'xl:order-1'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/30 h-px w-8" />
                    <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                      {tServices(`${service.id}.label`)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-foreground font-serif text-3xl leading-tight font-light md:text-5xl">
                      {tServices(`${service.id}.title`)}
                    </h3>
                    <p className="text-muted-foreground font-sans text-xl leading-relaxed md:text-xl">
                      {tServices(`${service.id}.description`)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <span className="text-primary font-serif text-4xl font-medium md:text-5xl">
                      {tServices(`${service.id}.price`)}
                    </span>
                    <span className="text-muted-foreground border-primary/20 border-l-2 pl-3 font-mono text-[10px] font-medium tracking-wider uppercase">
                      {tServices(`${service.id}.unit`)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Button href="/#contact" variant={isPopular ? 'primary' : 'outline'} size="lg">
                      <span className="font-mono text-[12px] font-bold tracking-widest uppercase">
                        {tServices(`${service.id}.cta`)}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Features & Ideal For Column */}
                <div
                  className={cn(
                    'flex h-full flex-col justify-center gap-12 xl:col-span-6',
                    isEven ? 'xl:order-1' : 'xl:order-2'
                  )}
                >
                  {/* Ideal For Block */}
                  <div className="bg-muted/30 border-border flex flex-col gap-4 rounded-2xl border p-8">
                    <h4 className="text-foreground font-serif text-xl font-medium">
                      {t('ideal_for_label')}
                    </h4>
                    <p className="text-muted-foreground font-sans text-base leading-relaxed">
                      {tServices(`${service.id}.ideal_for`)}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="flex flex-col gap-6">
                    <ul className="flex flex-col gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div
                            className={cn(
                              'mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border',
                              isPopular
                                ? 'border-primary/30 bg-primary/10'
                                : 'border-border bg-muted/50'
                            )}
                          >
                            <CheckIcon
                              className={cn(
                                'size-3',
                                isPopular ? 'text-primary' : 'text-muted-foreground'
                              )}
                              weight="bold"
                            />
                          </div>
                          <span className="text-foreground font-sans text-xl leading-snug">
                            {tServices(`${service.id}.features.${i}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trust Section */}
      <div
        ref={trustRef}
        className="border-border bg-muted/20 relative overflow-hidden border p-10 md:p-16 xl:p-24"
      >
        {/* Subtle background decoration */}
        <div className="bg-primary/5 absolute -top-24 -right-24 size-96 rounded-full blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/50 h-px w-8" />
            <span className="text-primary font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
              Expertise
            </span>
            <div className="bg-primary/50 h-px w-8" />
          </div>

          <h2 className="font-serif text-3xl font-light md:text-5xl xl:leading-tight">
            {t('h2_trust')}
          </h2>
          <p className="text-muted-foreground font-sans text-xl leading-relaxed md:text-xl">
            {t('trust_content')}
          </p>
          <Button
            href="/#contact"
            variant="primary"
            size="lg"
            className="mt-4"
            rightIcon={<ArrowRightIcon className="size-4" weight="bold" />}
          >
            {tServices('cta')}
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div ref={faqRef} className="flex flex-col gap-8 md:gap-12">
        <h2 className="font-serif text-3xl font-light md:text-4xl">{t('h2_faq')}</h2>
        <div className="divide-border mx-auto flex w-full max-w-4xl flex-col divide-y">
          {faqItems.map((i) => (
            <FaqAccordion key={i} question={t(`faq.${i}.question`)} answer={t(`faq.${i}.answer`)} />
          ))}
        </div>
      </div>
    </BaseSection>
  )
}
