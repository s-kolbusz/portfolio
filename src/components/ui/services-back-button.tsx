'use client'

import { useTranslations } from 'next-intl'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/i18n/navigation'
import { isServicesRoute } from '@/lib/route-predicates'

export function ServicesBackButton() {
  const t = useTranslations('terms')
  const pathname = usePathname()
  const router = useRouter()
  const isServices = isServicesRoute(pathname)

  if (!isServices) return null

  return (
    <div className="pointer-events-none fixed top-6 left-6 z-50">
      <Button
        variant="outline"
        size="md"
        onClick={() => router.back()}
        className="pointer-events-auto shadow-xl"
        leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
      >
        {t('back')}
      </Button>
    </div>
  )
}
