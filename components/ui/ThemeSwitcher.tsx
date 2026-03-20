"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4 z-100">
      <button
        onClick={toggleTheme}
        className="
        flex items-center gap-2
        p-4 rounded-full
        bg-background
        text-foreground
        border border-foreground/20
        transition
        cursor-pointer
      "
      >
        {theme === "light" && <Sun size={24} className="text-yellow-500" />}
        {theme === "dark" && <Moon size={24} className="text-blue-500" />}
        {theme === "system" && <Laptop size={24} className="text-foreground" />}
      </button>
    </div>
  );
}
