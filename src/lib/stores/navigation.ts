import { create } from 'zustand'

type ProjectOrigin = 'projects' | null

interface NavigationStore {
  projectOrigin: ProjectOrigin
  setProjectOrigin: (origin: ProjectOrigin) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  projectOrigin: null,
  setProjectOrigin: (origin) => set({ projectOrigin: origin }),
}))
