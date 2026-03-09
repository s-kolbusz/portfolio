'use client'

import { useEffect, useState, useRef } from 'react'

import { usePathname } from '@/i18n/navigation'
import { isHomeRoute } from '@/lib/route-predicates'

export function useActiveSection(sectionIds: string[]) {
  const pathname = usePathname()

  const [activeSection, setActiveSection] = useState<string>('')

  // Use refs to persist observers and tracked IDs across effect runs
  const observedIds = useRef<Set<string>>(new Set())
  const intersectionObserver = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Only run on the homepage
    const isHome = isHomeRoute(pathname)
    if (!isHome) return

    // Set initial hash if present
    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '')
      if (sectionIds.includes(hashId)) {
        setTimeout(() => setActiveSection(hashId), 0)
      }
    }

    const setupObserver = () => {
      if (!intersectionObserver.current) {
        intersectionObserver.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(entry.target.id)
              }
            })
          },
          {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0,
          }
        )
      }

      const newElements = sectionIds
        .filter((id) => !observedIds.current.has(id))
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]

      newElements.forEach((el) => {
        intersectionObserver.current?.observe(el)
        observedIds.current.add(el.id)
      })

      // Return true if all requested sections are now being observed
      return observedIds.current.size === sectionIds.length
    }

    // Initial check to see if elements are already in DOM
    const allFound = setupObserver()

    // If not all elements found, use MutationObserver to watch for their appearance
    let mutationObserver: MutationObserver | null = null
    if (!allFound) {
      mutationObserver = new MutationObserver(() => {
        const allFoundNow = setupObserver()
        if (allFoundNow) {
          mutationObserver?.disconnect()
        }
      })

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }

    const currentObservedIds = observedIds.current

    return () => {
      mutationObserver?.disconnect()
      intersectionObserver.current?.disconnect()
      intersectionObserver.current = null
      currentObservedIds.clear()
    }
  }, [pathname, sectionIds])

  // Clear active section if not on home
  const isHome = isHomeRoute(pathname)
  return isHome ? activeSection : ''
}
