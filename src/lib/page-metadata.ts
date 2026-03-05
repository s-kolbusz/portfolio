import type { Metadata } from 'next'

import type { PortfolioEntry } from '@/features/work/data/projects-en'
import { getMetadataAlternates, type Locale } from '@/i18n/routing'

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
  return {
    title: {
      absolute: title,
    },
    description,
    alternates: getMetadataAlternates('/', locale),
  }
}

export function buildCvPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return {
    title,
    description,
    alternates: getMetadataAlternates('/cv', locale),
  }
}

export function buildProjectsPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return {
    title,
    description,
    alternates: getMetadataAlternates('/projects', locale),
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
  return {
    title: project.title,
    description: project.subtitle,
    alternates: getMetadataAlternates(`/projects/${slug}`, locale),
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [project.heroImage],
    },
    other: {
      'article:section': categoryLabel,
    },
  }
}
