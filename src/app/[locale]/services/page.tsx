import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ServicesContent } from '@/components/features/services/services-content'
import { StructuredData } from '@/components/seo/structured-data'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services_page' })

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: `/${locale}/services`,
      languages: {
        en: '/en/services',
        pl: '/pl/services',
      },
    },
  }
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'services_page' })

  const faqItems = [0, 1, 2]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((i) => ({
      '@type': 'Question',
      name: t(`faq.${i}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.${i}.answer`),
      },
    })),
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Szymon Kłębowski - Web Development',
    description: t('meta_description'),
    areaServed: [
      {
        '@type': 'City',
        name: 'Zakopane',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Podhale',
      },
    ],
  }

  return (
    <>
      <StructuredData
        entries={[
          { id: 'services-faq', data: faqSchema },
          { id: 'services-business', data: localBusinessSchema },
        ]}
      />
      <main className="bg-background flex min-h-screen flex-col">
        <ServicesContent />
      </main>
    </>
  )
}
