import { create } from "zustand"

interface SidebarState {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
}

export const useSidebar = create<SidebarState>((set) => ({
  expanded: true,
  setExpanded: (expanded) => set({ expanded }),
}))
