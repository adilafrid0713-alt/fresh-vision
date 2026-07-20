import { create } from 'zustand';

interface ThemeState {
  theme: 'dark';
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
