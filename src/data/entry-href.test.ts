import { describe, expect, it } from 'vitest'

import { getEntryHref, isStudioCase } from './entry-href'

describe('entry-href', () => {
  it('links a case study to its page on this site', () => {
    const entry = { id: 'ready2order' }

    expect(getEntryHref(entry)).toBe('/projects/ready2order')
    expect(isStudioCase(entry)).toBe(false)
  })

  it('links client work to the page on stronypodhale.pl that describes it', () => {
    const entry = { id: 'zakofy', studioCaseUrl: 'https://stronypodhale.pl/strona-firmowa/' }

    expect(getEntryHref(entry)).toBe('https://stronypodhale.pl/strona-firmowa/')
    expect(isStudioCase(entry)).toBe(true)
  })

  it('treats an empty studio URL as a case study here', () => {
    expect(isStudioCase({ id: 'draft', studioCaseUrl: '' })).toBe(false)
  })
})
