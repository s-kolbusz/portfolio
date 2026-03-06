import { getTranslations, setRequestLocale } from 'next-intl/server'

import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'
import { Hero } from '@/components/sections/hero'
import { PrintCalculator } from '@/components/sections/print-calculator'
import { Projects } from '@/components/sections/projects'
import { Services } from '@/components/sections/services'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildHomePageMetadata } from '@/lib/page-metadata'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const locale = await getLocaleFromParams(props.params)
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return buildHomePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  })
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const locale = await getLocaleFromParams(props.params)
  setRequestLocale(locale)

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <About />
      <Projects locale={locale} />
      <Services />
      <PrintCalculator />
      <Contact />
    </main>
  )
}
