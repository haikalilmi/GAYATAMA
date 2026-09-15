"use client";

import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle({ className, compact }: { className?: string; compact?: boolean }) {
  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("iq-theme", next);
    } catch {
      // penyimpanan tidak tersedia, tema tetap berlaku untuk sesi ini
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark or light mode"
      className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition-all select-none hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] ${compact ? "h-10 w-10 p-0" : "px-3 py-2 text-xs font-medium"} ${className ?? ""}`}
    >
      <Moon className="h-4 w-4 text-slate-500 dark:hidden" />
      <Sun className="hidden h-4 w-4 text-amber-600 dark:block" />
      {compact ? null : (
        <>
          <span className="dark:hidden">Dark Mode</span>
          <span className="hidden dark:inline">Light Mode</span>
        </>
      )}
    </button>
  );
}
