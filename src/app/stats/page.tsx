"use client";

import { useEffect, useMemo, useState } from "react";
import type { SensorMetrics } from "@/types/vision";
import { resolveApiUrl } from "@/lib/api";
import { usePreferences } from "@/contexts/preferences-context";

type CameraLog = {
  id: string;
  emotion: string;
  confidence: number | null;
  created_at: string;
  profile_id: string | null;
  metadata?: SensorMetrics | null;
};

type MoodSummary = {
  date: string;
  count: number;
  moods: string[];
  sources: string[];
};

const moodEmoji = (text: string) => {
  const normalized = text.toLowerCase();
  if (normalized.includes("senang") || normalized.includes("happy")) return "😊";
  if (normalized.includes("lelah") || normalized.includes("tired")) return "🥱";
  if (normalized.includes("cemas") || normalized.includes("anx")) return "😟";
  if (normalized.includes("marah")) return "😡";
  return "🪞";
};

const percentLabel = (value: number | null | undefined) =>
  `${Math.round(Math.min(Math.max(value ?? 0, 0), 1) * 100)}%`;

const statsCopy = {
  id: {
    heroBadge: "Mood Timeline",
    heroTitle: "Kalender emosi ala bullet journal digital 📅💜",
    heroDescription:
      "Semua mood entry & log kamera diringkas biar kamu bisa cerita ke diri sendiri, “oh, minggu lalu lebih chill ternyata”. Data ini terbuka, bisa jadi bahan chat Mirror, bisa juga dipake buat refleksi personal.",
    loading: "Memuat data timeline...",
    error: "Tidak bisa membaca data statistik",
    empty: "Belum ada data mood dalam 14 hari terakhir.",
    vibeBadge: "Vibe tracker",
    vibeTitle: "Grafik mood 14 hari",
    topMood: "Top mood",
    totalEntries: "Total entri",
    chronicleBadge: "Chronicle",
    chronicleTitle: "Riwayat mood harian",
    chronicleDescription:
      "Data diurutkan dari yang terbaru. Ajarkan pengguna cara membaca chip sumber (kamera / self-report) untuk menunjukkan integrasi computer vision Mirror.",
    entrySuffix: "entri",
    sourceCamera: "kamera + teks",
    sourceSelfReport: "self-report",
    moodMainPrefix: "Mood utama:",
    noMood: "Belum ada catatan mood",
    camBadge: "Mirror Cam Log",
    camTitle: "Bucket emosi terbaru",
    camCountSuffix: "entri",
    camEmpty: "Belum ada log kamera tersimpan.",
    camFootnote:
      "Log kamera dipicu setiap 10 detik sekali dari widget Mirror Cam. Semua tetap berada di Supabase sehingga mudah dianalisis untuk modul Insight/Quiz berikutnya.",
    valencePositive: "positif",
    valenceNeutral: "netral",
    valenceNegative: "sedih",
    energyLabel: "Energi",
    focusLabel: "Fokus",
    tensionLabel: "Tensi",
    attentionLabel: "Attention",
    expressionsLabel: "Ekspresi",
    cuesLabel: "Cues",
    profileLabel: "Profil",
    notLinked: "tidak terhubung",
    confidenceLabel: "Confidence",
  },
  en: {
    heroBadge: "Mood Timeline",
    heroTitle: "A bullet-journal style emotion calendar 📅💜",
    heroDescription:
      "All mood entries and camera logs summarized so you can tell yourself, “last week was calmer.” The data stays open—use it in Mirror chat or personal reflection.",
    loading: "Loading timeline data...",
    error: "Unable to read stats",
    empty: "No mood data in the last 14 days.",
    vibeBadge: "Vibe tracker",
    vibeTitle: "14-day mood chart",
    topMood: "Top mood",
    totalEntries: "Total entries",
    chronicleBadge: "Chronicle",
    chronicleTitle: "Daily mood history",
    chronicleDescription:
      "Sorted from newest. Teach testers how to read source chips (camera / self-report) to show Mirror’s computer vision integration.",
    entrySuffix: "entries",
    sourceCamera: "camera + text",
    sourceSelfReport: "self-report",
    moodMainPrefix: "Main mood:",
    noMood: "No mood notes yet",
    camBadge: "Mirror Cam Log",
    camTitle: "Latest emotion bucket",
    camCountSuffix: "entries",
    camEmpty: "No camera logs saved yet.",
    camFootnote:
      "Camera logs fire every ~10s from the Mirror Cam widget. Everything stays in Supabase for the next Insight/Quiz modules.",
    valencePositive: "positive",
    valenceNeutral: "neutral",
    valenceNegative: "low",
    energyLabel: "Energy",
    focusLabel: "Focus",
    tensionLabel: "Tension",
    attentionLabel: "Attention",
    expressionsLabel: "Expressions",
    cuesLabel: "Cues",
    profileLabel: "Profile",
    notLinked: "not linked",
    confidenceLabel: "Confidence",
  },
} as const;

