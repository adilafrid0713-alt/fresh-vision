import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const getInitialThemeMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem('freshvision_theme_mode') as ThemeMode;
    if (saved && ['dark', 'light', 'system'].includes(saved)) return saved;
  } catch {}
  return 'dark';
};

const applyThemeToDOM = (mode: ThemeMode) => {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
};

const initialMode = getInitialThemeMode();
applyThemeToDOM(initialMode);

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: initialMode,
  sidebarOpen: true,
  setThemeMode: (mode) => {
    try {
      localStorage.setItem('freshvision_theme_mode', mode);
      applyThemeToDOM(mode);
    } catch (e) {
      console.error('Failed to set theme mode', e);
    }
    set({ themeMode: mode });
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
