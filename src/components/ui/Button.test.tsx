import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a data-locale-link="true" href={href} {...props}>
      {children}
    </a>
  ),
}))

import { Button } from './button'

describe('Button link semantics', () => {
  it('uses locale-aware link rendering for internal href values', () => {
    render(<Button href="/projects">View projects</Button>)

    expect(screen.getByRole('link', { name: 'View projects' })).toHaveAttribute(
      'data-locale-link',
      'true'
    )
  })

  it('uses native anchor rendering for external href values', () => {
    render(<Button href="https://example.com">Open external site</Button>)

    expect(screen.getByRole('link', { name: 'Open external site' })).not.toHaveAttribute(
      'data-locale-link'
    )
  })
})
