import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AboutPage } from '@/components/about/about-page'
import { getLocaleFromParams } from '@/i18n/locale'
import { SITE_ORIGIN } from '@/lib/site'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(props.params)
  const t = await getTranslations({ locale, namespace: 'aboutPage' })
  // while the redesign lives at /v2: its own address, no alternates into the old site, not indexed
  const url = `${SITE_ORIGIN}/v2/${locale}/about`
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: url },
    openGraph: { url, title: t('meta_title'), description: t('meta_description') },
    robots: { index: false, follow: false },
  }
}

export default async function V2About(props: { params: Promise<{ locale: string }> }) {
  const locale = await getLocaleFromParams(props.params)
  setRequestLocale(locale)
  return <AboutPage locale={locale} />
}
