import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from './serialize-json-ld'

describe('serializeJsonLd', () => {
  it('escapes < characters to prevent script injection breaks', () => {
    const payload = {
      description: '</script><script>alert("xss")</script>',
    }

    const serialized = serializeJsonLd(payload)

    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c/script>\\u003cscript>alert(\\"xss\\")\\u003c/script>')
    expect(JSON.parse(serialized)).toEqual(payload)
  })

  it('preserves JSON output when no escaping is needed', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Portfolio',
    }

    expect(serializeJsonLd(payload)).toBe(JSON.stringify(payload))
  })
})
