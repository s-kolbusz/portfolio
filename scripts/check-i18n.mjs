import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EXPECTED_TOP_LEVEL_NAMESPACES = [
  'about',
  'actions',
  'calculator',
  'contact',
  'footer',
  'hero',
  'metadata',
  'nav',
  'notFound',
  'resume',
  'services',
  'work',
]

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

function readMessages(locale) {
  const filePath = path.join(projectRoot, 'src', 'i18n', 'messages', `${locale}.json`)
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function isMessageTree(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectLeafPaths(tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key

    if (isMessageTree(value)) {
      return collectLeafPaths(value, nextPath)
    }

    return [nextPath]
  })
}

function collectObjectPaths(tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key

    if (isMessageTree(value)) {
      return [nextPath, ...collectObjectPaths(value, nextPath)]
    }

    return [nextPath]
  })
}

function isCamelCaseSegment(segment) {
  return /^\d+$/.test(segment) || /^[a-z][a-zA-Z0-9]*$/.test(segment)
}

function collectInvalidKeyPaths(tree) {
  return collectObjectPaths(tree).filter((keyPath) =>
    keyPath.split('.').some((segment) => !isCamelCaseSegment(segment))
  )
}

function diffTopLevelNamespaces(messages) {
  const actual = new Set(Object.keys(messages))
  const expected = new Set(EXPECTED_TOP_LEVEL_NAMESPACES)

  return {
    extra: [...actual].filter((key) => !expected.has(key)).sort(),
    missing: [...expected].filter((key) => !actual.has(key)).sort(),
  }
}

function diffLeafPaths(reference, candidate) {
  const referencePaths = new Set(collectLeafPaths(reference))
  const candidatePaths = new Set(collectLeafPaths(candidate))

  return {
    extra: [...candidatePaths].filter((keyPath) => !referencePaths.has(keyPath)).sort(),
    missing: [...referencePaths].filter((keyPath) => !candidatePaths.has(keyPath)).sort(),
  }
}

const enMessages = readMessages('en')
const plMessages = readMessages('pl')
const problems = []

for (const [locale, messages] of [
  ['en', enMessages],
  ['pl', plMessages],
]) {
  const namespaceDiff = diffTopLevelNamespaces(messages)
  if (namespaceDiff.extra.length || namespaceDiff.missing.length) {
    problems.push(
      `${locale}: unexpected top-level namespaces (extra: ${namespaceDiff.extra.join(', ') || 'none'}; missing: ${namespaceDiff.missing.join(', ') || 'none'})`
    )
  }

  const invalidKeys = collectInvalidKeyPaths(messages)
  if (invalidKeys.length) {
    problems.push(`${locale}: non-camelCase keys found (${invalidKeys.join(', ')})`)
  }
}

const parityDiff = diffLeafPaths(enMessages, plMessages)
if (parityDiff.extra.length || parityDiff.missing.length) {
  problems.push(
    `locale parity mismatch (extra in pl: ${parityDiff.extra.join(', ') || 'none'}; missing in pl: ${parityDiff.missing.join(', ') || 'none'})`
  )
}

if (problems.length) {
  console.error('i18n contract check failed:')
  for (const problem of problems) {
    console.error(`- ${problem}`)
  }
  process.exit(1)
}

console.log('i18n contract check passed')
