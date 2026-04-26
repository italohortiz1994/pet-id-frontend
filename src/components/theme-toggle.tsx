"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

function SunIcon() {
  return (
    <svg aria-hidden="true" className="theme-toggle__icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="theme-toggle__icon" viewBox="0 0 24 24">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
    </svg>
  );
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = mode === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("theme-light", mode === "light");
  document.body.classList.toggle("theme-light", mode === "light");
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    return window.localStorage.getItem("pet-id-theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  function toggleTheme() {
    setMode((currentMode) => {
      const nextMode = currentMode === "dark" ? "light" : "dark";

      try {
        window.localStorage.setItem("pet-id-theme", nextMode);
      } catch {
        // Ignore storage failures and still switch the visible theme.
      }
      applyTheme(nextMode);

      return nextMode;
    });
  }

  const isLight = mode === "light";

  return (
    <button
      aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
      aria-pressed={isLight}
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isLight ? <SunIcon /> : <MoonIcon />}
        </span>
      </span>
      <span className="theme-toggle__label">{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
