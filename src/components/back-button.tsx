"use client";

import { useRouter } from "next/navigation";
import { usePreferences } from "@/contexts/preferences-context";

const backCopy = {
  id: "Kembali",
  en: "Back",
} as const;

export function BackButton() {
  const router = useRouter();
  const { language } = usePreferences();
  const label = backCopy[language] ?? backCopy.id;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200 mb-2"
      aria-label={label}
    >
      <span className="text-base group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
      <span className="tracking-wide">{label}</span>
    </button>
  );
}
