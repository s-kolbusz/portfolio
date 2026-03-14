'use client'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { usePathname } from '@/i18n/navigation'
import { isProjectDetailRoute } from '@/lib/route-predicates'

/**
 * Global back button for case study pages.
 * Rendered in ClientOverlays to ensure it remains truly fixed during smooth scrolling.
 * Uses navigation source memory to decide whether to return to home or projects book.
 */
export function CaseStudyBackButton() {
  const t = useTranslations('projectsBook')
  const pathname = usePathname()

  // Detect if we are on a project detail page
  const isProjectDetail = isProjectDetailRoute(pathname)

  if (!isProjectDetail) return null

  return (
    <div className="pointer-events-none fixed top-6 left-6 z-50">
      <Button
        variant="outline-glass"
        size="md"
        href="/projects"
        className="pointer-events-auto shadow-xl"
        leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
      >
        {t('backLabel')}
      </Button>
    </div>
  )
}
