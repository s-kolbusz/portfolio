import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

import { CVDownloadButton } from '@/components/features/cv/cv-download-button'
import { CvProjectLinks } from '@/components/features/cv/cv-project-links'
import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import { CV_HTML } from '@/data/cv/cv-html.generated'
import { getProjects } from '@/data/get-projects'
import { getLocaleFromParams } from '@/i18n/locale'
import { buildCvPageMetadata } from '@/lib/page-metadata'

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

  const projects = getProjects(locale)

  return (
    <main id="main-content" className="bg-neutral-100/50 dark:bg-neutral-900/50">
      <BaseSection
        id="cv-header-nav"
        className="min-h-0 py-8 md:py-10"
        containerClassName="max-w-[210mm] lg:px-6"
      >
        <div className="flex items-center justify-between gap-4">
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

          {/* On small screens the floating locale switcher sits here, so the button moves below. */}
          <div className="hidden lg:block">
            <CVDownloadButton />
          </div>
        </div>

        <h1 className="w-full pt-4 text-center font-serif text-5xl font-normal lg:text-7xl">
          {t('title')}
        </h1>

        <div className="flex justify-center pt-6 lg:hidden">
          <CVDownloadButton />
        </div>
      </BaseSection>

      <div className="flex flex-col justify-center gap-8 px-4 pt-4 pb-18">
        {/* The same document the PDF is printed from: generated from ~/Projects/.context/cv. */}
        <article
          lang={locale}
          className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-sm bg-[#fcfaf6] px-6 py-8 shadow-2xl md:px-[13mm] md:py-[12mm]"
          dangerouslySetInnerHTML={{ __html: CV_HTML[locale] }}
        />

        <CvProjectLinks
          projects={projects.map((p) => ({ id: p.id, title: p.title }))}
          label={t('selectedWork')}
        />
      </div>
    </main>
  )
}
