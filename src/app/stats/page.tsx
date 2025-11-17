"use client";

import { useEffect, useState } from "react";

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

export default function StatsPage() {
  const [summary, setSummary] = useState<MoodSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/moods/summary?days=14");
        if (!response.ok) throw new Error("Gagal memuat data");
        const payload = (await response.json()) as MoodSummary[];
        setSummary(payload);
      } catch (err) {
        console.error(err);
        setError("Tidak bisa membaca ringkasan mood");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Mood Timeline</p>
        <h1 className="text-4xl font-semibold">Kalender emosi Mirror 📅💜</h1>
        <p className="text-white/75">
          Ringkasan 14 hari terakhir dari mood entry (self-report maupun kamera). Gunakan ini untuk menunjukkan
          bagaimana Mirror menyimpan data secara terbuka tanpa paywall.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-white/70">Memuat data timeline...</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : summary.length === 0 ? (
        <p className="text-center text-white/50">Belum ada data mood dalam 14 hari terakhir.</p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {summary.map((item) => {
            const titleEmoji = moodEmoji(item.moods[0] ?? "");
            return (
              <article key={item.date} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">{item.date}</p>
                    <p className="text-2xl font-semibold text-white">{titleEmoji} {item.count} entri</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    {item.sources.includes("camera") ? "kamera" : "self-report"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">
                  {item.moods.length > 0
                    ? `Mood utama: ${item.moods.slice(0, 3).join(", ")}`
                    : "Belum ada catatan mood"}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
