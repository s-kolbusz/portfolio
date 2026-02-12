'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { useGSAP } from '@gsap/react'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import gsap from 'gsap'

import { PortfolioEntry } from '@/data/projects-en'
import { ANIMATION } from '@/lib/constants/animations'

interface ProjectAccordionProps {
  project: PortfolioEntry
  isOpen: boolean
}

export function ProjectAccordion({ project, isOpen }: ProjectAccordionProps) {
  const t = useTranslations('projects')
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (isOpen) {
      const height = contentRef.current?.offsetHeight || 0
      gsap.to(containerRef.current, {
        height,
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.out,
      })
      gsap.fromTo(
        contentRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION.duration.medium,
          stagger: ANIMATION.stagger.tight,
          delay: 0.1,
          ease: ANIMATION.ease.out,
        }
      )
    } else {
      gsap.to(containerRef.current, {
        height: 0,
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.inOut,
      })
    }
  }, [isOpen])

  // Use localized content directly from the project object
  const description = project.tagline
  const highlights = project.pullQuotes || []

  return (
    <div
      ref={containerRef}
      className="h-0 overflow-hidden"
      id={`project-content-${project.id}`}
      role="region"
      aria-labelledby={`project-trigger-${project.id}`}
    >
      <div
        ref={contentRef}
        className="grid grid-cols-1 gap-12 pt-4 pb-12 md:grid-cols-12 md:gap-24 md:pt-8 md:pb-16"
      >
        <div className="flex flex-col gap-10 md:col-span-7">
          <p className="text-foreground font-serif text-lg leading-relaxed sm:text-2xl md:text-3xl">
            &quot;{description}&quot;
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <span className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('highlights_label')}
              </span>
              <ul className="flex flex-col gap-3">
                {highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="text-muted-foreground flex items-start gap-3 font-sans"
                  >
                    <div className="bg-primary/40 mt-2.5 h-1 w-1 shrink-0 rounded-full" />
                    <span className="text-base leading-snug sm:text-lg">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-primary font-mono text-xs tracking-widest uppercase">
                  {t('stack_label')}
                </span>
                <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs sm:text-sm">
                  {project.techStack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>

              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isOpen ? 0 : -1}
                  className="group text-foreground hover:text-primary mt-auto flex w-fit items-center gap-2 font-mono text-sm font-bold tracking-widest uppercase transition-colors"
                >
                  {t('visitSite')}
                  <ArrowUpRightIcon
                    weight="bold"
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            {/* Tech Overlay matching About section */}
            <div className="absolute top-4 right-4 font-mono text-[10px] tracking-tighter text-white/80 uppercase mix-blend-difference">
              {project.id.replace(/-/g, '_')}.IMG
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
