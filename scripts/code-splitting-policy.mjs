import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

export const APPROVED_CODE_SPLIT_POINTS = [
  {
    importer: 'src/components/sections/Hero.tsx',
    imported: '@/components/canvas/HeroScene',
    strategy: 'lazy-client-only',
    reason: 'WebGL scene is a heavy client-only enhancement and is gated by reduced-motion checks.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/overlays/CustomCursor',
    strategy: 'dynamic-client-only',
    reason: 'Custom cursor is a non-critical pointer enhancement mounted after hydration.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/shared/ui/SmoothScroller',
    strategy: 'dynamic-client-only-named',
    reason:
      'Smooth scrolling is a progressive enhancement and should stay out of the critical path.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/components/DockNav',
    strategy: 'dynamic-client-only-named',
    reason: 'Dock navigation is deferred as a non-critical home-page enhancement.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/components/SettingsDock',
    strategy: 'dynamic-client-only-named',
    reason: 'Settings dock is deferred as a non-critical home-page enhancement.',
  },
]

export const APPROVED_RUNTIME_BOUNDARY_IMPORTERS = new Set(['src/shared/lib/loadable.ts'])

const DYNAMIC_IMPORT_PATTERN = /\bdynamic\s*\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gs
const REACT_LAZY_PATTERN = /\blazy\s*\(\s*\(\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)\s*\)/gs
const DYNAMIC_CLIENT_ONLY_PATTERN =
  /\bdynamicClientOnly\s*\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gs
const DYNAMIC_CLIENT_ONLY_NAMED_PATTERN =
  /\bdynamicClientOnlyNamed\s*\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gs
const LAZY_CLIENT_ONLY_PATTERN =
  /\blazyClientOnly\s*\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gs
const NEXT_DYNAMIC_IMPORT_SOURCE_PATTERN = /from\s*['"]next\/dynamic['"]/
const REACT_IMPORT_PATTERN = /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function isTestSourceFile(relativePath) {
  return (
    relativePath.endsWith('.test.ts') ||
    relativePath.endsWith('.test.tsx') ||
    relativePath.endsWith('.integration.test.ts') ||
    relativePath.endsWith('.integration.test.tsx')
  )
}

function walkDirectory(currentPath, onFile) {
  const entries = readdirSync(currentPath, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name)
    if (entry.isDirectory()) {
      walkDirectory(absolutePath, onFile)
      continue
    }

    if (entry.isFile()) {
      onFile(absolutePath)
    }
  }
}

function collectMatches(pattern, strategy, importer, content) {
  return Array.from(content.matchAll(pattern), (match) => ({
    importer,
    imported: match[1],
    strategy,
  }))
}

export function collectCodeSplittingUsage(content, importer) {
  return [
    ...collectMatches(DYNAMIC_IMPORT_PATTERN, 'next-dynamic', importer, content),
    ...collectMatches(REACT_LAZY_PATTERN, 'react-lazy', importer, content),
    ...collectMatches(DYNAMIC_CLIENT_ONLY_PATTERN, 'dynamic-client-only', importer, content),
    ...collectMatches(
      DYNAMIC_CLIENT_ONLY_NAMED_PATTERN,
      'dynamic-client-only-named',
      importer,
      content
    ),
    ...collectMatches(LAZY_CLIENT_ONLY_PATTERN, 'lazy-client-only', importer, content),
  ]
}

function isApprovedUsage(usage) {
  return APPROVED_CODE_SPLIT_POINTS.some(
    (approvedUsage) =>
      approvedUsage.importer === usage.importer &&
      approvedUsage.imported === usage.imported &&
      approvedUsage.strategy === usage.strategy
  )
}

function formatViolation(usage) {
  if (usage.importer.startsWith('src/app/')) {
    return `Disallowed ${usage.strategy} split in ${usage.importer} for "${usage.imported}": route files should statically import primary sections; reserve splitting for approved heavy client-only modules.`
  }

  return `Disallowed ${usage.strategy} split in ${usage.importer} for "${usage.imported}": use a static import unless this module is an approved heavy client-only or progressive-enhancement boundary.`
}

export function evaluateCodeSplittingUsage(usages) {
  return usages.filter((usage) => !isApprovedUsage(usage)).map(formatViolation)
}

function hasReactLazyImport(content) {
  for (const match of content.matchAll(REACT_IMPORT_PATTERN)) {
    const bindings = match[1]
      .split(',')
      .map((binding) =>
        binding
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim()
      )
      .filter(Boolean)

    if (bindings.includes('lazy')) {
      return true
    }
  }

  return false
}

export function collectRuntimeBoundaryImports(content, importer) {
  const usages = []

  if (NEXT_DYNAMIC_IMPORT_SOURCE_PATTERN.test(content)) {
    usages.push({ importer, kind: 'next-dynamic-import' })
  }

  if (hasReactLazyImport(content)) {
    usages.push({ importer, kind: 'react-lazy-import' })
  }

  return usages
}

function formatRuntimeBoundaryViolation(usage) {
  if (usage.kind === 'next-dynamic-import') {
    return `Disallowed next/dynamic import in ${usage.importer}: import shared runtime-boundary helpers from src/shared/lib/loadable.ts instead of using next/dynamic directly.`
  }

  return `Disallowed react lazy import in ${usage.importer}: import shared runtime-boundary helpers from src/shared/lib/loadable.ts instead of using React.lazy directly.`
}

export function evaluateRuntimeBoundaryImports(usages) {
  return usages
    .filter((usage) => !APPROVED_RUNTIME_BOUNDARY_IMPORTERS.has(usage.importer))
    .map(formatRuntimeBoundaryViolation)
}

export function scanProjectCodeSplitting(projectRoot) {
  const sourceRoot = path.join(projectRoot, 'src')
  const usages = []

  walkDirectory(sourceRoot, (filePath) => {
    const extension = path.extname(filePath)
    if (extension !== '.ts' && extension !== '.tsx') {
      return
    }

    const relativePath = toPosixPath(path.relative(projectRoot, filePath))
    if (isTestSourceFile(relativePath)) {
      return
    }

    const content = readFileSync(filePath, 'utf8')
    usages.push(...collectCodeSplittingUsage(content, relativePath))
  })

  return evaluateCodeSplittingUsage(usages)
}

export function scanProjectRuntimeBoundaries(projectRoot) {
  const sourceRoot = path.join(projectRoot, 'src')
  const usages = []

  walkDirectory(sourceRoot, (filePath) => {
    const extension = path.extname(filePath)
    if (extension !== '.ts' && extension !== '.tsx') {
      return
    }

    const relativePath = toPosixPath(path.relative(projectRoot, filePath))
    if (isTestSourceFile(relativePath)) {
      return
    }

    const content = readFileSync(filePath, 'utf8')
    usages.push(...collectRuntimeBoundaryImports(content, relativePath))
  })

  return evaluateRuntimeBoundaryImports(usages)
}
