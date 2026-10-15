import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ProjectCaseStudy } from '@/components/features/project/project-book/project-case-study'
import { RoleCaseStudy } from '@/components/features/project/project-book/role-case-study'
import { StructuredData } from '@/components/seo/structured-data'
import { getCaseStudies, getCaseStudy } from '@/data/get-projects'
import { requireRoutingLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { buildProjectDetailPageMetadata } from '@/lib/page-metadata'
import { toAbsoluteSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = false
export const dynamic = 'force-static'

// Only entries with a case study here. Client work described on stronypodhale.pl
// has no page: next.config.ts redirects its old URLs there (SEB-20).
export function generateStaticParams() {
  const slugs = getCaseStudies('en').map((p) => p.id)
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const locale = requireRoutingLocale(localeParam)
  const project = getCaseStudy(slug, locale)
  if (!project) return {}

  const t = await getTranslations({ locale, namespace: 'projectsBook' })

  return buildProjectDetailPageMetadata({
    locale,
    slug,
    project,
    categoryLabel: t(`categories.${project.category}`),
  })
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = requireRoutingLocale(localeParam)

  setRequestLocale(locale)

  const project = getCaseStudy(slug, locale)
  if (!project) notFound()

  // Previous/next chain the case studies only — never a card that leaves the site.
  const allProjects = getCaseStudies(locale)
  const currentIdx = allProjects.findIndex((p) => p.id === slug)
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : undefined
  const nextProject = currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : undefined
  const structuredDataDescription = `${project.subtitle}. ${project.tagline}`

  return (
    <main id="main-content">
      <StructuredData
        entries={[
          {
            id: `project-${project.id}`,
            data: {
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              '@id': toAbsoluteSiteUrl(`/${locale}/projects/${project.id}`),
              name: project.title,
              headline: project.title,
              description: structuredDataDescription,
              image: {
                '@type': 'ImageObject',
                url: toAbsoluteSiteUrl(project.heroImage),
                contentUrl: toAbsoluteSiteUrl(project.heroImage),
              },
              genre: project.category,
              inLanguage: locale,
              url: toAbsoluteSiteUrl(`/${locale}/projects/${project.id}`),
              author: {
                '@type': 'Person',
                '@id': `${toAbsoluteSiteUrl('/')}#about`,
                name: 'Sebastian Kolbusz',
              },
            },
          },
        ]}
      />
      {project.type === 'role' ? (
        <RoleCaseStudy project={project} prevProject={prevProject} nextProject={nextProject} />
      ) : (
        <ProjectCaseStudy project={project} prevProject={prevProject} nextProject={nextProject} />
      )}
    </main>
  )
}
