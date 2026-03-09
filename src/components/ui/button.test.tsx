import type { ReactNode } from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props} data-locale-link="true">
      {children}
    </a>
  ),
}))

import { Button } from './button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    render(<Button href="/test">Link button</Button>)
    const link = screen.getByRole('link', { name: 'Link button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveAttribute('data-locale-link', 'true')
  })

  it('renders as a regular anchor for external href values', () => {
    render(<Button href="https://example.com">External</Button>)
    const link = screen.getByRole('link', { name: 'External' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).not.toHaveAttribute('data-locale-link')
  })

  it('applies correct rel for target="_blank"', () => {
    render(
      <Button href="https://example.com" target="_blank">
        External
      </Button>
    )
    const link = screen.getByRole('link', { name: 'External' })
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders loading state', () => {
    render(
      <Button isLoading leftIcon={<span>Icon</span>}>
        Submit
      </Button>
    )
    expect(screen.queryByText('Icon')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} isLoading>
        Click
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
