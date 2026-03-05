import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

import { CVLayout } from '@/features/resume/components/CVLayout'
import { CVPrintButton } from '@/features/resume/components/CVPrintButton'
import { resumeDataEn } from '@/features/resume/data/resume-en'
import { resumeDataPl } from '@/features/resume/data/resume-pl'
import { getLocaleFromParams } from '@/i18n/locale'
import { getPageHref } from '@/i18n/route-map'
import { buildLocalizedPageMetadata } from '@/lib/page-metadata'
import { BaseSection } from '@/shared/ui/BaseSection'
import { Button } from '@/shared/ui/Button'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)

  const [resumeTranslations, metadataTranslations] = await Promise.all([
    getTranslations({ locale, namespace: 'resume' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ])

  return buildLocalizedPageMetadata({
    locale,
    title: resumeTranslations('title'),
    description: metadataTranslations('description'),
    path: getPageHref('resume'),
  })
}

export default async function ResumePage({ params }: Props) {
  const locale = await getLocaleFromParams(params)
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'resume' })

  const resumeData = locale === 'pl' ? resumeDataPl : resumeDataEn

  return (
    <main id="main-content" className="bg-neutral-100/50 dark:bg-neutral-900/50 print:bg-white">
      <BaseSection
        id="resume-header-nav"
        className="min-h-0 py-8 md:py-20 print:hidden"
        containerClassName="max-w-[210mm] lg:px-6 print:hidden"
      >
        <div className="flex items-center justify-between">
          <Button
            href={getPageHref('home')}
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
        <CVLayout data={resumeData} />

        <div className="flex items-center justify-center lg:hidden">
          <CVPrintButton />
        </div>
      </div>
    </main>
  )
}
