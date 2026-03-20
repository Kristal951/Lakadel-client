"use client";

import {
  FiSun,
  FiMoon,
  FiMonitor,
  FiCheck,
  FiLayout,
  FiType,
  FiChevronDown,
  FiGlobe,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import useUserStore from "@/store/userStore";
import { countries } from "@/lib";
import { User } from "@/store/types";

type ThemeMode = "light" | "dark" | "system";
type AccentId = "indigo" | "rose" | "emerald" | "amber" | "slate";
type FontScale = 1 | 2 | 3;

const ACCENTS: { id: AccentId; bg: string; hex: string }[] = [
  { id: "indigo", bg: "bg-indigo-600", hex: "#4f46e5" },
  { id: "rose", bg: "bg-rose-600", hex: "#e11d48" },
  { id: "emerald", bg: "bg-emerald-600", hex: "#059669" },
  { id: "amber", bg: "bg-amber-600", hex: "#d97706" },
  { id: "slate", bg: "bg-slate-900", hex: "#0f172a" },
];

export default function AppearanceTab({ user }: { user: User | null }) {
  const { currency, setCurrency } = useUserStore();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("ui:theme") as ThemeMode) || "system";
  });

  const [accent, setAccent] = useState<AccentId>(() => {
    if (typeof window === "undefined") return "indigo";
    return (localStorage.getItem("ui:accent") as AccentId) || "indigo";
  });

  const [fontScale, setFontScale] = useState<FontScale>(() => {
    if (typeof window === "undefined") return 2;
    const saved = Number(localStorage.getItem("ui:fontScale") || "2");
    return ([1, 2, 3].includes(saved) ? saved : 2) as FontScale;
  });

  const themes = useMemo(
    () => [
      { id: "light" as const, name: "Light Mode", icon: FiSun, colors: "bg-white border-slate-200" },
      { id: "dark" as const, name: "Dark Mode", icon: FiMoon, colors: "bg-slate-900 border-slate-800" },
      { id: "system" as const, name: "System", icon: FiMonitor, colors: "bg-gradient-to-r from-white to-slate-900 border-slate-200" },
    ],
    [],
  );

  // apply + persist theme
  useEffect(() => {
    localStorage.setItem("ui:theme", theme);

    const root = document.documentElement;
    const apply = (isDark: boolean) => root.classList.toggle("dark", isDark);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);

      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }

    apply(theme === "dark");
  }, [theme]);

  // apply + persist accent
  useEffect(() => {
    localStorage.setItem("ui:accent", accent);
    const found = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
    document.documentElement.style.setProperty("--accent", found.hex);
  }, [accent]);

  // apply + persist font scale
  useEffect(() => {
    localStorage.setItem("ui:fontScale", String(fontScale));
    document.documentElement.setAttribute("data-font", String(fontScale));
  }, [fontScale]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Theme Selector */}
      <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-foreground/30 bg-background">
          <h2 className="text-xl font-bold text-foreground">Interface Theme</h2>
          <p className="text-sm text-foreground/60 font-medium">
            Customize how Lakadel looks on your device.
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex flex-col gap-3 group text-left focus:outline-none"
              type="button"
            >
              <div
                className={clsx(
                  "relative h-32 w-full rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                  t.colors,
                  theme === t.id
                    ? "ring-4 ring-(--accent)/10 border-(--accent) shadow-lg"
                    : "border-transparent group-hover:border-slate-300",
                )}
              >
                <div className="p-3 space-y-2">
                  <div className={clsx("h-2 w-2/3 rounded-full opacity-20", t.id === "light" ? "bg-slate-900" : "bg-white")} />
                  <div className={clsx("h-2 w-1/2 rounded-full opacity-10", t.id === "light" ? "bg-slate-900" : "bg-white")} />

                  <div className="mt-4 grid grid-cols-3 gap-1">
                    <div className="h-6 rounded-md bg-(--accent)/40" />
                    <div className="h-6 rounded-md bg-(--accent)/40" />
                  </div>
                </div>

                {theme === t.id && (
                  <div className="absolute inset-0 bg-(--accent)/5 flex items-center justify-center">
                    <div className="bg-white text-(--accent) p-1.5 rounded-full shadow-md">
                      <FiCheck size={14} />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-1 flex items-center justify-between">
                <span
                  className={clsx(
                    "text-sm font-bold transition-colors",
                    theme === t.id ? "text-(--accent)" : "text-slate-600",
                  )}
                >
                  {t.name}
                </span>
                <t.icon
                  size={14}
                  className={theme === t.id ? "text-(--accent)" : "text-slate-400"}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Accent + Font + Localization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Accent Picker */}
        <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-(--accent)/10 rounded-xl text-(--accent)">
              <FiLayout size={20} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Accent Color</h3>
          </div>

          <div className="flex flex-wrap gap-4">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
                  a.bg,
                  accent === a.id
                    ? "ring-4 ring-offset-2 ring-(--accent)/30 shadow-lg"
                    : "",
                )}
                type="button"
                aria-label={`Set accent ${a.id}`}
              >
                {accent === a.id && <FiCheck className="text-white" />}
              </button>
            ))}
          </div>
        </section>

        {/* Font Scaling */}
        <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-foreground/10 rounded-xl text-foreground">
              <FiType size={20} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Font Scaling</h3>
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value) as FontScale)}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-(--accent)"
          />

          <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Compact</span>
            <span>Standard</span>
            <span>Large</span>
          </div>
        </section>

        {/* Localization */}
        <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm p-8 flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <FiGlobe size={20} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Localization</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Display Currency
              </label>

              <div className="relative group">
                <select
                  value={currency}
                  onChange={(e) => {
                    const code = e.target.value;
                    const selected = countries.find((c) => c.currency === code);
                    if (!selected) return;
                    setCurrency(selected.currency);
                  }}
                  className="w-full appearance-none bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent) transition-all cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.currency} className="text-slate-900">
                      {c.name} ({c.symbol} {c.currency})
                    </option>
                  ))}
                </select>

                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-(--accent)/10 rounded-2xl border border-(--accent)/20">
            <p className="text-[11px] text-foreground/80 leading-relaxed font-medium">
              <strong>Note:</strong> Display currency is for your convenience.
              All checkouts are processed in <strong>NGN</strong>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}