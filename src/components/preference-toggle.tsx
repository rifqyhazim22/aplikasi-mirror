"use client";

import { usePreferences } from "@/contexts/preferences-context";

export function PreferenceTogglePanel() {
  const { theme, language, setTheme, setLanguage } = usePreferences();
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
        Teman dalam genggaman
      </span>
      <h2 className="mt-2 text-3xl font-semibold">Mirror siap menemani siang & malam 🌙✨</h2>
      <p className={`mt-2 text-sm ${isDay ? "text-[rgba(19,4,41,0.7)]" : "text-white/70"}`}>
        Kamu bisa mengatur mode malam/siang dan bahasa antarmuka supaya Mirror tetap terasa personal di setiap perangkat.
      </p>
      <div className={`mt-4 flex flex-wrap gap-3 text-xs ${isDay ? "text-[rgba(19,4,41,0.65)]" : "text-white/70"}`}>
        <button
          type="button"
          onClick={() => setTheme(theme === "night" ? "day" : "night")}
          className={`rounded-full border px-4 py-2 transition ${
            isDay ? "border-[rgba(19,4,41,0.2)] hover:border-[rgba(19,4,41,0.35)]" : "border-white/20 hover:border-white"
          }`}
        >
          Mode: {theme === "night" ? "Night 🌙" : "Day ☀️"}
        </button>
        <button
          type="button"
          onClick={() => setLanguage(language === "id" ? "en" : "id")}
          className={`rounded-full border px-4 py-2 transition ${
            isDay ? "border-[rgba(19,4,41,0.2)] hover:border-[rgba(19,4,41,0.35)]" : "border-white/20 hover:border-white"
          }`}
        >
          Bahasa: {language === "id" ? "Indonesia" : "English"}
        </button>
      </div>
    </div>
  );
}
