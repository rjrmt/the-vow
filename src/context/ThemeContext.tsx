"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo } from "react";

export type ThemeId = "light" | "dark" | "blush";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEMES: ThemeId[] = ["light", "dark", "blush"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeId>("light");
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("the-vow-theme") as ThemeId | null;
    if (stored && THEMES.includes(stored)) {
      setThemeState(stored);
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("the-vow-theme", theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, cycleTheme }),
    [theme, setTheme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