export default function StatsPage() {
  const { language } = usePreferences();
  const copy: (typeof statsCopy)[keyof typeof statsCopy] = statsCopy[language] ?? statsCopy.id;
  const locale = language === "en" ? "en-US" : "id-ID";
  const [summary, setSummary] = useState<MoodSummary[]>([]);
  const [cameraLogs, setCameraLogs] = useState<CameraLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, cameraRes] = await Promise.all([
          fetch(resolveApiUrl("/api/moods/summary?days=14")),
          fetch(resolveApiUrl("/api/emotions")),
        ]);
        if (!summaryRes.ok || !cameraRes.ok) throw new Error("Gagal memuat data");
        const payload = (await summaryRes.json()) as MoodSummary[];
        const cameraPayload = (await cameraRes.json()) as CameraLog[];
        setSummary(payload);
        setCameraLogs(cameraPayload);
      } catch (err) {
        console.error(err);
        setError(copy.error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [copy.error]);

  const chartData = useMemo(() => {
    if (!summary.length) return [];
    return summary.map((item) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString(locale, { weekday: "short" }),
      count: item.count,
      mood: item.moods[0] ?? "-",
    }));
  }, [summary, locale]);

  const maxCount = useMemo(
    () => Math.max(...chartData.map((item) => item.count), 1),
    [chartData],
  );

  const topMood = useMemo(() => {
    const flat = summary.flatMap((item) => item.moods);
    if (!flat.length) return "belum ada";
    const map = new Map<string, number>();
    flat.forEach((mood) => map.set(mood, (map.get(mood) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "belum ada";
  }, [summary]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-8 px-6 py-16 text-white relative z-10 w-full">
      <header className="flex flex-col gap-2 mb-8 mt-4 relative z-10 w-full">
        <h1 className="text-5xl font-light tracking-tight">{copy.heroTitle.replace(/📅💜/, '').trim()}</h1>
        <p className="text-white/60 text-lg font-light">{copy.heroDescription}</p>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <p className="text-white/50 text-xl tracking-widest uppercase animate-pulse">{copy.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <p className="text-rose-400 max-w-sm text-center bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20">{error}</p>
        </div>
      ) : summary.length === 0 ? (
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <p className="text-white/50 text-center">{copy.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">

          {/* Mood Fluctuation Chart */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col gap-8 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex flex-col gap-1">
                <p className="text-white/50 text-sm font-medium tracking-wider uppercase">{copy.vibeBadge}</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-white text-4xl font-light tracking-tight">{copy.vibeTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs uppercase tracking-widest">{copy.totalEntries}</p>
                <p className="text-xl font-medium text-sky-400">{chartData.reduce((sum, day) => sum + day.count, 0)}</p>
              </div>
            </div>

            <div className="flex items-end gap-2 sm:gap-4 mt-auto min-h-[220px] relative z-10 border-b border-white/10 pb-4 pt-8">
              {chartData.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-3">
                  <div className="relative flex h-32 w-4 sm:w-6 items-end justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors group/bar cursor-pointer">
                    <span
                      className="block w-full rounded-full bg-gradient-to-t from-sky-500/50 to-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-500 group-hover/bar:shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                      style={{ height: `${Math.max((day.count / maxCount) * 100, 5)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest">{day.label.slice(0, 3)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dominant Focus radial */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex flex-col gap-1">
                <p className="text-white/50 text-sm font-medium tracking-wider uppercase">{copy.topMood}</p>
                <p className="text-white text-3xl font-light tracking-tight capitalize">{topMood}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative min-h-[200px] py-4 z-10">
              <div className="relative size-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                  <circle className="drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-1000" cx="50" cy="50" fill="none" r="45" stroke="#a855f7" strokeDasharray="282.7" strokeDashoffset="50" strokeLinecap="round" strokeWidth="4"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light text-white">{moodEmoji(topMood)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Chronicle (Full Width) */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col gap-6 lg:col-span-3 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden border-t border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="grid gap-12 lg:grid-cols-2 relative z-10">

              {/* Daily Mood History */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-400 text-xl">✽</span>
                  <p className="text-white/50 text-sm font-medium tracking-wider uppercase">{copy.chronicleTitle}</p>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {summary.map((item) => {
                    const titleEmoji = moodEmoji(item.moods[0] ?? "");
                    return (
                      <div key={item.date} className="glass-pill !rounded-2xl p-5 relative overflow-hidden group/entry cursor-default transition-all hover:bg-white/10 border border-white/5 hover:border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-1">{item.date}</p>
                            <p className="text-xl font-medium">{titleEmoji} {item.count} <span className="text-sm text-white/50 font-normal">{copy.entrySuffix}</span></p>
                          </div>
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-white/60">
                            {item.sources.includes("camera") ? copy.sourceCamera : copy.sourceSelfReport}
                          </span>
                        </div>
                        <p className="text-sm text-white/70">
                          <span className="font-semibold text-white/90">{copy.moodMainPrefix}</span> {item.moods.slice(0, 3).join(", ") || copy.noMood}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Latest Camera Logs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 text-xl">👁</span>
                    <p className="text-white/50 text-sm font-medium tracking-wider uppercase">{copy.camTitle}</p>
                  </div>
                  <span className="text-xs text-white/40 px-3 py-1 bg-white/5 rounded-full border border-white/10">{cameraLogs.length} {copy.camCountSuffix}</span>
                </div>

                {cameraLogs.length === 0 ? (
                  <p className="text-white/40 text-sm italic py-4">{copy.camEmpty}</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {cameraLogs.map((log) => (
                      <div key={log.id} className="glass-pill !rounded-2xl p-4 flex flex-col gap-3 group/log hover:bg-white/10 transition-colors border-white/5 hover:border-white/10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="size-8 rounded-full bg-sky-400/20 text-sky-400 flex items-center justify-center text-xs border border-sky-400/30">
                              {percentLabel(log.confidence ?? 0).replace('%', '')}
                            </span>
                            <span className="font-medium capitalize tracking-wide text-white/90">{log.emotion}</span>
                          </div>
                          <span className="text-[10px] uppercase font-medium tracking-widest text-white/40">
                            {new Date(log.created_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {log.metadata ? (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-white/50 mt-1 bg-black/20 rounded-xl p-3 border border-white/5">
                            <p><span className="text-white/30 uppercase tracking-widest text-[9px] block mb-1">Valence</span> <span className="text-white/80">{valenceLabel(log.metadata.valence, copy)}</span></p>
                            <p><span className="text-white/30 uppercase tracking-widest text-[9px] block mb-1">{copy.energyLabel}</span> <span className="text-white/80">{percentLabel(log.metadata.energy)}</span></p>
                            <p><span className="text-white/30 uppercase tracking-widest text-[9px] block mb-1">{copy.focusLabel}</span> <span className="text-white/80">{percentLabel(log.metadata.focus)}</span></p>
                            <p><span className="text-white/30 uppercase tracking-widest text-[9px] block mb-1">{copy.tensionLabel}</span> <span className="text-white/80">{percentLabel(log.metadata.tension)}</span></p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">No telemetry available</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-6 italic pt-4 border-t border-white/5">
                  {copy.camFootnote}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function valenceLabel(
  value: number | null | undefined,
  copy: { valencePositive: string; valenceNeutral: string; valenceNegative: string },
) {
  if (value === null || value === undefined) return copy.valenceNeutral;
  if (value > 0.25) return copy.valencePositive;
  if (value < -0.25) return copy.valenceNegative;
  return copy.valenceNeutral;
}
