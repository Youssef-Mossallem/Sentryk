import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: any;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: true, // افتراضياً دارك مود لأنه "أشيك"
      toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'theme-storage' }
  )
);