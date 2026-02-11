'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon } from '@phosphor-icons/react'

import { ProjectList } from '@/components/features/ProjectList'
import { Button } from '@/components/ui/Button'
import { getFeaturedProjects } from '@/data/get-projects'
import { Locale } from '@/i18n/routing'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

interface ProjectsProps {
  locale: string
}

export function Projects({ locale }: ProjectsProps) {
  const t = useTranslations('projects')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const projects = getFeaturedProjects(locale as Locale)

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
              // toggleActions: ANIMATION.scrollTrigger.toggleActions, // Removing toggleActions for once-only reveal
            },
          }
        )
      }

      // 2. List Reveal
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: ANIMATION.ease.out,
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              // toggleActions: ANIMATION.scrollTrigger.toggleActions,
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="bg-secondary/20 relative min-h-screen w-full px-6 py-24 lg:px-24 lg:py-32"
    >
      <div className="container mx-auto flex flex-col gap-10 lg:gap-16">
        {/* Editorial Header */}
        <div
          ref={headerRef}
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex max-w-2xl flex-col gap-6">
            <h2 className="text-foreground font-serif text-5xl leading-[1.1] font-normal md:text-6xl lg:text-7xl">
              {t('title')}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl font-sans text-lg leading-relaxed text-balance md:text-right">
            {t('intro')}
          </p>
        </div>

        {/* Case Studies List */}
        <div ref={contentRef} className="w-full">
          <ProjectList projects={projects} />
        </div>

        {/* Footer Link */}
        <div className="flex justify-center md:justify-end">
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
      </div>
    </section>
  )
}
