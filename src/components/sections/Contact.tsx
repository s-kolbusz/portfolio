'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import { ArrowUpRightIcon } from '@phosphor-icons/react'

import { contactLinks } from '@/data/contact'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

export function Contact() {
  const t = useTranslations('contact')
  const tf = useTranslations('footer')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

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

      // 2. Links Reveal
      if (linksRef.current) {
        gsap.fromTo(
          linksRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION.duration.medium,
            stagger: ANIMATION.stagger.normal,
            ease: ANIMATION.ease.out,
            scrollTrigger: {
              trigger: linksRef.current,
              start: 'top 85%',
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  const currentYear = new Date().getFullYear()

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="bg-background relative min-h-[80vh] w-full px-6 py-24 lg:px-24 lg:py-32"
    >
      <div className="container mx-auto flex h-full flex-col justify-between gap-24">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col gap-6">
          <h2 className="text-foreground font-serif text-5xl leading-[1.1] font-normal md:text-7xl lg:text-8xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-xl font-sans text-xl leading-relaxed">
            {t('tagline')}
          </p>
        </div>

        {/* Big Links */}
        <div ref={linksRef} className="flex flex-col">
          {contactLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-border hover:bg-secondary/30 border-t py-8 transition-colors md:py-12"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-serif text-3xl font-light transition-transform duration-300 group-hover:translate-x-4 md:text-5xl lg:text-6xl">
                  {t(link.labelKey)}
                </span>
                <ArrowUpRightIcon
                  weight="light"
                  className="text-muted-foreground group-hover:text-primary size-8 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:size-12"
                />
              </div>
            </a>
          ))}
          <div className="border-border border-t" />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t('location_label')}
            </span>
            <span className="font-sans text-lg">{t('city')}</span>
          </div>

          <div className="flex flex-col gap-2 md:text-right">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t('copyright_label')}
            </span>
            <span className="text-muted-foreground font-sans text-sm">
              {tf('copyright', { year: currentYear })}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
