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
