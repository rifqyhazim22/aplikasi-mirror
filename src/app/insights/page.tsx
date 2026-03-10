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
    <div className="relative flex min-h-screen w-full flex-col font-display text-white z-10">
      <div className="flex flex-col flex-1 max-w-[1200px] w-full mx-auto px-6 lg:px-12 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4 z-10 relative">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <h1 className="text-3xl md:text-5xl font-light tracking-tight">{copy.title}</h1>
          </div>
          <p className="text-white/60 text-sm md:text-base max-w-md italic font-light">{copy.description}</p>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <p className="text-white/50 text-xl tracking-widest uppercase animate-pulse">Loading Insights...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <p className="text-rose-400 max-w-sm text-center bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20">{error}</p>
          </div>
        ) : insight ? (
          <div className="flex flex-col lg:flex-row gap-8 relative z-10">
            {/* Left Column: Aura Energy Orb */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[url('/insights-noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="z-10 text-center mb-12">
                  <p className="text-white text-2xl font-semibold tracking-wide">Aura Scan</p>
                  <p className="text-white/50 text-xs font-medium uppercase tracking-widest mt-2">{insight.nickname}</p>
                </div>
                <div className="relative size-60 flex items-center justify-center my-6">
                  {/* Abstract Glowing Orb Simulation using CSS gradients */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 opacity-50 blur-[40px] animate-pulse"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-sky-200 to-indigo-500 opacity-60 blur-xl"></div>
                  <div className="absolute inset-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(56,189,248,0.4)]"></div>
                  <div className="z-20 text-center">
                    <span className="text-white text-5xl font-light">
                      {insight.entriesAnalyzed}
                    </span>
                    <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase mt-2">{copy.entriesSuffix}</p>
                  </div>
                </div>
                <div className="z-10 mt-8 w-full text-center">
                  <p className="text-white text-lg font-medium">{insight.mbti}</p>
                  <p className="text-sky-400 text-sm mt-1">Enneagram {insight.enneagram}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Glass Panels */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              {/* AI Reflection Panel */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="text-emerald-400 text-2xl">✽</span>
                  <h3 className="text-lg font-semibold tracking-wide">AI Reflection</h3>
                </div>
                <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light italic relative z-10">
                  &quot;{insight.suggestion}&quot;
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-3xl p-6 flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-sky-400/10 flex items-center justify-center text-sky-400 text-xl">
                      🎯
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">{copy.focusLabel}</p>
                      <p className="text-lg font-medium tracking-wide text-white">{insight.focusNote}</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-6 flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-purple-400/10 flex items-center justify-center text-purple-400 text-xl">
                      🔮
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-1">{copy.dominantMood}</p>
                      <p className="text-lg font-medium tracking-wide text-white">{insight.dominantMood ?? copy.noMood}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
