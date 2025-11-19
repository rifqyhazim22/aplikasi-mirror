"use client";

import { usePreferences } from "@/contexts/preferences-context";

export function PreferenceTogglePanel() {
  const { theme, language, setTheme, setLanguage } = usePreferences();
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 p-6 text-white">
      <span className="text-xs uppercase tracking-[0.4em] text-white/50">Teman dalam genggaman</span>
      <h2 className="mt-2 text-3xl font-semibold">Mirror siap menemani siang & malam 🌙✨</h2>
      <p className="mt-2 text-sm text-white/70">
        Kamu bisa mengatur mode malam/siang dan bahasa antarmuka supaya Mirror tetap terasa personal di setiap perangkat.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/70">
        <button
          type="button"
          onClick={() => setTheme(theme === "night" ? "day" : "night")}
          className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white"
        >
          Mode: {theme === "night" ? "Night 🌙" : "Day ☀️"}
        </button>
        <button
          type="button"
          onClick={() => setLanguage(language === "id" ? "en" : "id")}
          className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white"
        >
          Bahasa: {language === "id" ? "Indonesia" : "English"}
        </button>
      </div>
    </div>
  );
}
