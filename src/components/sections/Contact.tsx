'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowUpRightIcon } from '@phosphor-icons/react'

import { BaseSection } from '@/components/ui/BaseSection'
import { EditorialHeader } from '@/components/ui/EditorialHeader'
import { contactLinks } from '@/data/contact'
import { useTimeline } from '@/hooks/timeline/useTimeline'
import { ANIMATION } from '@/lib/constants/animations'

export function Contact() {
  const t = useTranslations('contact')
  const tf = useTranslations('footer')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useTimeline(sectionRef, { id: 'contact' }, (reveal) => {
    reveal(headerRef)
    reveal(linksRef, {
      x: -60,
      y: 0,
      stagger: ANIMATION.stagger.slow,
    })
  })

  const currentYear = new Date().getFullYear()

  return (
    <BaseSection
      id="contact"
      ref={sectionRef}
      className="min-h-[80vh]"
      containerClassName="h-full justify-between gap-24"
    >
      {/* Header */}
      <EditorialHeader ref={headerRef} title={t('title')} subtitle={t('tagline')} />

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
            <div className="pointer-events-none flex items-center justify-between">
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
    </BaseSection>
  )
}
