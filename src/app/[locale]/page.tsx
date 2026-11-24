import { getTranslations, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { Hero } from '@/components/sections/hero'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildHomePageMetadata } from '@/lib/page-metadata'

const AspectDemo = dynamic(() =>
  import('@/components/sections/aspect-demo').then((m) => ({ default: m.AspectDemo }))
)
const Ready2orderScene = dynamic(() =>
  import('@/components/sections/ready2order-scene').then((m) => ({ default: m.Ready2orderScene }))
)
const HowIWork = dynamic(() =>
  import('@/components/sections/how-i-work').then((m) => ({ default: m.HowIWork }))
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
      <AspectDemo />
      <Ready2orderScene />
      <HowIWork />
      <Contact />
    </main>
  )
}
