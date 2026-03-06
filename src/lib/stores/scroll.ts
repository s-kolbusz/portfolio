import type Lenis from 'lenis'
import { create } from 'zustand'

interface ScrollStore {
  lenis: Lenis | null
  setLenis: (lenis: Lenis | null) => void
}

export const useScrollStore = create<ScrollStore>((set) => ({
  lenis: null,
  setLenis: (lenis) => set({ lenis }),
}))
