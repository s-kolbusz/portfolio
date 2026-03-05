import { describe, expect, it } from 'vitest'

import {
  evaluateRouteBudgets,
  parseClientReferenceManifest,
} from '../../scripts/bundle-budgets.mjs'

describe('bundle-budgets', () => {
  it('parses a client reference manifest into a plain object', () => {
    const manifest = parseClientReferenceManifest(`
      globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};
      globalThis.__RSC_MANIFEST["/[locale]/page"] = {
        entryJSFiles: {
          "[project]/src/app/[locale]/page": ["static/chunks/home.js"]
        }
      };
    `)

    expect(manifest.entryJSFiles['[project]/src/app/[locale]/page']).toEqual([
      'static/chunks/home.js',
    ])
  })

  it('reports routes that exceed their bundle budget', () => {
    expect(
      evaluateRouteBudgets([
        {
          budgetBytes: 600_000,
          label: 'home',
          route: '/[locale]',
          totalBytes: 600_001,
        },
      ])
    ).toEqual(['Route /[locale] (home) exceeds bundle budget: 600001 B > 600000 B.'])
  })
})
