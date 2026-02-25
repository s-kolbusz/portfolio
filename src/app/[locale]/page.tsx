import { getTranslations, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { Hero } from '@/components/sections/Hero'

const About = dynamic(() => import('@/components/sections/About').then((mod) => mod.About))
const Projects = dynamic(() => import('@/components/sections/Projects').then((mod) => mod.Projects))
const Services = dynamic(() => import('@/components/sections/Services').then((mod) => mod.Services))
const PrintCalculator = dynamic(() =>
  import('@/components/sections/PrintCalculator').then((mod) => mod.PrintCalculator)
)
const Contact = dynamic(() => import('@/components/sections/Contact').then((mod) => mod.Contact))

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: {
      absolute: t('title'),
    },
    description: t('description'),
  }
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params
  const { locale } = params
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
