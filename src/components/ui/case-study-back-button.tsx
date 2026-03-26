'use client'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

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
  const t = useTranslations('terms')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Detect if we are on a project detail page
  const isProjectDetail = isProjectDetailRoute(pathname)

  if (!isProjectDetail) return null

  const isHome = searchParams.get('origin') === 'home'
  const href = isHome ? '/' : '/projects'

  if (isHome) {
    return (
      <div className="fixed top-6 left-6 z-100">
        <Button
          variant="outline-glass"
          size="md"
          onClick={() => history.back()}
          leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
        >
          {t('back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-6 left-6 z-100">
      <Button
        variant="outline-glass"
        size="md"
        href={href}
        leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
      >
        {t('back')}
      </Button>
    </div>
  )
}
