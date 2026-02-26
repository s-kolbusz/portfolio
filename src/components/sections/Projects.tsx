'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon } from '@phosphor-icons/react'

import { ProjectList } from '@/components/features/ProjectList'
import { BaseSection } from '@/components/ui/BaseSection'
import { Button } from '@/components/ui/Button'
import { EditorialHeader } from '@/components/ui/EditorialHeader'
import { getFeaturedProjects } from '@/data/get-projects'
import { useTimeline } from '@/hooks/useTimeline'
import { Locale } from '@/i18n/routing'

interface ProjectsProps {
  locale: string
}

export function Projects({ locale }: ProjectsProps) {
  const t = useTranslations('projects')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const projects = getFeaturedProjects(locale as Locale)

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
          href="/projects"
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
