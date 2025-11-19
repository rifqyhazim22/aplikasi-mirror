"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ProfileOption = {
  id: string;
  nickname: string;
};

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type MiniChatProps = {
  title?: string;
  compact?: boolean;
  profiles?: ProfileOption[];
  selectedProfileId?: string;
  onSelectProfile?: (id: string) => void;
};

export function MiniChat({
  title = "Chat Mirror",
  compact = false,
  profiles: controlledProfiles,
  selectedProfileId: controlledSelectedProfileId,
  onSelectProfile,
}: MiniChatProps) {
  const [profiles, setProfiles] = useState<ProfileOption[]>(controlledProfiles ?? []);
  const [selectedProfileId, setSelectedProfileId] = useState(controlledSelectedProfileId ?? "");
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const resolvedProfiles = controlledProfiles ?? profiles;
  const resolvedSelectedProfileId = controlledSelectedProfileId ?? selectedProfileId;

  const activeProfile = useMemo(
    () =>
      resolvedProfiles.find((profile) => profile.id === resolvedSelectedProfileId) ?? null,
    [resolvedProfiles, resolvedSelectedProfileId],
  );

  useEffect(() => {
    if (controlledProfiles) {
      setProfiles(controlledProfiles);
      return;
    }
    const loadProfiles = async () => {
      try {
        const response = await fetch("/api/profiles");
        if (!response.ok) throw new Error("Gagal memuat profil");
        const payload = (await response.json()) as ProfileOption[];
        setProfiles(payload);
        setSelectedProfileId((prev) => {
          const next = prev || payload[0]?.id || "";
          if (!prev && payload[0]) {
            onSelectProfile?.(payload[0].id);
          }
          return next;
        });
      } catch (error) {
        console.error(error);
        setInfo("Mirror belum menemukan profil. Simpan ritual dulu.");
      }
    };
    loadProfiles();
  }, [controlledProfiles, onSelectProfile]);

  useEffect(() => {
    if (controlledSelectedProfileId) {
      setSelectedProfileId(controlledSelectedProfileId);
    }
  }, [controlledSelectedProfileId]);

  useEffect(() => {
    if (controlledProfiles && !controlledSelectedProfileId && controlledProfiles.length > 0) {
      onSelectProfile?.(controlledProfiles[0].id);
    }
  }, [controlledProfiles, controlledSelectedProfileId, onSelectProfile]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeProfile || !message.trim() || loading) return;
    const newEntry: ChatMessage = { role: "user", content: message.trim() };
    setLogs((prev) => [...prev, newEntry]);
    setMessage("");
    setLoading(true);
    setInfo(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: activeProfile.id,
          message: newEntry.content,
          history: logs.slice(-5),
        }),
      });
      if (!response.ok) throw new Error("Mirror lagi sibuk");
        const payload = (await response.json()) as { reply: string };
        setLogs((prev) => [...prev, { role: "assistant", content: payload.reply }]);
    } catch (error) {
      console.error(error);
      setInfo("Mirror belum merespons. Coba beberapa detik lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full rounded-[32px] border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{title}</p>
          <p className="text-sm text-white/70">
            Pilih profil dari ritual onboarding lalu kirim pesan cepat untuk menunjukkan respon Mirror.
          </p>
        </div>
        <select
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
          value={resolvedSelectedProfileId}
          onChange={(event) => {
            const next = event.target.value;
            if (!controlledSelectedProfileId) {
              setSelectedProfileId(next);
            }
            onSelectProfile?.(next);
          }}
          disabled={resolvedProfiles.length === 0}
        >
          <option value="">Pilih profil</option>
          {resolvedProfiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
              {profile.nickname}
            </option>
          ))}
        </select>
        <div className={`flex flex-col gap-3 ${compact ? "h-48" : "h-64"} overflow-y-auto`}>
          {logs.length === 0 ? (
            <p className="text-sm text-white/60">
              {resolvedProfiles.length === 0
                ? "Belum ada profil tersimpan."
                : "Belum ada chat. Tulis pesan di bawah untuk mulai."}
            </p>
          ) : (
            logs.map((chat, idx) => (
              <div
                key={`${chat.role}-${idx}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  chat.role === "assistant" ? "bg-white/90 text-purple-900 self-start" : "bg-purple-600/80 self-end"
                }`}
              >
                {chat.content}
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} className="flex flex-col gap-2">
          <input
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 disabled:opacity-40"
            placeholder={
              profiles.length === 0 ? "Simpan ritual dulu..." : "Ketik pesan ke Mirror di sini..."
            }
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={!activeProfile || loading}
          />
          <button
            type="submit"
            disabled={!activeProfile || !message.trim() || loading}
            className="white-pill rounded-full bg-white px-3 py-2 text-xs transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Mirror menulis..." : "Kirim ke Mirror"}
          </button>
          {info && <p className="text-xs text-rose-300">{info}</p>}
        </form>
      </div>
    </div>
  );
}
