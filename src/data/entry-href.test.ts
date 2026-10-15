import { describe, expect, it } from 'vitest'

import { getEntryHref, isExternalEntry } from './entry-href'

describe('entry-href', () => {
  it('links a case study to its page on this site', () => {
    const entry = { id: 'ready2order' }

    expect(getEntryHref(entry)).toBe('/projects/ready2order')
    expect(isExternalEntry(entry)).toBe(false)
  })

  it('links client work to the page on stronypodhale.pl that describes it', () => {
    const entry = { id: 'zakofy', externalUrl: 'https://stronypodhale.pl/strona-firmowa/' }

    expect(getEntryHref(entry)).toBe('https://stronypodhale.pl/strona-firmowa/')
    expect(isExternalEntry(entry)).toBe(true)
  })
})
