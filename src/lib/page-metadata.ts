import type { Metadata } from 'next'

import type { PortfolioEntry } from '@/features/work/data/projects-en'
import { getPageHref, getWorkDetailHref } from '@/i18n/route-map'
import { getMetadataAlternates, type Locale } from '@/i18n/routing'

type LocalizedMetadataInput = {
  locale: Locale
  title: string
  description: string
  path: string
}

export function buildLocalizedPageMetadata({
  locale,
  title,
  description,
  path,
}: LocalizedMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: getMetadataAlternates(path, locale),
  }
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
    alternates: getMetadataAlternates(getPageHref('home'), locale),
  }
}

type WorkDetailMetadataInput = {
  locale: Locale
  slug: string
  project: PortfolioEntry
  categoryLabel: string
}

export function buildWorkDetailPageMetadata({
  locale,
  slug,
  project,
  categoryLabel,
}: WorkDetailMetadataInput): Metadata {
  return {
    title: project.title,
    description: project.subtitle,
    alternates: getMetadataAlternates(getWorkDetailHref(slug), locale),
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
