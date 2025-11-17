"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (activeProfile) {
      setChat([
        {
          role: "assistant",
          content: `Hai ${activeProfile.nickname}! Aku siap jadi teman curhatmu. Ceritakan saja apa yang ingin kamu uji di sesi demo ini.`,
        },
      ]);
      setInfo(null);
    } else {
      setChat([]);
    }
  }, [activeProfile]);

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
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Studio</p>
        <h1 className="text-4xl font-semibold">Demo chat empatik Mirror</h1>
        <p className="text-white/75">
          Pilih profil onboarding lalu langsung ajak Mirror berdiskusi. Semua berjalan lewat Next.js
          API Route + OpenAI sehingga gampang dimodifikasi.
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
              <p className="text-sm text-white/60">Pilih profil dulu untuk memulai.</p>
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
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
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
