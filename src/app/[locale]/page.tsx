import { getTranslations, setRequestLocale } from 'next-intl/server'

import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Hero } from '@/components/sections/Hero'
import { PrintCalculator } from '@/components/sections/PrintCalculator'
import { Projects } from '@/components/sections/Projects'
import { Services } from '@/components/sections/Services'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params
  const { locale } = params
  setRequestLocale(locale)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <About />
      <Projects locale={locale} />
      <Services />
      <PrintCalculator />
      <Contact />
    </main>
  )
}
