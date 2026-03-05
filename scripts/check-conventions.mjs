#!/usr/bin/env node

import { readdirSync } from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PASCAL_CASE_PATTERN = /^[A-Z][A-Za-z0-9]*$/
const ROOT_HOOK_PATTERN = /^use[A-Z][A-Za-z0-9]*$/

const errors = []

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function isAllowedDirectoryName(name) {
  return (
    KEBAB_CASE_PATTERN.test(name) ||
    /^\[[^/\]]+\]$/.test(name) ||
    /^\[\[[^/\]]+\]\]$/.test(name) ||
    /^\([^/]+\)$/.test(name) ||
    /^@[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
  )
}

function isTestFileBaseName(baseName) {
  return baseName.endsWith('.test') || baseName.endsWith('.integration.test')
}

function stripKnownTestSuffix(baseName) {
  if (baseName.endsWith('.integration.test')) {
    return baseName.slice(0, -'.integration.test'.length)
  }

  if (baseName.endsWith('.test')) {
    return baseName.slice(0, -'.test'.length)
  }

  return baseName
}

function walkDirectory(currentPath) {
  const entries = readdirSync(currentPath, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name)
    const relativePath = toPosixPath(path.relative(SRC_ROOT, absolutePath))

    if (entry.isDirectory()) {
      if (!isAllowedDirectoryName(entry.name)) {
        errors.push(
          `Directory names must be lowercase-kebab (or Next route segments): src/${relativePath}`
        )
      }
      walkDirectory(absolutePath)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = path.extname(entry.name)
    if (extension !== '.ts' && extension !== '.tsx') {
      continue
    }

    const baseName = path.basename(entry.name, extension)

    if (
      relativePath.startsWith('components/') &&
      extension === '.tsx' &&
      !isTestFileBaseName(baseName) &&
      !PASCAL_CASE_PATTERN.test(baseName)
    ) {
      errors.push(`Component files must use PascalCase in src/components: src/${relativePath}`)
    }

    if (
      path.dirname(relativePath) === 'hooks' &&
      !isTestFileBaseName(baseName) &&
      !ROOT_HOOK_PATTERN.test(baseName)
    ) {
      errors.push(`Root shared hook files must use useX naming: src/${relativePath}`)
    }

    if (
      extension === '.ts' &&
      (relativePath.startsWith('data/') ||
        relativePath.startsWith('i18n/') ||
        relativePath.startsWith('lib/'))
    ) {
      const normalizedName = stripKnownTestSuffix(baseName)
      if (!KEBAB_CASE_PATTERN.test(normalizedName)) {
        errors.push(
          `Data/lib/i18n TypeScript modules must use kebab-case file names: src/${relativePath}`
        )
      }
    }
  }
}

walkDirectory(SRC_ROOT)

if (errors.length > 0) {
  console.error(`check:conventions failed with ${errors.length} issue(s):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('check:conventions passed')
