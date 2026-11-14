type FaqEntry = { question: string; answer: string }

function isFaqEntry(value: unknown): value is FaqEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return typeof entry.question === 'string' && typeof entry.answer === 'string'
}

/**
 * The keys of a messages `faq` object (`t.raw('faq')`), in order, keeping only
 * well-formed entries. Each locale carries its own list, so the count is read
 * from the messages instead of being fixed in the component; and messages are
 * external data, so a malformed entry is dropped rather than rendered as a raw
 * key.
 */
export function getFaqKeys(raw: unknown): string[] {
  if (typeof raw !== 'object' || raw === null) return []

  return Object.entries(raw)
    .filter(([, value]) => isFaqEntry(value))
    .map(([key]) => key)
}
