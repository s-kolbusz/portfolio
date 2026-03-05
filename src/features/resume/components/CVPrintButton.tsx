'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { PrinterIcon } from '@phosphor-icons/react'

import { Button } from '@/shared/ui/Button'

export const CVPrintButton = () => {
  const t = useTranslations('resume')

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => window.print()}
      className="cv-print-button"
      leftIcon={<PrinterIcon weight="duotone" className="size-4" />}
    >
      {t('print')}
    </Button>
  )
}
