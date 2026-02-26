'use client'

import { useRef } from 'react'

import { CaretDownIcon } from '@phosphor-icons/react'

import { PortfolioEntry } from '@/data/projects-en'
import { ANIMATION } from '@/lib/constants/animations'
import { useScrollStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import { ProjectAccordion } from './ProjectAccordion'
import { ProjectMeta } from './ProjectMeta'

interface ProjectItemProps {
  project: PortfolioEntry
  isOpen: boolean
  onToggle: () => void
  onHover: (image: string | null) => void
}

export function ProjectItem({ project, isOpen, onToggle, onHover }: ProjectItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const lenis = useScrollStore((state) => state.lenis)

  const handleClick = () => {
    const isOpening = !isOpen
    onToggle()

    if (isOpening) {
      onHover(null) // Clear preview when opening accordion

      // Wait for the accordion animation (opening & closing of others) to finish
      // before scrolling. This prevents scrolling "too far" because the layout
      // shifts significantly during the transition.
      // Animation duration is 0.6s, so we wait just slightly longer.
      setTimeout(
        () => {
          if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect()
            const isOffScreen = rect.bottom > window.innerHeight || rect.top < 100

            if (isOffScreen) {
              if (lenis) {
                lenis.scrollTo(itemRef.current, {
                  offset: -120,
                  duration: 1.2,
                  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                })
              } else {
                // Fallback
                itemRef.current.scrollIntoView({ behavior: 'smooth' })
              }
            }
          }
        },
        ANIMATION.duration.fast * 1000 + 50
      )
    } else {
      onHover(null)
    }
  }

  // Use heroImage instead of image
  const displayImage = project.heroImage

  return (
    <div
      ref={itemRef}
      className="project-item group border-border scroll-mt-24 border-b last:border-0 md:scroll-mt-32"
      onMouseEnter={() => !isOpen && onHover(displayImage)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-between py-8 text-left outline-none md:py-10"
        aria-expanded={isOpen}
        aria-controls={`project-content-${project.id}`}
        id={`project-trigger-${project.id}`}
      >
        <div className="flex flex-col gap-3">
          <span className="text-foreground font-serif text-3xl font-light transition-transform duration-500 group-hover:translate-x-4 md:text-5xl lg:text-6xl">
            {project.title}
          </span>
          <ProjectMeta
            year={project.year}
            techStack={project.techStack}
            className="transition-transform duration-500 group-hover:translate-x-6"
          />
        </div>

        <div className="flex items-center gap-8">
          <CaretDownIcon
            weight="light"
            className={cn(
              'text-muted-foreground/40 size-8 transition-[color,transform] duration-500 md:size-12',
              isOpen && 'text-primary rotate-180',
              'group-hover:text-primary group-hover:scale-110'
            )}
          />
        </div>
      </button>

      <ProjectAccordion project={project} isOpen={isOpen} />
    </div>
  )
}
