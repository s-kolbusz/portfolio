import { create } from 'zustand'

export type CursorVariant = 'default' | 'button' | 'text' | 'project' | 'slider' | 'hidden'

interface CursorState {
  variant: CursorVariant
  text: string | null
  magneticTarget: HTMLElement | null
  setVariant: (variant: CursorVariant) => void
  setText: (text: string | null) => void
  setMagneticTarget: (target: HTMLElement | null) => void
}

export const useCursorStore = create<CursorState>((set) => ({
  variant: 'default',
  text: null,
  magneticTarget: null,
  setVariant: (variant) => set({ variant }),
  setText: (text) => set({ text }),
  setMagneticTarget: (magneticTarget) => set({ magneticTarget }),
}))
