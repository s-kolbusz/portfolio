'use client'

import type { ComponentProps, ReactNode } from 'react'

import { getEntryHref, isStudioCase } from '@/data/entry-href'
import type { LinkableEntry } from '@/data/entry-href'
import { STUDIO_LINK_REL } from '@/data/studio'
import { Link } from '@/i18n/navigation'

type EntryLinkProps = Omit<ComponentProps<'a'>, 'href' | 'target' | 'rel' | 'onClick'> & {
  entry: LinkableEntry
  /** Runs only for a case study on this site, e.g. to remember where navigation started. */
  onInternalClick?: () => void
  children: ReactNode
}

/**
 * The one place a portfolio card decides where it leads: its case study here,
 * through the locale-aware Link, or — for client work described on
 * stronypodhale.pl — that page in a new tab.
 */
export function EntryLink({ entry, onInternalClick, children, ...anchorProps }: EntryLinkProps) {
  if (isStudioCase(entry)) {
    return (
      <a href={entry.studioCaseUrl} target="_blank" rel={STUDIO_LINK_REL} {...anchorProps}>
        {children}
      </a>
    )
  }

  return (
    <Link href={getEntryHref(entry)} onClick={onInternalClick} {...anchorProps}>
      {children}
    </Link>
  )
}
