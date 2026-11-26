import { getTranslations, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { Hero } from '@/components/sections/hero'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildHomePageMetadata } from '@/lib/page-metadata'
import { SITE_ORIGIN } from '@/lib/site'

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

  const metadata = buildHomePageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  })
  // while the redesign lives at /v2: its own address, no alternates into the old site, not indexed
  const url = `${SITE_ORIGIN}/v2/${locale}`
  return {
    ...metadata,
    alternates: { canonical: url },
    openGraph: { ...metadata.openGraph, url },
    robots: { index: false, follow: false },
  }
}

export default async function V2Home(props: { params: Promise<{ locale: string }> }) {
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
