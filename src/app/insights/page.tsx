"use client";

import { useEffect, useState } from "react";
import { resolveApiUrl } from "@/lib/api";
import { usePreferences } from "@/contexts/preferences-context";

type Insight = {
  nickname: string;
  mbti: string;
  enneagram: string;
  focusNote: string;
  dominantMood: string | null;
  entriesAnalyzed: number;
  suggestion: string;
};

const insightsCopy = {
  id: {
    badge: "Insight CBT",
    title: "Saran santai buat grounding 🧠💜",
    description:
      "Mirror ngambil kombinasi kuis + mood log terus ngasih tips pendek. Cocok buat nutup sesi demo atau buat remind diri sendiri sebelum tidur.",
    loading: "Memuat insight...",
    error: "Belum bisa mengambil insight. Pastikan sudah ada data quiz & mood.",
    profileBadge: "Profil terakhir",
    focusLabel: "Fokus",
    dominantMood: "Dominan mood",
    entriesSuffix: "entri dianalisis",
    noMood: "belum ada",
  },
  en: {
    badge: "CBT Insights",
    title: "Grounding tips, fast 🧠💜",
    description:
      "Mirror blends quiz + mood logs and returns a short tip. Perfect to close a demo session or remind yourself before bed.",
    loading: "Loading insights...",
    error: "Unable to fetch insights. Make sure quiz & mood data exist.",
    profileBadge: "Latest profile",
    focusLabel: "Focus",
    dominantMood: "Dominant mood",
    entriesSuffix: "entries analyzed",
    noMood: "none yet",
  },
} as const;

export default function InsightsPage() {
  const { language } = usePreferences();
  const copy = insightsCopy[language] ?? insightsCopy.id;
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(resolveApiUrl("/api/insights"));
        if (!response.ok) throw new Error("Gagal memuat insight");
        const payload = (await response.json()) as Insight;
        setInsight(payload);
      } catch (err) {
        console.error(err);
        setError(copy.error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [copy.error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">{copy.badge}</p>
        <h1 className="text-4xl font-semibold">{copy.title}</h1>
        <p className="text-white/75">{copy.description}</p>
      </header>

      {loading ? (
        <p className="text-center text-white/70">{copy.loading}</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : insight ? (
        <section className="glass-card space-y-4 p-6">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">{copy.profileBadge}</p>
            <p className="text-3xl font-semibold text-white">
              {insight.nickname} · {insight.mbti} · {insight.enneagram}
            </p>
            <p className="text-sm text-white/70">
              {copy.focusLabel}: {insight.focusNote}
            </p>
            <p className="text-sm text-white/70">
              {copy.dominantMood}: {insight.dominantMood ?? copy.noMood} ({insight.entriesAnalyzed}{" "}
              {copy.entriesSuffix})
            </p>
          </div>
          <div className="liquid-card p-6 text-center text-lg text-white">
            <p>{insight.suggestion}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
