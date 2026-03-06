'use client'

import { useEffect } from 'react'

export function useFocusTrap<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !ref.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = ref.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as T
      const lastElement = focusableElements[focusableElements.length - 1] as T

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, ref])
}
