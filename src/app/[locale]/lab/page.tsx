import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { getLocaleFromParams } from '@/i18n/locale'
import { getPageHref } from '@/i18n/route-map'
import { buildLocalizedPageMetadata } from '@/lib/page-metadata'

import { LabPageClient } from './LabPageClient'

const LAB_METADATA = {
  en: {
    title: 'Lab',
    description: 'Design system studies, interface experiments, and front-end prototypes.',
  },
  pl: {
    title: 'Laboratorium',
    description: 'Studia systemu projektowego, eksperymenty interfejsu i prototypy front-endowe.',
  },
} as const

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)
  const metadata = LAB_METADATA[locale]

  return buildLocalizedPageMetadata({
    locale,
    title: metadata.title,
    description: metadata.description,
    path: getPageHref('lab'),
  })
}

export default async function LabPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)
  setRequestLocale(locale)

  return <LabPageClient />
}
