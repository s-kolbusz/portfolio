import type { Locale } from '@/i18n/routing'

import { workItems } from './work-items'
import type { WorkItem, WorkItemContent, WorkItemId } from './work-items'
import { workItemsEn } from './work-items-en'
import { workItemsPl } from './work-items-pl'

// ---------------------------------------------------------------------------
// Merge base + locale content
// ---------------------------------------------------------------------------

const localizedWorkItemsByLocale: Record<Locale, Record<WorkItemId, WorkItemContent>> = {
  en: workItemsEn,
  pl: workItemsPl,
}

function mergeWorkItemWithLocaleContent(
  locale: Locale,
  workItem: (typeof workItems)[number]
): WorkItem {
  const localizedContent = localizedWorkItemsByLocale[locale][workItem.id]

  if (!localizedContent) {
    throw new Error(
      `Missing localized work item content for "${workItem.id}" in locale "${locale}".`
    )
  }

  return {
    ...workItem,
    ...localizedContent,
  }
}

/**
 * Returns all work items merged with locale-specific content,
 * sorted by `order`.
 */
export function getWorkItems(locale: Locale): WorkItem[] {
  const sortedWorkItems = [...workItems].sort((a, b) => a.order - b.order)
  return sortedWorkItems.map((workItem) => mergeWorkItemWithLocaleContent(locale, workItem))
}

/**
 * Finds a single work item by slug.
 */
export function getWorkItem(slug: string, locale: Locale): WorkItem | undefined {
  return getWorkItems(locale).find((workItem) => workItem.id === slug)
}

/**
 * Returns only featured work items (used by the homepage Projects section).
 */
export function getFeaturedWorkItems(locale: Locale): WorkItem[] {
  return getWorkItems(locale).filter((workItem) => workItem.featured)
}
