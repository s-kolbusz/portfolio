import { describe, expect, it } from 'vitest'

import { externalProjectRedirects } from './project-redirects'

describe('externalProjectRedirects', () => {
  it('sends both locales of every moved case study to stronypodhale.pl with a 301', () => {
    const redirects = externalProjectRedirects()

    expect(redirects).toEqual([
      {
        source: '/en/projects/zakofy',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
      {
        source: '/pl/projects/zakofy',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
      {
        source: '/en/projects/your-krakow-travel',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
      {
        source: '/pl/projects/your-krakow-travel',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
      {
        source: '/en/projects/wellezza',
        destination: 'https://stronypodhale.pl/#realizacje',
        statusCode: 301,
      },
      {
        source: '/pl/projects/wellezza',
        destination: 'https://stronypodhale.pl/#realizacje',
        statusCode: 301,
      },
      {
        source: '/en/projects/billboard-zakopane',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
      {
        source: '/pl/projects/billboard-zakopane',
        destination: 'https://stronypodhale.pl/strona-firmowa/',
        statusCode: 301,
      },
    ])
  })

  it('leaves case studies that live here alone', () => {
    const sources = externalProjectRedirects().map((redirect) => redirect.source)

    expect(sources).not.toContain('/en/projects/ready2order')
    expect(sources).not.toContain('/pl/projects/ready2order')
  })
})
