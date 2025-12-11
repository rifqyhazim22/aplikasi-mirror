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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="emoji-heading">{copy.heroBadge}</p>
        <h1 className="text-4xl font-semibold">{copy.heroTitle}</h1>
        <p className="text-white/75">{copy.heroDescription}</p>
      </header>

      {loading ? (
        <p className="text-center text-white/70">{copy.loading}</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : summary.length === 0 ? (
        <p className="text-center text-white/50">{copy.empty}</p>
      ) : (
        <>
        <section className="glass-card space-y-6 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="emoji-heading text-left">{copy.vibeBadge}</p>
              <h2 className="text-2xl font-semibold text-white">{copy.vibeTitle}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
              <p className="text-white">
                {copy.topMood}: <span className="font-semibold">{topMood}</span>
              </p>
              <p className="text-xs text-white/60">
                {copy.totalEntries}: {chartData.reduce((sum, day) => sum + day.count, 0)}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            {chartData.map((day) => (
              <div key={day.date} className="flex-1 text-center text-xs text-white/60">
                <div className="relative mx-auto flex h-32 w-4 items-end justify-center rounded-full bg-white/10">
                  <span
                    className="block w-full rounded-full bg-gradient-to-t from-pink-400 via-purple-400 to-cyan-300"
                    style={{ height: `${Math.max((day.count / maxCount) * 100, 5)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-white/60">
                  {day.label}
                </p>
                <p className="text-[10px] text-white/40">{day.mood}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="glass-card space-y-5 p-6">
            <div className="flex flex-col gap-2">
              <p className="emoji-heading text-left">Chronicle</p>
              <h2 className="text-2xl font-semibold text-white">Riwayat mood harian</h2>
              <p className="text-sm text-white/70">
                Data diurutkan dari yang terbaru. Ajarkan pengguna cara membaca chip sumber (kamera / self-report)
                untuk menunjukkan integrasi computer vision Mirror.
              </p>
            </div>
            <div className="space-y-4">
              {summary.map((item) => {
                const titleEmoji = moodEmoji(item.moods[0] ?? "");
                return (
                  <article
                    key={item.date}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{item.date}</p>
                        <p className="text-2xl font-semibold text-white">
                          {titleEmoji} {item.count} {copy.entrySuffix}
                        </p>
                      </div>
                      <span className="mirror-pill px-3 py-1 text-xs text-white/70">
                        {item.sources.includes("camera") ? copy.sourceCamera : copy.sourceSelfReport}
                      </span>
                    </div>
                    <p className="mt-2 text-white/70">
                      {item.moods.length > 0
                        ? `${copy.moodMainPrefix} ${item.moods.slice(0, 3).join(", ")}`
                        : copy.noMood}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="glass-card space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="emoji-heading text-left">{copy.camBadge}</p>
                <h2 className="text-xl font-semibold text-white">{copy.camTitle}</h2>
              </div>
              <span className="text-sm text-white/60">
                {cameraLogs.length} {copy.camCountSuffix}
              </span>
            </div>
            {cameraLogs.length === 0 ? (
              <p className="text-sm text-white/60">{copy.camEmpty}</p>
            ) : (
              <ul className="space-y-3">
                {cameraLogs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize text-white">{log.emotion}</span>
                      <span className="text-xs text-white/60">
                        {new Date(log.created_at).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50">
                      {copy.profileLabel}: {log.profile_id ? log.profile_id.slice(0, 8) : copy.notLinked}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300"
                        style={{ width: `${Math.min(log.confidence ?? 20, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-white/50">
                      {copy.confidenceLabel} {log.confidence ?? 0}%
                    </p>
                    {log.metadata && (
                      <div className="mt-2 space-y-1 text-[11px] text-white/60">
                        <p>
                          Valence {valenceLabel(log.metadata.valence, copy)} • {copy.energyLabel}{" "}
                          {percentLabel(log.metadata.energy)}
                        </p>
                        <p>
                          {copy.focusLabel} {percentLabel(log.metadata.focus)} • {copy.tensionLabel}{" "}
                          {percentLabel(log.metadata.tension)}
                        </p>
                        {typeof log.metadata.attention === "number" && (
                          <p>
                            {copy.attentionLabel} {percentLabel(log.metadata.attention)}
                          </p>
                        )}
                        {log.metadata.headPose && (
                          <p>
                            Head pose pitch {log.metadata.headPose.pitch}° yaw {log.metadata.headPose.yaw}° roll{" "}
                            {log.metadata.headPose.roll}°
                          </p>
                        )}
                        {log.metadata.expressions && log.metadata.expressions.length > 0 && (
                          <p>
                            {copy.expressionsLabel}{" "}
                            {log.metadata.expressions
                              .slice(0, 2)
                              .map((expr) => `${expr.label} ${percentLabel(expr.score)}`)
                              .join(", ")}
                          </p>
                        )}
                        {log.metadata.cues && log.metadata.cues.length > 0 && (
                          <p>
                            {copy.cuesLabel}: {log.metadata.cues.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-white/50">
              {copy.camFootnote}
            </p>
          </section>
        </div>
        </>
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
