'use client'

import { useLocale, useTranslations } from 'next-intl'

import { DownloadSimpleIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/routing'

// Synced from ~/Projects/.context/cv by sync_portfolio.py, together with the page content.
export const CV_PDF: Record<Locale, string> = {
  en: '/cv/Sebastian_Kolbusz_CV.pdf',
  pl: '/cv/Sebastian_Kolbusz_CV_PL.pdf',
}

export const CVDownloadButton = () => {
  const t = useTranslations('cv')
  const locale = useLocale() as Locale
  const href = CV_PDF[locale]

  return (
    <Button
      href={href}
      download={href.split('/').pop()}
      variant="primary"
      size="sm"
      leftIcon={<DownloadSimpleIcon weight="duotone" className="size-4" />}
    >
      {t('download')}
    </Button>
  )
}
