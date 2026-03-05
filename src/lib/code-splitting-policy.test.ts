import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  collectCodeSplittingUsage,
  evaluateCodeSplittingUsage,
  evaluateRuntimeBoundaryImports,
  scanProjectCodeSplitting,
  scanProjectRuntimeBoundaries,
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

  it('detects shared wrapper split calls so policy enforcement still applies after migration', () => {
    expect(
      collectCodeSplittingUsage(
        "const DockNav = dynamicClientOnlyNamed(() => import('@/features/navigation/components/DockNav'), (module) => module.DockNav)",
        'src/features/navigation/overlays/ClientOverlays.tsx'
      )
    ).toEqual([
      {
        importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
        imported: '@/features/navigation/components/DockNav',
        strategy: 'dynamic-client-only-named',
      },
    ])
  })

  it('allows only approved heavy-client split points across the source tree', () => {
    expect(scanProjectCodeSplitting(projectRoot)).toEqual([])
  })

  it('rejects direct next/dynamic imports outside the shared wrapper module', () => {
    expect(
      evaluateRuntimeBoundaryImports([
        {
          importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
          kind: 'next-dynamic-import',
        },
      ])
    ).toEqual([
      'Disallowed next/dynamic import in src/features/navigation/overlays/ClientOverlays.tsx: import shared runtime-boundary helpers from src/shared/lib/loadable.ts instead of using next/dynamic directly.',
    ])
  })

  it('rejects direct react lazy imports outside the shared wrapper module', () => {
    expect(
      evaluateRuntimeBoundaryImports([
        {
          importer: 'src/components/sections/Hero.tsx',
          kind: 'react-lazy-import',
        },
      ])
    ).toEqual([
      'Disallowed react lazy import in src/components/sections/Hero.tsx: import shared runtime-boundary helpers from src/shared/lib/loadable.ts instead of using React.lazy directly.',
    ])
  })

  it('allows runtime-boundary imports only from the shared wrapper module across the source tree', () => {
    expect(scanProjectRuntimeBoundaries(projectRoot)).toEqual([])
  })
})
