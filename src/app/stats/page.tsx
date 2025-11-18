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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="emoji-heading">Mood Timeline</p>
        <h1 className="text-4xl font-semibold">Kalender emosi ala bullet journal digital 📅💜</h1>
        <p className="text-white/75">
          Semua mood entry & log kamera diringkas biar kamu bisa cerita ke diri sendiri, “oh, minggu lalu lebih chill
          ternyata”. Data ini terbuka, bisa jadi bahan chat Mirror, bisa juga dipake buat refleksi personal.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-white/70">Memuat data timeline...</p>
      ) : error ? (
        <p className="text-center text-rose-300">{error}</p>
      ) : summary.length === 0 ? (
        <p className="text-center text-white/50">Belum ada data mood dalam 14 hari terakhir.</p>
      ) : (
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
                          {titleEmoji} {item.count} entri
                        </p>
                      </div>
                      <span className="mirror-pill px-3 py-1 text-xs text-white/70">
                        {item.sources.includes("camera") ? "kamera + teks" : "self-report"}
                      </span>
                    </div>
                    <p className="mt-2 text-white/70">
                      {item.moods.length > 0
                        ? `Mood utama: ${item.moods.slice(0, 3).join(", ")}`
                        : "Belum ada catatan mood"}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="glass-card space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="emoji-heading text-left">Mirror Cam Log</p>
                <h2 className="text-xl font-semibold text-white">Bucket emosi terbaru</h2>
              </div>
              <span className="text-sm text-white/60">{cameraLogs.length} entri</span>
            </div>
            {cameraLogs.length === 0 ? (
              <p className="text-sm text-white/60">Belum ada log kamera tersimpan.</p>
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
                        {new Date(log.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300"
                        style={{ width: `${Math.min(log.confidence ?? 20, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-white/50">
                      Confidence {log.confidence ?? 0}%
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-white/50">
              Log kamera dipicu setiap 10 detik sekali dari widget Mirror Cam. Semua tetap berada di Supabase
              sehingga mudah dianalisis untuk modul Insight/Quiz berikutnya.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
