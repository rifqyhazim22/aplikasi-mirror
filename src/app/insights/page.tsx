"use client";

import { useEffect, useState } from "react";

type Insight = {
  nickname: string;
  mbti: string;
  enneagram: string;
  focusNote: string;
  dominantMood: string | null;
  entriesAnalyzed: number;
  suggestion: string;
};

export default function InsightsPage() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/insights");
        if (!response.ok) throw new Error("Gagal memuat insight");
        const payload = (await response.json()) as Insight;
        setInsight(payload);
      } catch (err) {
        console.error(err);
        setError("Belum bisa mengambil insight. Pastikan sudah ada data quiz & mood.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Insight CBT</p>
        <h1 className="text-4xl font-semibold">Saran santai buat grounding 🧠💜</h1>
        <p className="text-white/75">
          Mirror ngambil kombinasi kuis + mood log terus ngasih tips pendek. Cocok buat nutup sesi demo atau buat remind
          diri sendiri sebelum tidur.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-white/70">Memuat insight...</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : insight ? (
        <section className="glass-card space-y-4 p-6">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Profil terakhir</p>
            <p className="text-3xl font-semibold text-white">
              {insight.nickname} · {insight.mbti} · {insight.enneagram}
            </p>
            <p className="text-sm text-white/70">Fokus: {insight.focusNote}</p>
            <p className="text-sm text-white/70">
              Dominan mood: {insight.dominantMood ?? "belum ada"} ({insight.entriesAnalyzed} entri dianalisis)
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
