'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { useGSAP } from '@gsap/react'
import { ArrowLeftIcon, ArrowUpRightIcon, StarIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { PortfolioEntry } from '@/data/projects-en'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

interface ProjectCardStackProps {
  projects: PortfolioEntry[]
}

export function ProjectCardStack({ projects }: ProjectCardStackProps) {
  const t = useTranslations('projectsBook')
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return

      gsap.fromTo(
        containerRef.current.querySelector('[data-stack-header]'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.duration.medium,
          ease: ANIMATION.ease.outStrong,
          delay: ANIMATION.delay.short,
        }
      )

      const items = containerRef.current.querySelectorAll('[data-stack-item]')
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION.duration.medium,
            ease: ANIMATION.ease.outStrong,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    },
    { scope: containerRef }
  )

  return (
    <main ref={containerRef} className="min-h-screen px-6 pt-20 pb-12 sm:px-8">
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
      <div data-stack-header className="mb-10 opacity-0">
        <h1 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Project list */}
      <div className="divide-border divide-y">
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
                <div className="text-muted-foreground mt-1.5 flex items-center gap-3 font-mono text-[11px] tracking-widest">
                  <span className="text-primary uppercase">{entry.year}</span>
                  <span className="opacity-30">/</span>
                  <div className="flex gap-2.5 overflow-hidden">
                    {entry.techStack.slice(0, 3).map((tech) => (
                      <span key={tech} className="shrink-0 uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
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
                sizes="(max-width: 640px) 100vw, 50vw"
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
    </main>
  )
}
