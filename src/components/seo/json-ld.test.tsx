import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JsonLd } from './json-ld'

function getScriptContent(id: string): unknown {
  const script = document.querySelector(`script[data-json-ld-id="${id}"]`)
  if (!script?.textContent) throw new Error(`No script found with id: ${id}`)
  return JSON.parse(script.textContent)
}

describe('JsonLd', () => {
  it('renders Person and WebSite schemas', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    const website = getScriptContent('website') as Record<string, unknown>

    expect(person['@type']).toBe('Person')
    expect(website['@type']).toBe('WebSite')
  })

  it('Person schema has @id for entity linking', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    expect(person['@id']).toMatch(/#about$/)
  })

  it('Person schema wraps image in ImageObject (schema.org requirement)', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    const image = person['image'] as Record<string, unknown>

    expect(image).toBeDefined()
    expect(image['@type']).toBe('ImageObject')
    expect(typeof image['url']).toBe('string')
    expect(image['url']).toContain('https://')
  })

  it('Person schema uses x.com URL (no twitter.com redirect chains)', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    const sameAs = person['sameAs'] as string[]

    // twitter.com redirects to x.com — should not be present
    expect(sameAs).not.toContain('https://twitter.com/s_kolbusz')
    // canonical x.com URL should be present
    expect(sameAs).toContain('https://x.com/s_kolbusz')
  })

  it('Person schema has correct jobTitle matching site copy', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    expect(person['jobTitle']).toBe('Senior Frontend Engineer')
  })

  it('WebSite schema has @id but no potentialAction (no search feature on this site)', () => {
    render(<JsonLd />)

    const website = getScriptContent('website') as Record<string, unknown>
    expect(website['@id']).toBe('https://kolbusz.xyz')

    // There is no site search — adding a SearchAction would be misleading to Google
    expect(website['potentialAction']).toBeUndefined()
  })

  it('Person and WebSite schemas link to each other via @id', () => {
    render(<JsonLd />)

    const person = getScriptContent('person') as Record<string, unknown>
    const website = getScriptContent('website') as Record<string, unknown>

    const personId = person['@id'] as string
    const websiteAuthor = (website['author'] as Record<string, unknown>)['@id'] as string

    expect(personId).toBe(websiteAuthor)
  })
})
