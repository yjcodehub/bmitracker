import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  gymName: string;
  isDark: boolean;
  setTheme: (theme: Partial<Pick<ThemeState, 'primaryColor' | 'secondaryColor' | 'gymName'>>) => void;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColor: '#F97316',
      secondaryColor: '#0A0A0A',
      gymName: 'FitZone Gym',
      isDark: false,
      setTheme: (theme) => set((state) => ({ ...state, ...theme })),
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'bmi-theme' }
  )
);
