import type { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { STUDIO, STUDIO_LINK_REL } from '@/data/studio'

import { EntryLink } from './entry-link'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} data-locale-link {...props}>
      {children}
    </a>
  ),
}))

describe('EntryLink', () => {
  it('opens a case study here through the locale-aware link', () => {
    const onInternalClick = vi.fn()
    render(
      <EntryLink entry={{ id: 'ready2order' }} onInternalClick={onInternalClick}>
        ready2order
      </EntryLink>
    )

    const link = screen.getByRole('link', { name: 'ready2order' })
    expect(link).toHaveAttribute('href', '/projects/ready2order')
    expect(link).toHaveAttribute('data-locale-link')
    expect(link).not.toHaveAttribute('target')

    fireEvent.click(link)
    expect(onInternalClick).toHaveBeenCalledOnce()
  })

  it('opens client work on stronypodhale.pl in a new tab, keeping the referrer', () => {
    const onInternalClick = vi.fn()
    render(
      <EntryLink
        entry={{ id: 'zakofy', studioCaseUrl: STUDIO.pages.companySite }}
        onInternalClick={onInternalClick}
        className="card-link"
        data-spread-link
      >
        Zakofy
      </EntryLink>
    )

    const link = screen.getByRole('link', { name: 'Zakofy' })
    expect(link).toHaveAttribute('href', STUDIO.pages.companySite)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', STUDIO_LINK_REL)
    expect(link).not.toHaveAttribute('data-locale-link')
    expect(link).toHaveClass('card-link')
    expect(link).toHaveAttribute('data-spread-link')

    fireEvent.click(link)
    expect(onInternalClick).not.toHaveBeenCalled()
  })
})
