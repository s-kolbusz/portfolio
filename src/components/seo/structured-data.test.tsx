import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StructuredData } from './structured-data'

describe('StructuredData', () => {
  it('renders one inline script per entry', () => {
    const { container } = render(
      <StructuredData
        entries={[
          {
            id: 'organization',
            data: {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Sebastian Kolbusz',
              slogan: '<fast sites>',
            },
          },
        ]}
      />
    )

    const script = container.querySelector('script[data-json-ld-id="organization"]')

    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('type', 'application/ld+json')
    expect(script?.textContent).toBe(
      '{"@context":"https://schema.org","@type":"Organization","name":"Sebastian Kolbusz","slogan":"\\u003cfast sites>"}'
    )
  })
})
