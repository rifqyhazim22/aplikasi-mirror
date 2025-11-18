"use client";

import { useEffect, useState } from "react";

type CameraLog = {
  id: string;
  emotion: string;
  confidence: number | null;
  created_at: string;
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

export default function StatsPage() {
  const [summary, setSummary] = useState<MoodSummary[]>([]);
  const [cameraLogs, setCameraLogs] = useState<CameraLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, cameraRes] = await Promise.all([
          fetch("/api/moods/summary?days=14"),
          fetch("/api/emotions"),
        ]);
        if (!summaryRes.ok || !cameraRes.ok) throw new Error("Gagal memuat data");
        const payload = (await summaryRes.json()) as MoodSummary[];
        const cameraPayload = (await cameraRes.json()) as CameraLog[];
        setSummary(payload);
        setCameraLogs(cameraPayload);
      } catch (err) {
        console.error(err);
        setError("Tidak bisa membaca data statistik");
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
        <>
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
        <section className="glass-card mt-6 space-y-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">Log kamera terakhir</p>
              <p className="text-lg text-white/80">Bucket emosi dari widget CV</p>
            </div>
            <span className="text-sm text-white/60">{cameraLogs.length} entri</span>
          </div>
          {cameraLogs.length === 0 ? (
            <p className="text-sm text-white/60">Belum ada log kamera tersimpan.</p>
          ) : (
            <ul className="space-y-2">
              {cameraLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
                  <span className="font-semibold text-white capitalize">{log.emotion}</span>
                  <span className="text-xs text-white/60">{new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-xs text-white/50">{log.confidence ?? 0}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        </>
      )}
    </main>
  );
}
