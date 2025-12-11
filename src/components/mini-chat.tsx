"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { VisionSignal } from "@/types/vision";
import { readCachedVisionSignal, subscribeVisionSignal } from "@/lib/vision-channel";

type ProfileOption = {
  id: string;
  nickname: string;
};

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type MiniChatCopy = {
  description: string;
  visionSynced: string;
  visionHint: string;
  selectPlaceholder: string;
  fetchProfilesError: string;
  emptyNoProfile: string;
  emptyChat: string;
  inputPlaceholderNoProfile: string;
  inputPlaceholder: string;
  sendLabel: string;
  sendingLabel: string;
  noResponse: string;
  logsLoading: string;
  selectProfilePrompt: string;
};

const defaultCopy: MiniChatCopy = {
  description:
    "Pilih profil dari ritual onboarding lalu kirim pesan cepat untuk menunjukkan respon Mirror.",
  visionSynced: "CV sinkron ⚡ {emotion} ({confidence}%)",
  visionHint: "Aktifkan kamera di lab supaya chat punya konteks ekspresi real-time.",
  selectPlaceholder: "Pilih profil",
  fetchProfilesError: "Mirror belum menemukan profil. Simpan ritual dulu.",
  emptyNoProfile: "Belum ada profil tersimpan.",
  emptyChat: "Belum ada chat. Tulis pesan di bawah untuk mulai.",
  inputPlaceholderNoProfile: "Simpan ritual dulu...",
  inputPlaceholder: "Ketik pesan ke Mirror di sini...",
  sendLabel: "Kirim ke Mirror",
  sendingLabel: "Mirror menulis...",
  noResponse: "Mirror belum merespons. Coba beberapa detik lagi.",
  logsLoading: "Memuat log percakapan...",
  selectProfilePrompt: "Pilih profil dulu untuk memulai.",
};

type MiniChatProps = {
  title?: string;
  compact?: boolean;
  profiles?: ProfileOption[];
  selectedProfileId?: string;
  onSelectProfile?: (id: string) => void;
  visionSignal?: VisionSignal | null;
  copy?: Partial<MiniChatCopy>;
};

export function MiniChat({
  title = "Chat Mirror",
  compact = false,
  profiles: controlledProfiles,
  selectedProfileId: controlledSelectedProfileId,
  onSelectProfile,
  visionSignal,
  copy: copyOverride,
}: MiniChatProps) {
  const copy = { ...defaultCopy, ...(copyOverride ?? {}) };
  const [profiles, setProfiles] = useState<ProfileOption[]>(controlledProfiles ?? []);
  const [selectedProfileId, setSelectedProfileId] = useState(controlledSelectedProfileId ?? "");
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [broadcastVision, setBroadcastVision] = useState<VisionSignal | null>(readCachedVisionSignal);

  useEffect(() => {
    const unsubscribe = subscribeVisionSignal((signal) => {
      setBroadcastVision(signal);
    });
    return () => unsubscribe();
  }, []);

  const formatVisionSynced = (emotion: string, confidence?: number | null) =>
    copy.visionSynced
      .replace("{emotion}", emotion)
      .replace("{confidence}", String(confidence ?? 0));

  const freshVision = useMemo(() => {
    const source = visionSignal ?? broadcastVision;
    if (!source) return null;
    const age = Date.now() - source.timestamp;
    if (Number.isNaN(age) || age > 15000) return null;
    return source;
  }, [visionSignal, broadcastVision]);

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
        setInfo(copy.fetchProfilesError);
      }
    };
    loadProfiles();
  }, [controlledProfiles, onSelectProfile, copy.fetchProfilesError]);

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
          visionSignal: freshVision
            ? {
                emotion: freshVision.emotion,
                confidence: freshVision.confidence,
                metrics: freshVision.metrics,
                timestamp: freshVision.timestamp,
              }
            : undefined,
        }),
      });
      if (!response.ok) throw new Error("Mirror lagi sibuk");
      const payload = (await response.json()) as { reply: string };
      setLogs((prev) => [...prev, { role: "assistant", content: payload.reply }]);
    } catch (error) {
      console.error(error);
      setInfo(copy.noResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full rounded-[32px] border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{title}</p>
          <p className="text-sm text-white/70">{copy.description}</p>
          {freshVision ? (
            <p className="text-xs text-emerald-200">{formatVisionSynced(freshVision.emotion, freshVision.confidence)}</p>
          ) : (
            <p className="text-xs text-white/40">{copy.visionHint}</p>
          )}
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
          <option value="">{copy.selectPlaceholder}</option>
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
                ? copy.emptyNoProfile
                : copy.emptyChat}
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
              profiles.length === 0 ? copy.inputPlaceholderNoProfile : copy.inputPlaceholder
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
            {loading ? copy.sendingLabel : copy.sendLabel}
          </button>
          {info && <p className="text-xs text-rose-300">{info}</p>}
        </form>
      </div>
    </div>
  );
}
