import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

export const APPROVED_CODE_SPLIT_POINTS = [
  {
    importer: 'src/components/sections/Hero.tsx',
    imported: '@/components/canvas/HeroScene',
    strategy: 'react-lazy',
    reason: 'WebGL scene is a heavy client-only enhancement and is gated by reduced-motion checks.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/overlays/CustomCursor',
    strategy: 'next-dynamic',
    reason: 'Custom cursor is a non-critical pointer enhancement mounted after hydration.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/shared/ui/SmoothScroller',
    strategy: 'next-dynamic',
    reason:
      'Smooth scrolling is a progressive enhancement and should stay out of the critical path.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/components/DockNav',
    strategy: 'next-dynamic',
    reason: 'Dock navigation is deferred as a non-critical home-page enhancement.',
  },
  {
    importer: 'src/features/navigation/overlays/ClientOverlays.tsx',
    imported: '@/features/navigation/components/SettingsDock',
    strategy: 'next-dynamic',
    reason: 'Settings dock is deferred as a non-critical home-page enhancement.',
  },
]

const DYNAMIC_IMPORT_PATTERN = /\bdynamic\s*\(\s*\(\s*\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/gs
const REACT_LAZY_PATTERN = /\blazy\s*\(\s*\(\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)\s*\)/gs

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
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

export function scanProjectCodeSplitting(projectRoot) {
  const sourceRoot = path.join(projectRoot, 'src')
  const usages = []

  walkDirectory(sourceRoot, (filePath) => {
    const extension = path.extname(filePath)
    if (extension !== '.ts' && extension !== '.tsx') {
      return
    }

    const relativePath = toPosixPath(path.relative(projectRoot, filePath))
    const content = readFileSync(filePath, 'utf8')
    usages.push(...collectCodeSplittingUsage(content, relativePath))
  })

  return evaluateCodeSplittingUsage(usages)
}
