import type { Metadata } from 'next'

import type { PortfolioEntry } from '@/data/projects'
import { routing, type Locale } from '@/i18n/routing'
import {
  SITE_NAME,
  SITE_SOCIAL_IMAGE_ALT,
  SITE_SOCIAL_IMAGE_PATH,
  SITE_TWITTER_HANDLE,
  toAbsoluteSiteUrl,
} from '@/lib/site'

const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  pl: 'pl_PL',
}

const DEFAULT_SOCIAL_IMAGE = {
  url: toAbsoluteSiteUrl(SITE_SOCIAL_IMAGE_PATH),
  width: 1200,
  height: 630,
  alt: SITE_SOCIAL_IMAGE_ALT,
}

function toAbsoluteImageUrl(url: string) {
  if (/^https?:\/\//.test(url)) {
    return url
  }

  return toAbsoluteSiteUrl(url)
}

function getMetadataAlternates(path: string, currentLocale: Locale) {
  const languages: Record<string, string> = {}

  routing.locales.forEach((locale) => {
    // Ensure we generate absolute URLs for each locale
    languages[locale] = toAbsoluteSiteUrl(`/${locale}${path === '/' ? '' : path}`)
  })

  // x-default indicates the fallback URL for unmatched locales (Google recommendation)
  languages['x-default'] = languages[routing.defaultLocale]

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

type PageMetadataInput = LocalizedMetadataInput & {
  absoluteTitle?: boolean
  type?: 'website' | 'article'
  images?: Array<string | { url: string; width?: number; height?: number; alt?: string }>
  other?: Metadata['other']
}

type SocialImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

function getOpenGraphImages(images?: PageMetadataInput['images']): SocialImage[] {
  if (!images || images.length === 0) {
    return [{ ...DEFAULT_SOCIAL_IMAGE, url: toAbsoluteImageUrl(DEFAULT_SOCIAL_IMAGE.url) }]
  }

  return images.map((image) => {
    if (typeof image === 'string') {
      return {
        url: toAbsoluteImageUrl(image),
      }
    }

    return {
      ...image,
      url: toAbsoluteImageUrl(image.url),
    }
  })
}

export const MIN_DESCRIPTION_LENGTH = 110
const MAX_DESCRIPTION_LENGTH = 160

/**
 * Trims a description to fit within the max character limit.
 * Tries to break at a word boundary and appends an ellipsis.
 */
function trimDescription(description: string, maxLength = MAX_DESCRIPTION_LENGTH) {
  if (description.length <= maxLength) {
    return description
  }

  const sliced = description.slice(0, maxLength - 1)
  const lastSpace = sliced.lastIndexOf(' ')

  return `${(lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}\u2026`
}

/**
 * Normalises a page description:
 * - Trims to max 160 chars
 * - Returns as-is if already ≥ 110 chars (the minimum for meta descriptions to avoid
 *   the "too short" Ahrefs warning)
 */
function normaliseDescription(description: string) {
  return trimDescription(description.trim())
}

function buildPageMetadata({
  absoluteTitle = false,
  description,
  images,
  locale,
  other,
  path,
  title,
  type = 'website',
}: PageMetadataInput): Metadata {
  const alternates = getMetadataAlternates(path, locale)
  const openGraphImages = getOpenGraphImages(images)
  const twitterImages = openGraphImages?.map((image) => image.url) ?? []

  const normalisedDescription = normaliseDescription(description)

  return {
    title: absoluteTitle
      ? {
          absolute: title,
        }
      : title,
    description: normalisedDescription,
    alternates,
    openGraph: {
      type,
      locale: OPEN_GRAPH_LOCALE[locale],
      url: alternates.canonical,
      siteName: SITE_NAME,
      title,
      description: normalisedDescription,
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      creator: SITE_TWITTER_HANDLE,
      title,
      description: normalisedDescription,
      images: twitterImages,
    },
    ...(other ? { other } : {}),
  }
}

function buildProjectMetaDescription(project: PortfolioEntry) {
  return trimDescription(`${project.subtitle}. ${project.tagline}`)
}

export function buildHomePageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return buildPageMetadata({
    locale,
    title,
    description,
    path: '/',
    absoluteTitle: true,
  })
}

export function buildStaticPageMetadata({
  locale,
  title,
  description,
  path,
}: LocalizedMetadataInput): Metadata {
  return buildPageMetadata({
    locale,
    title,
    description,
    path,
  })
}

export function buildCvPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return buildStaticPageMetadata({
    locale,
    title,
    description,
    path: '/cv',
  })
}

export function buildProjectsPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return buildStaticPageMetadata({
    locale,
    title,
    description,
    path: '/projects',
  })
}

export function buildServicesPageMetadata({
  locale,
  title,
  description,
}: Omit<LocalizedMetadataInput, 'path'>): Metadata {
  return buildStaticPageMetadata({
    locale,
    title,
    description,
    path: '/services',
  })
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
  return buildPageMetadata({
    locale,
    title: project.title,
    description: buildProjectMetaDescription(project),
    path: `/projects/${slug}`,
    type: 'article',
    images: [project.heroImage],
    other: {
      'article:section': categoryLabel,
    },
  })
}
