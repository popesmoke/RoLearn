"use client";

import { useEffect, useState } from "react";
import { Icon8 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { applyTheme, STORAGE_KEY, type Theme } from "@/components/theme-provider";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon8 name="settings" size={20} />
    </Button>
  );
}
