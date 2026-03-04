import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

import { CVLayout } from '@/components/features/CVLayout'
import { CVPrintButton } from '@/components/features/CVPrintButton'
import { BaseSection } from '@/components/ui/BaseSection'
import { Button } from '@/components/ui/Button'
import { cvDataEn } from '@/data/cv-en'
import { cvDataPl } from '@/data/cv-pl'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildCvPageMetadata } from '@/lib/page-metadata'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)

  const [cvTranslations, metadataTranslations] = await Promise.all([
    getTranslations({ locale, namespace: 'cv' }),
    getTranslations({ locale, namespace: 'Metadata' }),
  ])

  return buildCvPageMetadata({
    locale,
    title: cvTranslations('title'),
    description: metadataTranslations('description'),
  })
}

export default async function CVPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'cv' })

  const cvData = locale === 'pl' ? cvDataPl : cvDataEn

  return (
    <main id="main-content" className="bg-neutral-100/50 dark:bg-neutral-900/50 print:bg-white">
      <BaseSection
        id="cv-header-nav"
        className="min-h-0 py-8 md:py-20 print:hidden"
        containerClassName="max-w-[210mm] lg:px-6 print:hidden"
      >
        <div className="flex items-center justify-between">
          <Button
            href="/"
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
