'use client'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { usePathname } from '@/i18n/navigation'
import { isProjectDetailRoute } from '@/lib/route-predicates'
import { useNavigationStore } from '@/lib/stores/navigation'

/**
 * Global back button for case study pages.
 * Rendered in ClientOverlays to ensure it remains truly fixed during smooth scrolling.
 *
 * Navigation logic:
 * - If the user arrived via the /projects listing → show a "/projects" link.
 * - Otherwise (home accordion, CV, direct URL, etc.) → call history.back().
 *
 * Origin is tracked via Zustand. Every link that navigates to a project page explicitly
 * declares its origin — listing links set 'projects', all others set null — so no
 * cleanup effect is needed.
 */
export function CaseStudyBackButton() {
  const t = useTranslations('terms')
  const pathname = usePathname()
  const isProjectDetail = isProjectDetailRoute(pathname)
  const projectOrigin = useNavigationStore((state) => state.projectOrigin)

  if (!isProjectDetail) return null

  if (projectOrigin === 'projects') {
    return (
      <div className="fixed top-6 left-6 z-100">
        <Button
          variant="outline-glass"
          size="md"
          href="/projects"
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
        onClick={() => history.back()}
        leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
      >
        {t('back')}
      </Button>
    </div>
  )
}
