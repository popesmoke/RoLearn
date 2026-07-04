"use client";

import { useEffect } from "react";

export const STORAGE_KEY = "rolearn-theme";
export type Theme = "light" | "dark";

const LIGHT_VARS: Record<string, string> = {
  "--background": "#f5f5f8",
  "--foreground": "#1a1a22",
  "--muted": "#5c5c6e",
  "--subtle": "#888899",
  "--surface": "#ffffff",
  "--surface-elevated": "#f0f0f5",
  "--surface-hover": "#e8e8ef",
  "--border": "#d8d8e4",
};

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  for (const key of Object.keys(LIGHT_VARS)) {
    if (theme === "light") {
      document.documentElement.style.setProperty(key, LIGHT_VARS[key]);
    } else {
      document.documentElement.style.removeProperty(key);
    }
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    applyTheme(saved === "light" ? "light" : "dark");
  }, []);

  return <>{children}</>;
}
