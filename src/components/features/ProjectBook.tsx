'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { PortfolioEntry } from '@/data/projects-en'
import { useRouter } from '@/i18n/navigation'

import { BookEdgeNav } from './BookEdgeNav'
import { BookPageDots } from './BookPageDots'
import { BookSpread } from './BookSpread'
import { BookTableOfContents } from './BookTableOfContents'

interface ProjectBookProps {
  projects: PortfolioEntry[]
}

export function ProjectBook({ projects }: ProjectBookProps) {
  const t = useTranslations('projectsBook')
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalPanels = projects.length + 1 // ToC + spreads

  const isOnToC = currentIndex === 0

  // Track current panel via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const panels = container.querySelectorAll<HTMLElement>('[data-book-panel]')
    const observers: IntersectionObserver[] = []

    panels.forEach((panel, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentIndex(i)
          }
        },
        { root: container, threshold: 0.5 }
      )
      observer.observe(panel)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [projects.length])

  // Scroll to a specific panel
  const scrollToPanel = useCallback(
    (index: number) => {
      const container = scrollRef.current
      if (!container || index < 0 || index >= totalPanels) return

      container.scrollTo({
        left: index * window.innerWidth,
        behavior: 'smooth',
      })
    },
    [totalPanels]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToPanel(currentIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToPanel(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, scrollToPanel])

  // Back logic: ToC → homepage #projects, spread → scroll to ToC
  const handleBack = () => {
    if (isOnToC) {
      router.push('/#projects')
    } else {
      scrollToPanel(0)
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Project Book"
      className="book-paper relative"
    >
      {/* Back button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline-glass"
          size="md"
          onClick={handleBack}
          leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
        >
          {isOnToC ? t('backLabel') : t('backToProjects')}
        </Button>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        data-lenis-prevent
        className="flex h-dvh snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ToC panel */}
        <div data-book-panel>
          <BookTableOfContents entries={projects} onNavigate={scrollToPanel} />
        </div>

        {/* Project spreads */}
        {projects.map((project, i) => (
          <div key={project.id} data-book-panel>
            <BookSpread entry={project} index={i} />
          </div>
        ))}
      </div>

      {/* Edge navigation */}
      <BookEdgeNav
        onPrev={() => scrollToPanel(currentIndex - 1)}
        onNext={() => scrollToPanel(currentIndex + 1)}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < totalPanels - 1}
      />

      {/* Page dots */}
      <BookPageDots total={totalPanels} current={currentIndex} onSelect={scrollToPanel} />
    </div>
  )
}
