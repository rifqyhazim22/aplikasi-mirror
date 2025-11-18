"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type RecentProfile = {
  id: string;
  nickname: string;
  focusAreas: string[];
  moodBaseline: string;
  createdAt: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatLogResponse = {
  id: string;
  role: ChatMessage["role"];
  content: string;
  createdAt: string;
};

type MoodSnapshot = {
  id: string;
  mood: string;
  note: string | null;
  source: string | null;
  createdAt: string;
};

type CameraSnapshot = {
  id: string;
  emotion: string;
  confidence: number | null;
  createdAt: string;
};

const promptPresets = [
  "Aku lagi overthinking tugas besok, bisa bantu tenangin?",
  "Boleh kasih refleksi dari mood baseline ku?",
  "Rekomendasi latihan singkat buat malam ini dong",
];

export default function StudioPage() {
  const [profiles, setProfiles] = useState<RecentProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [sensors, setSensors] = useState<{ mood?: MoodSnapshot; camera?: CameraSnapshot }>({});

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch("/api/profiles");
        if (!response.ok) throw new Error("Gagal memuat profil");
        const payload = (await response.json()) as RecentProfile[];
        setProfiles(payload);
        setSelectedProfileId((prev) => prev || payload[0]?.id || "");
      } catch (error) {
        console.error(error);
        setInfo("Belum bisa memuat profil. Cek koneksi Supabase.");
      }
    };
    loadProfiles();
  }, []);

  const fetchLogs = useCallback(
    async (profileId: string) => {
      if (!profileId) {
        setChat([]);
        return;
      }
      setLogsLoading(true);
      try {
        const response = await fetch(`/api/chat/logs?profileId=${profileId}`);
        if (!response.ok) {
          throw new Error("Gagal memuat log");
        }
        const payload = (await response.json()) as ChatLogResponse[];
        if (payload.length > 0) {
          setChat(payload.map((entry) => ({ role: entry.role, content: entry.content })));
          setInfo(null);
        } else if (activeProfile) {
          setChat([
            {
              role: "assistant",
              content: `Hai ${activeProfile.nickname}! Aku siap jadi teman curhatmu. Ceritakan saja apa yang ingin kamu uji di sesi demo ini.`,
            },
          ]);
        } else {
          setChat([]);
        }
      } catch (error) {
        console.error(error);
        setInfo("Belum bisa memuat log percakapan.");
      } finally {
        setLogsLoading(false);
      }
    },
    [activeProfile],
  );

  useEffect(() => {
    fetchLogs(selectedProfileId);
  }, [selectedProfileId, fetchLogs]);

  useEffect(() => {
    const loadSensors = async () => {
      if (!selectedProfileId) {
        setSensors({});
        return;
      }
      setSensorLoading(true);
      try {
        const [moodRes, cameraRes] = await Promise.all([
          fetch(`/api/moods?profileId=${selectedProfileId}`),
          fetch("/api/emotions?limit=1"),
        ]);
        if (!moodRes.ok || !cameraRes.ok) {
          throw new Error("Sensor gagal dimuat");
        }
        const moodPayload = (await moodRes.json()) as MoodSnapshot[];
        const cameraPayload = (await cameraRes.json()) as {
          id: string;
          emotion: string;
          confidence: number | null;
          created_at: string;
        }[];
        setSensors({
          mood: moodPayload[0],
          camera: cameraPayload[0]
            ? {
                id: cameraPayload[0].id,
                emotion: cameraPayload[0].emotion,
                confidence: cameraPayload[0].confidence,
                createdAt: cameraPayload[0].created_at,
              }
            : undefined,
        });
      } catch (error) {
        console.error(error);
        setInfo("Sensor emosi belum bisa dimuat. Coba refresh.");
      } finally {
        setSensorLoading(false);
      }
    };
    loadSensors();
  }, [selectedProfileId]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeProfile || !input.trim() || loading) {
      return;
    }
    const newMessage: ChatMessage = { role: "user", content: input.trim() };
    const history = [...chat, newMessage];
    setChat(history);
    setInput("");
    setLoading(true);
    setInfo(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: activeProfile.id,
          message: newMessage.content,
          history: chat.slice(-10),
        }),
      });
      if (!response.ok) {
        throw new Error("Gagal menghubungi Mirror");
      }
      const payload = (await response.json()) as { reply: string };
      setChat((prev) => [...prev, { role: "assistant", content: payload.reply }]);
      fetchLogs(activeProfile.id);
    } catch (error) {
      console.error(error);
      setInfo("Mirror tidak merespons. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Studio Kamera</p>
        <h1 className="text-4xl font-semibold">Percakapan setelah sesi bercermin 💬🪞</h1>
        <p className="text-white/75">
          Setelah kamera menangkap ekspresi dan preferensi di laman onboarding, Studio ini menunjukkan
          bagaimana Mirror merespons dengan gaya teman cermin. Jelaskan bahwa log di bawah adalah rekaman
          dari kombinasi computer vision + prompt empatik Mirror.
        </p>
      </header>

      <section className="glass-card space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm uppercase tracking-[0.3em] text-white/50">Profil aktif</label>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white sm:max-w-xs"
            value={selectedProfileId}
            onChange={(event) => setSelectedProfileId(event.target.value)}
          >
            <option value="">Pilih profil dari onboarding</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
                {profile.nickname} • {profile.focusAreas[0] ?? "-"}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/50">
            Ingatkan audiens bahwa profil ini sudah melalui ritual kamera sehingga log yang muncul terasa hidup.
          </p>
          {!profiles.length && (
            <p className="text-sm text-white/60">
              Belum ada profil? buka halaman onboarding terlebih dahulu.
            </p>
          )}
        </div>
        {activeProfile && (
          <p className="text-sm text-white/70">
            Fokus: {activeProfile.focusAreas.join(", ") || "-"} | Mood baseline: {activeProfile.moodBaseline}
          </p>
        )}
      </section>

      <section className="glass-card space-y-4 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Sensor emosi</p>
        {sensorLoading ? (
          <p className="text-sm text-white/60">Menyelaraskan data kamera & mood...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Computer vision</p>
              {sensors.camera ? (
                <>
                  <p className="mt-2 text-lg font-semibold text-white capitalize">
                    {sensors.camera.emotion}
                  </p>
                  <p className="text-xs text-white/60">
                    Confidence {sensors.camera.confidence ?? 0}% •{" "}
                    {new Date(sensors.camera.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-white/60">
                  Belum ada log kamera terbaru. Nyalakan mirror cam untuk memperbarui data.
                </p>
              )}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mood entry</p>
              {sensors.mood ? (
                <>
                  <p className="mt-2 text-lg font-semibold text-white">{sensors.mood.mood}</p>
                  <p className="text-xs text-white/60">
                    {sensors.mood.source ?? "demo"} •{" "}
                    {new Date(sensors.mood.createdAt).toLocaleString("id-ID")}
                  </p>
                  {sensors.mood.note && (
                    <p className="mt-1 text-xs text-white/60">Catatan: {sensors.mood.note}</p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-xs text-white/60">
                  Belum ada mood entry. Isi form onboarding atau catat mood cepat.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="glass-card grid gap-6 p-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Preset cepat</p>
          <div className="flex flex-wrap gap-3">
            {promptPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setInput(preset)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/75 hover:border-white/40"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Log percakapan</p>
          <div className="h-80 overflow-y-auto rounded-3xl border border-white/5 bg-white/5 p-4">
            {chat.length === 0 ? (
              <p className="text-sm text-white/60">
                {logsLoading ? "Memuat log percakapan..." : "Pilih profil dulu untuk memulai."}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {chat.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "assistant"
                        ? "self-start bg-white/90 text-purple-900"
                        : "self-end bg-purple-600/70"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                {loading && <p className="text-xs text-white/60">Mirror sedang menulis...</p>}
                {logsLoading && <p className="text-xs text-white/60">Memperbarui log...</p>}
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30"
              placeholder="Tulis pesanmu"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={!activeProfile}
            />
            <button
              type="submit"
              disabled={!activeProfile || !input.trim() || loading}
              className="white-pill rounded-full bg-white px-6 py-3 text-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Mengirim..." : "Kirim"}
            </button>
          </form>
          {info && <p className="text-sm text-rose-300">{info}</p>}
        </div>
      </section>
    </main>
  );
}
