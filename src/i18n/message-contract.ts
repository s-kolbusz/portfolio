export type MessageValue = MessageTree | string

export interface MessageTree {
  [key: string]: MessageValue
}

export const EXPECTED_TOP_LEVEL_NAMESPACES = [
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
] as const

export function isMessageTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function collectLeafPaths(tree: MessageTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key

    if (isMessageTree(value)) {
      return collectLeafPaths(value, nextPath)
    }

    return [nextPath]
  })
}

function collectObjectPaths(tree: MessageTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key

    if (isMessageTree(value)) {
      return [nextPath, ...collectObjectPaths(value, nextPath)]
    }

    return [nextPath]
  })
}

export function isCamelCaseSegment(segment: string) {
  return /^\d+$/.test(segment) || /^[a-z][a-zA-Z0-9]*$/.test(segment)
}

export function collectInvalidKeyPaths(tree: MessageTree) {
  return collectObjectPaths(tree).filter((path) =>
    path.split('.').some((segment) => !isCamelCaseSegment(segment))
  )
}

export function getTopLevelNamespaceDiff(tree: MessageTree) {
  const actual = Object.keys(tree).sort()
  const expected = new Set<string>(EXPECTED_TOP_LEVEL_NAMESPACES)

  return {
    extra: actual.filter((key) => !expected.has(key)),
    missing: [...expected].filter((key) => !actual.includes(key)).sort(),
  }
}

export function getLeafPathParity(reference: MessageTree, candidate: MessageTree) {
  const referenceLeafPaths = new Set(collectLeafPaths(reference))
  const candidateLeafPaths = new Set(collectLeafPaths(candidate))

  return {
    extra: [...candidateLeafPaths].filter((path) => !referenceLeafPaths.has(path)).sort(),
    missing: [...referenceLeafPaths].filter((path) => !candidateLeafPaths.has(path)).sort(),
  }
}
