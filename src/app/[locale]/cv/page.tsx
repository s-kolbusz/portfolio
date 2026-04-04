import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArrowLeftIcon } from '@phosphor-icons/react'

import { CVLayout, CVPrintButton } from '@/components/features/cv'
import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import type { CVData } from '@/data/cv'
import { cvDataEn } from '@/data/cv-en'
import { cvDataPl } from '@/data/cv-pl'
import { getLocaleFromParams } from '@/i18n/locale'
import type { Locale } from '@/i18n/routing'
import { buildCvPageMetadata } from '@/lib/page-metadata'

const cvDataByLocale: Record<Locale, CVData> = {
  en: cvDataEn,
  pl: cvDataPl,
}

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)

  const t = await getTranslations({ locale, namespace: 'cv' })

  return buildCvPageMetadata({
    locale,
    title: t('title'),
    description: t('metaDescription'),
  })
}

export default async function CVPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'cv' })

  const cvData = cvDataByLocale[locale]

  return (
    <main id="main-content" className="bg-neutral-100/50 dark:bg-neutral-900/50 print:bg-white">
      <BaseSection
        id="cv-header-nav"
        className="min-h-0 py-8 md:py-10 print:hidden"
        containerClassName="max-w-[210mm] lg:px-6 print:hidden"
      >
        <div className="flex items-center justify-between">
          <Button
            href="/"
            locale={locale}
            variant="ghost"
            leftIcon={
              <ArrowLeftIcon
                weight="bold"
                className="size-4 transition-transform group-hover:-translate-x-1"
              />
            }
          >
            {t('backHome')}
          </Button>

          <div className="hidden lg:block">
            <CVPrintButton />
          </div>
        </div>

        <h1 className="w-full pt-4 text-center font-serif text-5xl font-normal lg:text-7xl">
          {t('title')}
        </h1>
      </BaseSection>

      <div className="flex flex-col justify-center gap-8 pt-4 pb-18 print:p-0">
        <CVLayout data={cvData} />

        <div className="flex items-center justify-center lg:hidden">
          <CVPrintButton />
        </div>
      </div>
    </main>
  )
}
