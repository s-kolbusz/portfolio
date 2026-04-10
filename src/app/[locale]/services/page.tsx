import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ServicesContent } from '@/components/features/services/services-content'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildServicesPageMetadata } from '@/lib/page-metadata'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)
  const t = await getTranslations({ locale, namespace: 'services_page' })

  return buildServicesPageMetadata({
    locale,
    title: t('meta_title'),
    description: t('meta_description'),
  })
}

export default async function ServicesPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)
  setRequestLocale(locale)

  return (
    <main className="bg-background flex min-h-screen flex-col">
      <ServicesContent />
    </main>
  )
}
