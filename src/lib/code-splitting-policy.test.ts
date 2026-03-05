import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  evaluateCodeSplittingUsage,
  scanProjectCodeSplitting,
} from '../../scripts/code-splitting-policy.mjs'

describe('code-splitting-policy', () => {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
  const projectRoot = path.resolve(currentDirectory, '../..')

  it('rejects ad-hoc section-level splits on route files', () => {
    expect(
      evaluateCodeSplittingUsage([
        {
          importer: 'src/app/[locale]/page.tsx',
          imported: '@/components/sections/About',
          strategy: 'next-dynamic',
        },
      ])
    ).toEqual([
      'Disallowed next-dynamic split in src/app/[locale]/page.tsx for "@/components/sections/About": route files should statically import primary sections; reserve splitting for approved heavy client-only modules.',
    ])
  })

  it('allows only approved heavy-client split points across the source tree', () => {
    expect(scanProjectCodeSplitting(projectRoot)).toEqual([])
  })
})
