import { useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type ColorTheme = "green" | "blue" | "purple";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialColorTheme(): ColorTheme {
  if (typeof window === "undefined") return "green";
  return (localStorage.getItem("color-theme") as ColorTheme) || "green";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(getInitialColorTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggleTheme, colorTheme, setColorTheme };
}
