import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ProjectBook } from '@/components/features/ProjectBook'
import { ProjectCardStack } from '@/components/features/ProjectCardStack'
import { getProjects } from '@/data/get-projects'
import { Locale } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projectsBook' })

  return {
    title: `${t('title')} | Sebastian Kolbusz`,
    description: t('subtitle'),
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const projects = getProjects(locale as Locale)

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
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: projects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://kolbusz.xyz/${locale}/projects/${project.id}`,
              name: project.title,
            })),
          }),
        }}
      />
    </main>
  )
}
