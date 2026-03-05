#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')
const KNOWN_LAYERS = new Set(['app', 'components', 'data', 'hooks', 'i18n', 'lib'])

const DISALLOWED_IMPORTS = {
  components: new Set(['app']),
  hooks: new Set(['app', 'components']),
  data: new Set(['app', 'components', 'hooks']),
  i18n: new Set(['app', 'components', 'hooks']),
  lib: new Set(['app']),
}

const IMPORT_EXPORT_PATTERN = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g
const DYNAMIC_IMPORT_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g

const errors = []

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

function collectImportSpecifiers(content) {
  const specifiers = []

  for (const pattern of [IMPORT_EXPORT_PATTERN, DYNAMIC_IMPORT_PATTERN]) {
    for (const match of content.matchAll(pattern)) {
      const specifier = match[1]
      if (specifier) {
        specifiers.push(specifier)
      }
    }
  }

  return specifiers
}

function resolveLayerForFile(relativePath) {
  const [layer] = relativePath.split('/')
  if (!layer || !KNOWN_LAYERS.has(layer)) {
    return null
  }
  return layer
}

function resolveImportedLayer(specifier, importerAbsolutePath) {
  if (specifier.startsWith('@/')) {
    const [layer] = specifier.slice(2).split('/')
    if (KNOWN_LAYERS.has(layer)) {
      return layer
    }
    return null
  }

  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return null
  }

  const importedAbsolutePath = path.resolve(path.dirname(importerAbsolutePath), specifier)
  if (!importedAbsolutePath.startsWith(SRC_ROOT)) {
    return null
  }

  const importedRelativePath = toPosixPath(path.relative(SRC_ROOT, importedAbsolutePath))
  return resolveLayerForFile(importedRelativePath)
}

function checkArchitectureForFile(filePath) {
  const extension = path.extname(filePath)
  if (extension !== '.ts' && extension !== '.tsx') {
    return
  }

  const relativePath = toPosixPath(path.relative(SRC_ROOT, filePath))
  const currentLayer = resolveLayerForFile(relativePath)
  if (!currentLayer) {
    return
  }

  const content = readFileSync(filePath, 'utf8')
  const importedSpecifiers = collectImportSpecifiers(content)
  const blockedLayers = DISALLOWED_IMPORTS[currentLayer]

  if (!blockedLayers || blockedLayers.size === 0) {
    return
  }

  for (const specifier of importedSpecifiers) {
    const importedLayer = resolveImportedLayer(specifier, filePath)
    if (!importedLayer) {
      continue
    }

    if (!blockedLayers.has(importedLayer)) {
      continue
    }

    errors.push(
      `Import boundary violation in src/${relativePath}: "${specifier}" is not allowed for "${currentLayer}" layer`
    )
  }
}

walkDirectory(SRC_ROOT, checkArchitectureForFile)

if (errors.length > 0) {
  console.error(`check:architecture failed with ${errors.length} issue(s):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('check:architecture passed')
