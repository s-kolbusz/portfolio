'use client'

import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { PortfolioEntry } from '@/data/projects-en'
import { useRouter } from '@/i18n/navigation'

import { BookEdgeNav } from './book-edge-nav'
import { BookPageDots } from './book-page-dots'
import { BookSpread } from './book-spread'
import { BookTableOfContents } from './book-table-of-contents'

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
        left: index * container.clientWidth,
        behavior: 'smooth',
      })
    },
    [totalPanels]
  )

  const handleBookKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToPanel(currentIndex + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToPanel(currentIndex - 1)
      }
    },
    [currentIndex, scrollToPanel]
  )

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
      tabIndex={0}
      className="book-paper focus-visible:ring-ring focus-visible:ring-offset-background relative focus-visible:ring-2 focus-visible:ring-offset-4"
      onKeyDown={handleBookKeyDown}
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
        className="hide-scrollbar flex h-dvh snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
      >
        {/* ToC panel */}
        <div
          data-book-panel
          id="book-panel-0"
          role="tabpanel"
          aria-labelledby="book-tab-0"
          tabIndex={currentIndex === 0 ? 0 : -1}
        >
          <BookTableOfContents entries={projects} onNavigate={scrollToPanel} />
        </div>

        {/* Project spreads */}
        {projects.map((project, i) => (
          <div
            key={project.id}
            data-book-panel
            id={`book-panel-${i + 1}`}
            role="tabpanel"
            aria-labelledby={`book-tab-${i + 1}`}
            tabIndex={currentIndex === i + 1 ? 0 : -1}
          >
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
