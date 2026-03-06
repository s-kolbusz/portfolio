import { type Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProjectBook } from '@/components/features/project-book'
import { ProjectCardStack } from '@/components/features/project-card-stack'
import { getProjects } from '@/data/get-projects'
import { getLocaleFromParams } from '@/i18n/locale'
import { serializeJsonLd } from '@/lib/json-ld'
import { buildProjectsPageMetadata } from '@/lib/page-metadata'
import { toAbsoluteSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocaleFromParams(params)
  const t = await getTranslations({ locale, namespace: 'projectsBook' })

  return buildProjectsPageMetadata({
    locale,
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function ProjectsPage({ params }: Props) {
  const locale = await getLocaleFromParams(params)

  setRequestLocale(locale)
  const projects = getProjects(locale)

  return (
    <main id="main-content">
      {/* Desktop: horizontal book */}
      <div className="hidden lg:block">
        <ProjectBook projects={projects} />
      </div>

      {/* Mobile: vertical card stack */}
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
              url: toAbsoluteSiteUrl(`/${locale}/projects/${project.id}`),
              name: project.title,
            })),
          }),
        }}
      />
    </main>
  )
}
