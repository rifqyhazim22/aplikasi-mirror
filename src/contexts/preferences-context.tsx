"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "night" | "day";
type Language = "id" | "en";

type PreferencesContextValue = {
  theme: Theme;
  language: Language;
  setTheme: (value: Theme) => void;
  setLanguage: (value: Language) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const STORAGE_KEY = "mirror-preferences-v1";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const initial = readInitialPreferences();
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [language, setLanguage] = useState<Language>(initial.language);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ theme: Theme; language: Language }>;
        if (parsed.theme && parsed.theme !== theme) setTheme(parsed.theme);
        if (parsed.language && parsed.language !== language) setLanguage(parsed.language);
      }
    } catch (error) {
      console.warn("Gagal memuat preferensi", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, language }));
    } catch (error) {
      console.warn("Gagal menyimpan preferensi", error);
    }
  }, [theme, language]);

  const value = useMemo(
    () => ({
      theme,
      language,
      setTheme,
      setLanguage,
    }),
    [theme, language],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences harus dipakai di dalam PreferencesProvider");
  }
  return ctx;
}

function readInitialPreferences(): { theme: Theme; language: Language } {
  if (typeof window === "undefined") {
    return { theme: "night", language: "id" };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ theme: Theme; language: Language }>;
      return {
        theme: parsed.theme ?? "night",
        language: parsed.language ?? "id",
      };
    }
  } catch (error) {
    console.warn("Tidak bisa membaca preferensi awal", error);
  }
  return { theme: "night", language: "id" };
}
