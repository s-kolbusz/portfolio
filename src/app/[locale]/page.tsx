import { getTranslations, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { Hero } from '@/components/sections/hero'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildHomePageMetadata } from '@/lib/page-metadata'

const About = dynamic(() =>
  import('@/components/sections/about').then((m) => ({ default: m.About }))
)
const Projects = dynamic(() =>
  import('@/components/sections/projects').then((m) => ({ default: m.Projects }))
)
const Services = dynamic(() =>
  import('@/components/sections/services').then((m) => ({ default: m.Services }))
)
const PrintCalculator = dynamic(() =>
  import('@/components/sections/print-calculator').then((m) => ({ default: m.PrintCalculator }))
)
const Contact = dynamic(() =>
  import('@/components/sections/contact').then((m) => ({ default: m.Contact }))
)

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
