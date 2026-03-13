'use client'

import { useRef } from 'react'

import { CaretDownIcon } from '@phosphor-icons/react'

import type { PortfolioEntry } from '@/data/projects'
import { cn } from '@/lib/cn'
import { useScrollStore } from '@/lib/stores'

import { ProjectAccordion } from './project-accordion'
import { isItemOutsideViewport } from './project-item/scroll'
import { ProjectMeta } from './project-meta'

interface ProjectItemProps {
  project: PortfolioEntry
  isOpen: boolean
  onToggle: () => void
  onHover: (image: string | null) => void
}

export function ProjectItem({ project, isOpen, onToggle, onHover }: ProjectItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const shouldScrollAfterOpenRef = useRef(false)
  const lenis = useScrollStore((state) => state.lenis)

  const scrollToItemIfNeeded = () => {
    if (!itemRef.current) return

    const bounds = itemRef.current.getBoundingClientRect()
    const isOffScreen = isItemOutsideViewport(bounds, window.innerHeight, 100)

    if (!isOffScreen) return

    if (lenis) {
      lenis.scrollTo(itemRef.current, {
        offset: -120,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      return
    }

    itemRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAccordionAnimationComplete = () => {
    if (!shouldScrollAfterOpenRef.current) return

    shouldScrollAfterOpenRef.current = false
    scrollToItemIfNeeded()
  }

  const handleClick = () => {
    const isOpening = !isOpen
    shouldScrollAfterOpenRef.current = isOpening

    onToggle()
    onHover(null)
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
        className="flex w-full items-center justify-between py-8 text-left outline-none *:pointer-events-none md:py-10"
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

      <ProjectAccordion
        project={project}
        isOpen={isOpen}
        onAnimationComplete={handleAccordionAnimationComplete}
      />
    </div>
  )
}
