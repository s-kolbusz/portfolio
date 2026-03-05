'use client'

import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowLeftIcon, ArrowSquareOutIcon } from '@phosphor-icons/react'

import type { PortfolioEntry } from '@/features/work/data/projects-en'
import { useRouter } from '@/i18n/navigation'
import { ANIMATION } from '@/shared/config/animations'
import { useTimeline } from '@/shared/hooks/timeline/useTimeline'
import { Button } from '@/shared/ui/Button'

import { Lightbox } from './Lightbox'
import { ProjectNav } from './ProjectNav'

interface ProjectCaseStudyProps {
  project: PortfolioEntry
  prevProject?: PortfolioEntry
  nextProject?: PortfolioEntry
}

export function ProjectCaseStudy({ project, prevProject, nextProject }: ProjectCaseStudyProps) {
  const t = useTranslations('projectsBook')
  const cs = useTranslations('projectsBook.caseStudy')
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLElement>(null)
  const galleryRef = useRef<HTMLElement>(null)
  const secondQuoteRef = useRef<HTMLElement>(null)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const caseStudySections = [
    { key: 'problemTitle', content: project.problem },
    { key: 'approachTitle', content: project.approach },
    { key: 'solutionTitle', content: project.solution },
    { key: 'resultsTitle', content: project.results },
  ].filter((s) => s.content)

  useTimeline(mainRef, { id: 'project-case-study' }, (reveal) => {
    // Hero text — animates on page load with 0.3s delay
    reveal(heroContentRef, {
      duration: ANIMATION.duration.slow,
      delay: 0.3,
    })

    // Meta row — tight after hero, visible right below it
    reveal(metaRef, {
      self: true,
      y: 20,
      start: 'top 95%',
    })

    // Pull quote
    reveal(quoteRef, { self: true, y: 30 })

    // Case study sections
    caseStudySections.forEach((section, i) => {
      reveal(`[data-case-study-section-index="${i}"]`, {
        self: true,
        y: 0,
        x: -50,
      })
    })

    // Gallery items
    reveal(galleryRef, {
      self: true,
      y: 20,
    })
    // Second quote
    reveal(secondQuoteRef, { self: true, y: 30 })
  })

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <article ref={mainRef} className="min-h-screen">
      {/* Fixed back button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline-glass"
          size="md"
          onClick={() => router.back()}
          leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
        >
          {t('backLabel')}
        </Button>
      </div>

      {/* ---- Hero ---- */}
      <header className="relative flex h-[70vh] items-end overflow-hidden sm:h-[80vh]">
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Hero content */}
        <div
          ref={heroContentRef}
          className="relative z-10 w-full px-6 pb-10 sm:px-12 lg:px-20 lg:pb-16"
        >
          {/* Category + year */}
          <div className="mb-3 flex items-center gap-3 font-mono text-xs tracking-widest text-white/60 uppercase">
            <span>{t(`categories.${project.category}`)}</span>
            <span className="opacity-40">·</span>
            <span>{project.year}</span>
          </div>

          <h1 className="font-serif text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-7xl">
            {project.title}
          </h1>

          <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
            {project.subtitle}
          </p>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-white/50 uppercase transition-colors hover:text-white"
            >
              {t('visitSiteLabel')}
              <ArrowSquareOutIcon weight="duotone" className="size-4" />
            </a>
          )}
        </div>
      </header>

      {/* ---- Meta row ---- */}
      <section ref={metaRef} className="border-border border-b px-6 py-8 sm:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {project.client && (
            <div>
              <span className="text-muted-foreground block font-mono text-[11px] tracking-widest uppercase">
                {cs('clientLabel')}
              </span>
              <span className="mt-1 block text-sm">{project.client}</span>
            </div>
          )}
          {project.role && (
            <div>
              <span className="text-muted-foreground block font-mono text-[11px] tracking-widest uppercase">
                {cs('roleLabel')}
              </span>
              <span className="mt-1 block text-sm">{project.role}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block font-mono text-[11px] tracking-widest uppercase">
              {cs('techLabel')}
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="border-border text-muted-foreground rounded-sm border px-2 py-0.5 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Tagline / Pull quote ---- */}
      {project.pullQuotes?.[0] && (
        <section ref={quoteRef} className="px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <blockquote className="border-primary/40 text-muted-foreground mx-auto max-w-3xl border-l-2 pl-6 font-serif text-xl leading-relaxed italic sm:text-2xl lg:text-3xl">
            &ldquo;{project.pullQuotes[0]}&rdquo;
          </blockquote>
        </section>
      )}

      {/* ---- Case study sections ---- */}
      {caseStudySections.map((section, i) => (
        <section
          data-case-study-section
          data-case-study-section-index={i}
          key={section.key}
          className={`px-6 py-12 sm:px-12 sm:py-16 lg:px-20 ${
            i % 2 === 0 ? 'bg-secondary/20' : ''
          }`}
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-primary font-mono text-xs tracking-widest uppercase">
              {cs(
                section.key as 'problemTitle' | 'approachTitle' | 'solutionTitle' | 'resultsTitle'
              )}
            </h2>
            <p className="text-foreground/80 mt-4 text-base leading-relaxed sm:text-lg">
              {section.content}
            </p>
          </div>
        </section>
      ))}

      {/* ---- Gallery ---- */}
      {project.gallery.length > 0 && (
        <section ref={galleryRef} className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-muted-foreground mb-8 font-mono text-xs tracking-widest uppercase">
              {cs('galleryTitle')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.gallery.map((item, index) => (
                <button
                  type="button"
                  key={item.url}
                  onClick={() => openLightbox(index)}
                  aria-label={cs('viewImageLabel', { alt: item.alt })}
                  className="group bg-secondary focus:ring-primary relative aspect-video cursor-zoom-in overflow-hidden focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 512px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Second pull quote ---- */}
      {project.pullQuotes?.[1] && (
        <section
          ref={secondQuoteRef}
          className="border-border border-t px-6 py-16 sm:px-12 sm:py-20 lg:px-20"
        >
          <blockquote className="border-primary/40 text-muted-foreground mx-auto max-w-3xl border-l-2 pl-6 font-serif text-lg leading-relaxed italic sm:text-xl">
            &ldquo;{project.pullQuotes[1]}&rdquo;
          </blockquote>
        </section>
      )}

      {/* ---- Project navigation ---- */}
      <ProjectNav prevProject={prevProject} nextProject={nextProject} />

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={project.gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </article>
  )
}
