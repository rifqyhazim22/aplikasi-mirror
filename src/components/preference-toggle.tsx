"use client";

import { usePreferences } from "@/contexts/preferences-context";

const preferenceCopy = {
  id: {
    badge: "Teman dalam genggaman",
    title: "Mirror siap menemani siang & malam 🌙✨",
    description: "Atur mode malam/siang dan bahasa supaya Mirror tetap personal di semua perangkat.",
    modePrefix: "Mode",
    languagePrefix: "Bahasa",
  },
  en: {
    badge: "Mirror in your hands",
    title: "Mirror adapts to night & day 🌙✨",
    description: "Toggle theme and language so the experience stays personal on every device.",
    modePrefix: "Mode",
    languagePrefix: "Language",
  },
} as const;

export function PreferenceTogglePanel() {
  const { theme, language, setTheme, setLanguage } = usePreferences();
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLanguage(language === "id" ? "en" : "id")}
        className="glass-card flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 group bg-[#111e21]/40 hover:bg-[#111e21]/60"
        title={language === "id" ? "Ganti ke Bahasa Inggris" : "Switch to Indonesian"}
      >
        <span className="text-white text-sm font-bold tracking-wider">{language === "id" ? "ID" : "EN"}</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme(theme === "night" ? "day" : "night")}
        className="glass-card flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 text-xl group bg-[#111e21]/40 hover:bg-[#111e21]/60 text-white"
        title={theme === "night" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "night" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
