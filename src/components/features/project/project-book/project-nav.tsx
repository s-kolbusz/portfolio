'use client'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'

import type { PortfolioEntry } from '@/data/projects'
import { Link } from '@/i18n/navigation'

interface ProjectNavProps {
  prevProject?: PortfolioEntry
  nextProject?: PortfolioEntry
}

export function ProjectNav({ prevProject, nextProject }: ProjectNavProps) {
  const t = useTranslations('projectsBook.caseStudy')

  return (
    <nav className="border-border flex items-stretch border-t" aria-label="Project navigation">
      {/* Previous */}
      <div className="border-border flex flex-1 border-r">
        {prevProject ? (
          <Link
            href={`/projects/${prevProject.id}`}
            className="group hover:bg-secondary/30 flex w-full items-center gap-4 px-6 py-8 transition-colors sm:px-10 sm:py-12"
          >
            <ArrowLeftIcon
              weight="bold"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-hover:-translate-x-1"
            />
            <div className="min-w-0">
              <span className="text-muted-foreground block font-mono text-[11px] tracking-widest uppercase">
                {t('prevProjectLabel')}
              </span>
              <span className="mt-1 block truncate font-serif text-lg font-light sm:text-xl">
                {prevProject.title}
              </span>
            </div>
          </Link>
        ) : (
          <div className="w-full" />
        )}
      </div>

      {/* Next */}
      <div className="flex flex-1">
        {nextProject ? (
          <Link
            href={`/projects/${nextProject.id}`}
            className="group hover:bg-secondary/30 flex w-full items-center justify-end gap-4 px-6 py-8 text-right transition-colors sm:px-10 sm:py-12"
          >
            <div className="min-w-0">
              <span className="text-muted-foreground block font-mono text-[11px] tracking-widest uppercase">
                {t('nextProjectLabel')}
              </span>
              <span className="mt-1 block truncate font-serif text-lg font-light sm:text-xl">
                {nextProject.title}
              </span>
            </div>
            <ArrowRightIcon
              weight="bold"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-1"
            />
          </Link>
        ) : (
          <div className="w-full" />
        )}
      </div>
    </nav>
  )
}
