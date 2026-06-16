'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const primaryColor = useThemeStore((s) => s.primaryColor);
  const secondaryColor = useThemeStore((s) => s.secondaryColor);

  useEffect(() => {
    try {
      const hslPrimary = hexToHsl(primaryColor);
      const hslSecondary = hexToHsl(secondaryColor);

      document.documentElement.style.setProperty('--primary', hslPrimary);
      document.documentElement.style.setProperty('--ring', hslPrimary);
      document.documentElement.style.setProperty('--secondary', hslSecondary);

      const parts = hslPrimary.split(' ');
      if (parts.length === 3) {
        const h = parts[0];
        const s = parts[1];
        document.documentElement.style.setProperty('--accent', `${h} ${s} 95%`);
        document.documentElement.style.setProperty('--accent-foreground', `${h} ${s} 40%`);
      }
    } catch (e) {
      console.error('Failed to parse theme colors:', e);
    }
  }, [primaryColor, secondaryColor]);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
