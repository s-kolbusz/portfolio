import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { routing } from '../i18n/routing'
import { isStudioCase } from './entry-href'
import { externalProjectRedirects } from './project-redirects'
import { portfolioEntries } from './projects'
import { STUDIO } from './studio'

const studioCases = portfolioEntries.filter(isStudioCase)
const caseStudies = portfolioEntries.filter((entry) => !isStudioCase(entry))

describe('externalProjectRedirects', () => {
  it('covers every moved project in each locale and without one, as a 301', () => {
    const redirects = externalProjectRedirects()
    const prefixes = ['', ...routing.locales.map((locale) => `/${locale}`)]

    expect(studioCases.length).toBeGreaterThan(0)
    expect(redirects).toHaveLength(studioCases.length * prefixes.length)

    for (const entry of studioCases) {
      for (const prefix of prefixes) {
        expect(redirects).toContainEqual({
          source: `${prefix}/projects/${entry.id}`,
          destination: entry.studioCaseUrl,
          statusCode: 301,
        })
      }
    }
  })

  it('sends visitors to stronypodhale.pl and nowhere else', () => {
    for (const { destination } of externalProjectRedirects()) {
      expect(destination.startsWith(STUDIO.url)).toBe(true)
    }
  })

  it('leaves case studies that live here alone', () => {
    const sources = externalProjectRedirects().map((redirect) => redirect.source)

    expect(caseStudies.length).toBeGreaterThan(0)
    for (const entry of caseStudies) {
      expect(sources.some((source) => source.endsWith(`/projects/${entry.id}`))).toBe(false)
    }
  })

  // next.config.ts loads this module before the @/ alias exists, so its whole
  // import chain has to stay on relative paths. Walks the chain from here.
  it('keeps every file next.config.ts loads free of the @/ alias', () => {
    const valueImport = /^import\s(?!type\s)[^;]*?from\s+'([^']+)'/gm
    const visited = new Set<string>()
    const queue = [join(__dirname, 'project-redirects.ts')]

    while (queue.length > 0) {
      const file = queue.pop()!
      if (visited.has(file)) continue
      visited.add(file)

      const source = readFileSync(file, 'utf8')
      for (const [, specifier] of source.matchAll(valueImport)) {
        expect(specifier.startsWith('@/'), `${file} imports ${specifier}`).toBe(false)
        if (specifier.startsWith('.')) queue.push(`${join(dirname(file), specifier)}.ts`)
      }
    }

    expect(visited.size).toBeGreaterThanOrEqual(4)
  })
})
