import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ProjectCaseStudy } from '@/components/features/ProjectCaseStudy'
import { RoleCaseStudy } from '@/components/features/RoleCaseStudy'
import { getProject, getProjects } from '@/data/get-projects'
import { Locale, routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  const slugs = getProjects('en').map((p) => p.id)
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug, locale as Locale)
  if (!project) return {}

  const t = await getTranslations({ locale, namespace: 'projectsBook' })

  return {
    title: `${project.title} | Sebastian Kolbusz`,
    description: project.subtitle,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [project.heroImage],
    },
    other: {
      'article:section': t(`categories.${project.category}`),
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params

  setRequestLocale(locale)

  const project = getProject(slug, locale as Locale)
  if (!project) notFound()

  const allProjects = getProjects(locale as Locale)
  const currentIdx = allProjects.findIndex((p) => p.id === slug)
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : undefined
  const nextProject = currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : undefined

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            headline: project.title,
            description: project.tagline,
            image: project.heroImage,
            dateCreated: project.year,
            category: project.category,
            url: `https://kolbusz.xyz/${locale}/projects/${project.id}`,
            author: {
              '@type': 'Person',
              name: 'Sebastian Kolbusz',
            },
          }),
        }}
      />
      {project.type === 'role' ? (
        <RoleCaseStudy project={project} prevProject={prevProject} nextProject={nextProject} />
      ) : (
        <ProjectCaseStudy project={project} prevProject={prevProject} nextProject={nextProject} />
      )}
    </>
  )
}
