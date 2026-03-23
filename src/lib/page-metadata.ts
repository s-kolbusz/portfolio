import type { Metadata } from 'next'

import type { PortfolioEntry } from '@/data/projects'
import { routing, type Locale } from '@/i18n/routing'
import { toAbsoluteSiteUrl } from '@/lib/site'

export function getMetadataAlternates(path: string, currentLocale: Locale) {
  const languages: Record<string, string> = {}

  routing.locales.forEach((locale) => {
    // Ensure we generate absolute URLs for each locale
    languages[locale] = toAbsoluteSiteUrl(`/${locale}${path === '/' ? '' : path}`)
  })

  return {
    canonical: languages[currentLocale],
    languages,
  }
}

type LocalizedMetadataInput = {
  locale: Locale
  title: string
  description: string
  path: string
}

export function buildHomePageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  const alternates = getMetadataAlternates('/', locale)
  return {
    title: {
      absolute: title,
    },
    description,
    alternates,
    openGraph: {
      url: alternates.canonical,
      title,
      description,
    },
  }
}

export function buildCvPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  const alternates = getMetadataAlternates('/cv', locale)
  return {
    title,
    description,
    alternates,
    openGraph: {
      url: alternates.canonical,
      title,
      description,
    },
  }
}

export function buildProjectsPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  const alternates = getMetadataAlternates('/projects', locale)
  return {
    title,
    description,
    alternates,
    openGraph: {
      url: alternates.canonical,
      title,
      description,
    },
  }
}

type ProjectDetailMetadataInput = {
  locale: Locale
  slug: string
  project: PortfolioEntry
  categoryLabel: string
}

export function buildProjectDetailPageMetadata({
  locale,
  slug,
  project,
  categoryLabel,
}: ProjectDetailMetadataInput): Metadata {
  const alternates = getMetadataAlternates(`/projects/${slug}`, locale)
  return {
    title: project.title,
    description: project.subtitle,
    alternates,
    openGraph: {
      url: alternates.canonical,
      title: project.title,
      description: project.tagline,
      images: [project.heroImage],
    },
    other: {
      'article:section': categoryLabel,
    },
  }
}
