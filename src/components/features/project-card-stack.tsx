'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowLeftIcon, ArrowUpRightIcon, StarIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { type PortfolioEntry } from '@/data/projects-en'
import { useTimeline } from '@/hooks/use-timeline'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { ANIMATION } from '@/lib/constants/animations'

import { ProjectMeta } from './project-meta'

interface ProjectCardStackProps {
  projects: PortfolioEntry[]
}

export function ProjectCardStack({ projects }: ProjectCardStackProps) {
  const t = useTranslations('projectsBook')
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useTimeline(containerRef, { id: 'project-card-stack' }, (reveal) => {
    reveal(headerRef, {
      selector: '[data-stack-header]',
      y: 30,
      duration: ANIMATION.duration.medium,
      ease: ANIMATION.ease.outStrong,
      delay: ANIMATION.delay.short,
    })
    reveal(listRef, {
      selector: '[data-stack-item]',
      y: 40,
      duration: ANIMATION.duration.medium,
      ease: ANIMATION.ease.outStrong,
      start: 'top 85%',
    })
  })

  return (
    <section ref={containerRef} className="min-h-screen px-6 pt-20 pb-12 sm:px-8">
      {/* Fixed back button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline-glass"
          size="md"
          onClick={() => router.push('/#projects')}
          leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
        >
          {t('backLabel')}
        </Button>
      </div>

      {/* Header */}
      <div ref={headerRef}>
        <div data-stack-header className="mb-10 opacity-0">
          <h1 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Project list */}
      <div ref={listRef} className="divide-border divide-y">
        {projects.map((entry) => (
          <article key={entry.id} data-stack-item className="group py-6 opacity-0 first:pt-0">
            {/* Title row */}
            <Link href={`/projects/${entry.id}`} className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-light sm:text-3xl">{entry.title}</h2>
                  {entry.type === 'role' && (
                    <StarIcon weight="duotone" className="text-primary size-4 shrink-0" />
                  )}
                </div>

                {/* Year + tech — matching homepage accordion */}
                <ProjectMeta
                  year={entry.year}
                  techStack={entry.techStack}
                  className="mt-1.5 text-[11px]"
                />
              </div>

              {/* Category */}
              <span className="border-border/60 text-muted-foreground shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                {t(`categories.${entry.category}`)}
              </span>
            </Link>

            {/* Image — compact, flush edges */}
            <div className="relative mt-4 aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={entry.heroImage}
                alt={entry.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute top-2 right-2 font-mono text-[9px] tracking-tighter text-white/60 uppercase mix-blend-difference">
                {entry.id.replace(/-/g, '_')}.IMG
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
              {entry.subtitle}
            </p>

            {/* Actions — matching accordion style */}
            <div className="mt-3 flex items-center justify-between gap-5">
              <Link
                href={`/projects/${entry.id}`}
                className="group/link text-foreground hover:text-primary flex items-center gap-1 font-mono text-xs font-bold tracking-widest uppercase transition-colors"
              >
                {t('exploreLabel')}
              </Link>

              {entry.liveUrl && (
                <a
                  href={entry.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link text-muted-foreground hover:text-primary flex items-center gap-1 font-mono text-xs tracking-widest uppercase transition-colors"
                >
                  {t('visitSiteLabel')}
                  <ArrowUpRightIcon
                    weight="bold"
                    className="size-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
