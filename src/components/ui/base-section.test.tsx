import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BaseSection } from './base-section'

describe('BaseSection', () => {
  it('renders children correctly', () => {
    render(
      <BaseSection id="test-section">
        <div>Test Content</div>
      </BaseSection>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies the correct id to the section element', () => {
    const { container } = render(
      <BaseSection id="my-unique-id">
        <p>content</p>
      </BaseSection>
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'my-unique-id')
  })

  it('applies additional className to the section element', () => {
    const { container } = render(
      <BaseSection id="test" className="custom-class">
        <p>content</p>
      </BaseSection>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('custom-class')
  })

  it('applies containerClassName to the inner div', () => {
    const { container } = render(
      <BaseSection id="test" containerClassName="inner-custom-class">
        <p>content</p>
      </BaseSection>
    )

    const innerDiv = container.querySelector('.container')
    expect(innerDiv).toHaveClass('inner-custom-class')
  })

  it('renders with the secondary variant background', () => {
    const { container } = render(
      <BaseSection id="test" variant="secondary">
        <p>content</p>
      </BaseSection>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-secondary/20')
  })
})
