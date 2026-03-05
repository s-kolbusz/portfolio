'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon } from '@phosphor-icons/react'

import { ProjectList } from '@/features/work/components/ProjectList'
import { getFeaturedProjects } from '@/features/work/data/get-projects'
import { getPageHref } from '@/i18n/route-map'
import type { Locale } from '@/i18n/routing'
import { useTimeline } from '@/shared/hooks/timeline/useTimeline'
import { BaseSection } from '@/shared/ui/BaseSection'
import { Button } from '@/shared/ui/Button'
import { EditorialHeader } from '@/shared/ui/EditorialHeader'

interface ProjectsProps {
  locale: Locale
}

export function Projects({ locale }: ProjectsProps) {
  const t = useTranslations('projects')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const projects = getFeaturedProjects(locale)

  useTimeline(sectionRef, { id: 'projects' }, (reveal) => {
    reveal(headerRef)
    reveal(contentRef, { self: true, y: 30 })
    reveal(footerRef, { self: true })
  })

  return (
    <BaseSection
      id="projects"
      ref={sectionRef}
      variant="secondary"
      containerClassName="gap-10 lg:gap-16"
    >
      {/* Editorial Header */}
      <EditorialHeader ref={headerRef} title={t('title')} subtitle={t('intro')} />

      {/* Case Studies List */}
      <div ref={contentRef} className="w-full">
        <ProjectList projects={projects} />
      </div>

      {/* Footer Link */}
      <div ref={footerRef} className="flex justify-center md:justify-end">
        <Button
          href={getPageHref('work')}
          variant="ghost"
          className="group font-mono text-sm tracking-widest uppercase hover:bg-transparent"
          rightIcon={
            <ArrowRightIcon className="text-primary transition-transform duration-300 group-hover:translate-x-1" />
          }
        >
          {t('viewAll')}
        </Button>
      </div>
    </BaseSection>
  )
}
