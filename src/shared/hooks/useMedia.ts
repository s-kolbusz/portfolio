import { useCallback, useSyncExternalStore } from 'react'

export const useMedia = (mediaString: string) =>
  useSyncExternalStore(
    useCallback(
      (callback: () => void) => {
        const mediaQuery = window.matchMedia(mediaString)
        mediaQuery.addEventListener('change', callback)
        return () => mediaQuery.removeEventListener('change', callback)
      },
      [mediaString]
    ),
    () => window.matchMedia(mediaString).matches,
    () => false
  )

export const useIsMobile = () => useMedia('(max-width: 767px)')
export const useIsTablet = () => useMedia('(min-width: 768px) and (max-width: 1023px)')
export const useIsDesktop = () => useMedia('(min-width: 1024px)')
export const usePrefersReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
