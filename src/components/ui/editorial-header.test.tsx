import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EditorialHeader } from './editorial-header'

describe('EditorialHeader', () => {
  it('renders the title correctly', () => {
    render(<EditorialHeader title="Main Title" />)
    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Main Title')
  })

  it('renders the subtitle when provided', () => {
    render(<EditorialHeader title="Title" subtitle="This is a subtitle" />)
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument()
  })

  it('renders the tagline when provided', () => {
    render(<EditorialHeader title="Title" tagline="TAGLINE" />)
    expect(screen.getByText('TAGLINE')).toBeInTheDocument()
  })

  it('applies custom class names', () => {
    const { container } = render(
      <EditorialHeader
        title="Title"
        className="outer-class"
        titleClassName="title-class"
        subtitleClassName="subtitle-class"
        subtitle="Subtitle"
      />
    )

    expect(container.firstChild).toHaveClass('outer-class')
    expect(screen.getByText('Title')).toHaveClass('title-class')
    expect(screen.getByText('Subtitle')).toHaveClass('subtitle-class')
  })

  it('does not render subtitle or tagline if not provided', () => {
    const { container } = render(<EditorialHeader title="Title" />)
    expect(screen.queryByText('Subtitle')).not.toBeInTheDocument()
    expect(container.querySelector('span.text-primary')).not.toBeInTheDocument()
  })

  it('can render an h1 title when used as a page heading', () => {
    render(<EditorialHeader title="Page Title" as="h1" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title')
  })
})
