'use client'

import { useEffect, useState } from 'react'

import { usePathname } from '@/i18n/navigation'
import { isHomeRoute } from '@/lib/route-predicates'

export function useActiveSection(sectionIds: string[]) {
  const pathname = usePathname()

  const [activeSection, setActiveSection] = useState<string>('')

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

    let observer: IntersectionObserver | null = null
    let intervalId: NodeJS.Timeout | null = null

    const init = () => {
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]

      if (elements.length > 0) {
        if (!observer) {
          observer = new IntersectionObserver(
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

        elements.forEach((el) => observer?.observe(el))

        // If we found all of them, we can stop polling
        if (elements.length === sectionIds.length && intervalId) {
          clearInterval(intervalId)
        }
        return true
      }
      return false
    }

    // Try to init immediately
    const initialized = init()

    if (!initialized) {
      intervalId = setInterval(init, 250)
    }

    // Safety timeout to stop polling
    const timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId)
    }, 5000)

    return () => {
      observer?.disconnect()
      if (intervalId) clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [pathname, sectionIds])

  // Clear active section if not on home
  const isHome = isHomeRoute(pathname)
  return isHome ? activeSection : ''
}
