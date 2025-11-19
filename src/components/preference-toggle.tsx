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
  const copy = preferenceCopy[language] ?? preferenceCopy.id;
  const isDay = theme === "day";
  return (
    <div
      className={`rounded-3xl border p-6 transition ${
        isDay ? "border-[rgba(19,4,41,0.15)] bg-white text-[var(--mirror-ink)]" : "border-white/10 bg-gradient-to-r from-white/10 to-white/5 text-white"
      }`}
    >
      <span
        className={`text-xs uppercase tracking-[0.4em] ${isDay ? "text-[rgba(19,4,41,0.45)]" : "text-white/50"}`}
      >
        {copy.badge}
      </span>
      <h2 className="mt-2 text-3xl font-semibold">{copy.title}</h2>
      <p className={`mt-2 text-sm ${isDay ? "text-[rgba(19,4,41,0.7)]" : "text-white/70"}`}>{copy.description}</p>
      <div className={`mt-4 flex flex-wrap gap-3 text-xs ${isDay ? "text-[rgba(19,4,41,0.65)]" : "text-white/70"}`}>
        <button
          type="button"
          onClick={() => setTheme(theme === "night" ? "day" : "night")}
          className={`rounded-full border px-4 py-2 transition ${
            isDay ? "border-[rgba(19,4,41,0.2)] hover:border-[rgba(19,4,41,0.35)]" : "border-white/20 hover:border-white"
          }`}
        >
          {copy.modePrefix}: {theme === "night" ? "Night 🌙" : "Day ☀️"}
        </button>
        <button
          type="button"
          onClick={() => setLanguage(language === "id" ? "en" : "id")}
          className={`rounded-full border px-4 py-2 transition ${
            isDay ? "border-[rgba(19,4,41,0.2)] hover:border-[rgba(19,4,41,0.35)]" : "border-white/20 hover:border-white"
          }`}
        >
          {copy.languagePrefix}: {language === "id" ? "Indonesia" : "English"}
        </button>
      </div>
    </div>
  );
}
