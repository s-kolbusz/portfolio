import { create } from 'zustand'

interface TimelineStore {
  sections: Set<string>
  register: (id: string) => void
  unregister: (id: string) => void
}

export const useTimelineStore = create<TimelineStore>((set) => ({
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
}))
