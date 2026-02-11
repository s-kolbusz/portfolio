import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

import { CVLayout } from '@/components/features/CVLayout'
import { CVPrintButton } from '@/components/features/CVPrintButton'
import { Button } from '@/components/ui/Button'
import { cvDataEn } from '@/data/cv-en'
import { cvDataPl } from '@/data/cv-pl'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: `${t('title')} | CV`,
    description: t('description'),
  }
}

export default async function CVPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cv' })

  const cvData = locale === 'pl' ? cvDataPl : cvDataEn

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-neutral-100/50 py-8 md:py-20 dark:bg-neutral-900/50 print:bg-white print:py-0">
      <div className="mx-auto max-w-[210mm] pb-8 lg:px-6 print:hidden">
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
      </div>

      <div className="flex flex-col justify-center gap-8 pt-4 pb-18 print:p-0">
        <CVLayout data={cvData} />

        <div className="flex items-center justify-center lg:hidden">
          <CVPrintButton />
        </div>
      </div>
    </main>
  )
}
