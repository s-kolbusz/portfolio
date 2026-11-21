import { useCallback, useEffect, useState } from 'react'

export interface Visit {
  /** time to the first byte of this page on this visit, ms */
  ms: number | null
  /** time until the whole page had loaded, s */
  s: number | null
}

/**
 * What this visit measured, from the browser's own navigation timing (act 4's live proofs).
 * `again` times a fresh request for this page now, for a visitor who wants to check once more.
 */
export function useVisit() {
  const [visit, setVisit] = useState<Visit>({ ms: null, s: null })
  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined
      if (!nav) return
      setVisit({
        ms: Math.max(1, Math.round(nav.responseStart - nav.startTime)),
        s: nav.loadEventEnd > 0 ? Math.round((nav.loadEventEnd - nav.startTime) / 100) / 10 : null,
      })
    }
    read()
    if (document.readyState === 'complete') return
    const later = () => setTimeout(read, 0)
    window.addEventListener('load', later, { once: true })
    return () => window.removeEventListener('load', later)
  }, [])
  const again = useCallback(async () => {
    const t0 = performance.now()
    try {
      await fetch(location.href, { method: 'HEAD', cache: 'no-store' })
    } catch {
      return
    }
    setVisit((v) => ({ ...v, ms: Math.max(1, Math.round(performance.now() - t0)) }))
  }, [])
  return { visit, again }
}
