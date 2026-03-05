import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProjectBook } from '@/features/work/components/ProjectBook'
import { ProjectCardStack } from '@/features/work/components/ProjectCardStack'
import { getProjects } from '@/features/work/data/get-projects'
import { getLocaleFromParams } from '@/i18n/locale'
import { getLocalizedWorkDetailHref, getPageHref } from '@/i18n/route-map'
import { serializeJsonLd } from '@/lib/json-ld'
import { buildLocalizedPageMetadata } from '@/lib/page-metadata'
import { toAbsoluteSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)
  const t = await getTranslations({ locale, namespace: 'projectsBook' })

  return buildLocalizedPageMetadata({
    locale,
    title: t('title'),
    description: t('subtitle'),
    path: getPageHref('work'),
  })
}

export default async function WorkPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)

  setRequestLocale(locale)
  const projects = getProjects(locale)

  return (
    <main id="main-content">
      <div className="hidden lg:block">
        <ProjectBook projects={projects} />
      </div>

      <div className="lg:hidden">
        <ProjectCardStack projects={projects} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: projects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: toAbsoluteSiteUrl(getLocalizedWorkDetailHref(locale, project.id)),
              name: project.title,
            })),
          }),
        }}
      />
    </main>
  )
}
