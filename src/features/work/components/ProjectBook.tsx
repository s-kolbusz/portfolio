'use client'

import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import type { PortfolioEntry } from '@/features/work/data/projects-en'
import { useRouter } from '@/i18n/navigation'
import { getHomeSectionHref } from '@/i18n/route-map'
import { Button } from '@/shared/ui/Button'

import { BookEdgeNav } from './BookEdgeNav'
import { BookPageDots } from './BookPageDots'
import { BookSpread } from './BookSpread'
import { BookTableOfContents } from './BookTableOfContents'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  '[role="textbox"]',
].join(', ')

interface ProjectBookProps {
  projects: PortfolioEntry[]
}

export function ProjectBook({ projects }: ProjectBookProps) {
  const t = useTranslations('projectsBook')
  const router = useRouter()
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const targetIndexRef = useRef<number | null>(null)
  const tabNavigationRef = useRef(false)
  const hasInitializedPanelFocus = useRef(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalPanels = projects.length + 1 // ToC + spreads

  const isOnToC = currentIndex === 0

  const getPanel = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return null

    return container.querySelector<HTMLElement>(`#book-panel-${index}`)
  }, [])

  const getActivePanel = useCallback(() => {
    return getPanel(currentIndex)
  }, [currentIndex, getPanel])

  const getPanelFocusableElements = useCallback(
    (index: number) => {
      const panel = getPanel(index)
      if (!panel) return []

      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled') && !element.closest('[inert]')
      )
    },
    [getPanel]
  )

  const getActivePanelFocusableElements = useCallback(() => {
    return getPanelFocusableElements(currentIndex)
  }, [currentIndex, getPanelFocusableElements])

  const focusPanelEntryPoint = useCallback(
    (index: number) => {
      const panel = getPanel(index)
      if (!panel) return

      if (index === 0) {
        panel.focus({ preventScroll: true })
        return
      }

      const [firstFocusable] = getPanelFocusableElements(index)
      ;(firstFocusable ?? panel).focus({ preventScroll: true })
    },
    [getPanel, getPanelFocusableElements]
  )

  // Track current panel via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const panels = container.querySelectorAll<HTMLElement>('[data-book-panel]')
    const observers: IntersectionObserver[] = []

    panels.forEach((panel, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return
          }

          const targetIndex = targetIndexRef.current

          if (targetIndex !== null && i !== targetIndex) {
            return
          }

          targetIndexRef.current = null
          setCurrentIndex(i)
        },
        { root: container, threshold: 0.5 }
      )
      observer.observe(panel)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [projects.length])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (document.activeElement !== document.body) return

      regionRef.current?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!hasInitializedPanelFocus.current) {
      hasInitializedPanelFocus.current = true
      return
    }

    const frame = window.requestAnimationFrame(() => focusPanelEntryPoint(currentIndex))

    return () => window.cancelAnimationFrame(frame)
  }, [currentIndex, focusPanelEntryPoint])

  useEffect(() => {
    const region = regionRef.current
    if (!region) {
      return
    }

    const handleTabKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        tabNavigationRef.current = false
        return
      }

      tabNavigationRef.current = true

      if (isOnToC) {
        return
      }

      const panel = getActivePanel()
      const backButton = backButtonRef.current
      if (!panel || !backButton) {
        return
      }

      const panelFocusables = getActivePanelFocusableElements()
      const firstFocusable = panelFocusables[0]
      const lastFocusable = panelFocusables.at(-1)
      const activeElement = document.activeElement as HTMLElement | null

      if (!activeElement) {
        return
      }

      if (activeElement === panel) {
        event.preventDefault()
        ;(event.shiftKey ? backButton : (firstFocusable ?? backButton))?.focus({
          preventScroll: true,
        })
        return
      }

      if (activeElement === backButton) {
        event.preventDefault()
        ;(event.shiftKey ? (lastFocusable ?? panel) : (firstFocusable ?? panel))?.focus({
          preventScroll: true,
        })
        return
      }

      if (!panel.contains(activeElement)) {
        return
      }

      if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault()
        backButton.focus({ preventScroll: true })
        return
      }

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault()
        backButton.focus({ preventScroll: true })
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      const wasTabNavigation = tabNavigationRef.current
      tabNavigationRef.current = false

      if (!wasTabNavigation || isOnToC) {
        return
      }

      const panel = getActivePanel()
      const backButton = backButtonRef.current
      const target = event.target

      if (!(target instanceof HTMLElement) || !panel || !backButton) {
        return
      }

      if (target === backButton || target === panel || panel.contains(target)) {
        return
      }

      backButton.focus({ preventScroll: true })
    }

    const resetTabNavigation = () => {
      tabNavigationRef.current = false
    }

    region.addEventListener('keydown', handleTabKeyDownCapture, true)
    region.addEventListener('focusin', handleFocusIn)
    region.addEventListener('mousedown', resetTabNavigation)

    return () => {
      region.removeEventListener('keydown', handleTabKeyDownCapture, true)
      region.removeEventListener('focusin', handleFocusIn)
      region.removeEventListener('mousedown', resetTabNavigation)
    }
  }, [getActivePanel, getActivePanelFocusableElements, isOnToC])

  // Scroll to a specific panel
  const scrollToPanel = useCallback(
    (index: number) => {
      const container = scrollRef.current
      if (!container || index < 0 || index >= totalPanels) return

      targetIndexRef.current = index

      container.scrollTo({
        left: index * container.clientWidth,
        behavior: 'smooth',
      })
    },
    [totalPanels]
  )

  const handleBookKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null
      const activePanel = getActivePanel()
      const isPanelTarget = target?.hasAttribute('data-book-panel')
      const isRegionTarget = target === event.currentTarget
      const isActiveSpreadTarget = !isOnToC && !!target && !!activePanel?.contains(target)
      const navigationIndex = targetIndexRef.current ?? currentIndex

      if (
        target?.closest(EDITABLE_SELECTOR) ||
        target?.closest('[role="tablist"]') ||
        backButtonRef.current?.contains(target) ||
        (!isPanelTarget && !isRegionTarget && !isActiveSpreadTarget)
      ) {
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToPanel(navigationIndex + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToPanel(navigationIndex - 1)
      }
    },
    [currentIndex, getActivePanel, isOnToC, scrollToPanel]
  )

  // Back logic: ToC → homepage #projects, spread → scroll to ToC
  const handleBack = () => {
    if (isOnToC) {
      router.push(getHomeSectionHref('projects'))
    } else {
      scrollToPanel(0)
    }
  }

  return (
    <div
      ref={regionRef}
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
          ref={backButtonRef}
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
          aria-hidden={!isOnToC}
          inert={!isOnToC}
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
            aria-hidden={currentIndex !== i + 1}
            inert={currentIndex !== i + 1}
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
