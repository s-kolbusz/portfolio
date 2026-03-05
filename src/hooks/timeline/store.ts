import { create } from 'zustand'

interface TimelineStore {
  sections: Set<string>
  register: (id: string) => void
  unregister: (id: string) => void
  has: (id: string) => boolean
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  sections: new Set(),
  register: (id) =>
    set((state) => {
      const next = new Set(state.sections)
      next.add(id)
      return { sections: next }
    }),
  unregister: (id) =>
    set((state) => {
      const next = new Set(state.sections)
      next.delete(id)
      return { sections: next }
    }),
  has: (id) => get().sections.has(id),
}))
