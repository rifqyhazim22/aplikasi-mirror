"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CameraLiquidWidget } from "@/components/camera-liquid";
import { MiniChat } from "@/components/mini-chat";
import { usePreferences } from "@/contexts/preferences-context";
import { onboardingCopy } from "@/lib/onboarding-i18n";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { resolveApiUrl } from "@/lib/api";

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

const studioCopy = {
  id: {
    heroBadge: "Studio Kamera",
    heroTitle: "Chat lanjutan setelah check-in 💬🪞",
    heroDescription:
      "Di sini Mirror udah ngerti vibe kamu (dari kamera + form) terus ngobrol kayak sahabat. Panel sensor di bawah nunjukkin dari mana emosinya kebaca, jadi kamu bisa jelasin ke pengguna tanpa harus buka backend.",
    profileLabel: "Profil aktif",
    profilePlaceholder: "Pilih profil dari onboarding",
    profileHint:
      "Ingatkan audiens bahwa profil ini sudah melalui ritual kamera sehingga log yang muncul terasa hidup.",
    profileEmpty: "Belum ada profil? buka halaman onboarding terlebih dahulu.",
    focusLabel: "Fokus",
    moodBaselineLabel: "Mood baseline",
    mirrorCamBadge: "Mirror Cam",
    mirrorCamDescription: "Kamera dan chat cepat sengaja ditempatkan dalam satu kolom supaya terasa seperti cermin interaktif.",
    sensorBadge: "Sensor emosi",
    sensorLoading: "Menyelaraskan data kamera & mood...",
    cvTitle: "Computer vision",
    cvEmpty: "Belum ada log kamera terbaru. Nyalakan mirror cam untuk memperbarui data.",
    moodEntryTitle: "Mood entry",
    noteLabel: "Catatan",
    confidenceLabel: "Confidence",
    moodSourceFallback: "demo",
    moodEmpty: "Belum ada mood entry. Isi form onboarding atau catat mood cepat.",
    presetBadge: "Preset cepat",
    presetDescription: "Pakai kalimat ini ketika ingin menunjukkan bagaimana Mirror menyesuaikan respon terhadap tema berbeda.",
    logsBadge: "Log percakapan",
    logsEmpty: "Pilih profil dulu untuk memulai.",
    logsLoading: "Memuat log percakapan...",
    sendPlaceholder: "Tulis pesanmu",
    sendButton: "Kirim",
    sending: "Mengirim...",
    typing: "Mirror sedang menulis...",
    miniChat: {
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
    },
    infoLoadProfiles: "Belum bisa memuat profil. Cek koneksi Supabase.",
    infoLoadLogs: "Belum bisa memuat log percakapan.",
    infoSensor: "Sensor emosi belum bisa dimuat. Coba refresh.",
    infoNoResponse: "Mirror tidak merespons. Coba lagi sebentar.",
    warmupMessage:
      "Hai {nickname}! Aku siap jadi teman curhatmu. Ceritakan saja apa yang ingin kamu uji di sesi demo ini.",
    presetList: [
      "Aku lagi overthinking tugas besok, bisa bantu tenangin?",
      "Boleh kasih refleksi dari mood baseline ku?",
      "Rekomendasi latihan singkat buat malam ini dong",
    ],
  },
  en: {
    heroBadge: "Camera Studio",
    heroTitle: "Post check-in chat 💬🪞",
    heroDescription:
      "Here Mirror already knows your vibe (camera + forms) and chats like a friend. The sensor panel shows where emotions are read so you can explain without opening the backend.",
    profileLabel: "Active profile",
    profilePlaceholder: "Choose a profile from onboarding",
    profileHint:
      "Remind testers this profile already used the camera ritual so the logs feel alive.",
    profileEmpty: "No profile yet? Open the onboarding page first.",
    focusLabel: "Focus",
    moodBaselineLabel: "Mood baseline",
    mirrorCamBadge: "Mirror Cam",
    mirrorCamDescription: "Camera and quick chat live in one column so it feels like an interactive mirror.",
    sensorBadge: "Emotion sensors",
    sensorLoading: "Syncing camera & mood data...",
    cvTitle: "Computer vision",
    cvEmpty: "No recent camera log. Turn on the mirror cam to refresh.",
    moodEntryTitle: "Mood entry",
    noteLabel: "Note",
    confidenceLabel: "Confidence",
    moodSourceFallback: "demo",
    moodEmpty: "No mood entry yet. Fill onboarding or log a quick mood.",
    presetBadge: "Quick presets",
    presetDescription: "Use these lines to show how Mirror adapts responses to different themes.",
    logsBadge: "Chat log",
    logsEmpty: "Pick a profile to start.",
    logsLoading: "Loading chat logs...",
    sendPlaceholder: "Write your message",
    sendButton: "Send",
    sending: "Sending...",
    typing: "Mirror is typing...",
    miniChat: {
      description: "Pick an onboarding profile then send a quick message to demo Mirror’s reply.",
      visionSynced: "Vision synced ⚡ {emotion} ({confidence}%)",
      visionHint: "Turn on the lab camera to give chat realtime expression context.",
      selectPlaceholder: "Choose profile",
      fetchProfilesError: "No profile found. Save the onboarding ritual first.",
      emptyNoProfile: "No profile yet.",
      emptyChat: "No chat yet. Type a message to start.",
      inputPlaceholderNoProfile: "Save onboarding first...",
      inputPlaceholder: "Type a message to Mirror...",
      sendLabel: "Send to Mirror",
      sendingLabel: "Mirror is typing...",
      noResponse: "Mirror hasn’t responded yet. Try again shortly.",
      logsLoading: "Loading chat logs...",
      selectProfilePrompt: "Pick a profile to start.",
    },
    infoLoadProfiles: "Profiles failed to load. Check Supabase connectivity.",
    infoLoadLogs: "Unable to load chat logs.",
    infoSensor: "Emotion sensors failed to load. Refresh the page.",
    infoNoResponse: "Mirror didn’t respond. Please try again.",
    warmupMessage:
      "Hi {nickname}! I’m ready to chat. Tell me what you want to test in this demo session.",
    presetList: [
      "I’m overthinking tomorrow’s tasks—help me calm down?",
      "Can you reflect on my mood baseline?",
      "Give me a quick practice for tonight.",
    ],
  },
} as const;

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
  const { language } = usePreferences();
  const locale = language === "en" ? "en-US" : "id-ID";
  const copy = studioCopy[language] ?? studioCopy.id;
  const focusCopy = onboardingCopy[language] ?? onboardingCopy.id;
  const focusLookup = useMemo(() => {
    const map = new Map<string, string>();
    (focusCopy.focusCatalog ?? onboardingCopy.id.focusCatalog).forEach((option) => {
      map.set(option.id, `${option.emoji} ${option.label}`.trim());
    });
    return map;
  }, [focusCopy]);
  const formatFocusAreas = useCallback(
    (values: string[]) => values.map((value) => focusLookup.get(value) ?? value),
    [focusLookup],
  );

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch(resolveApiUrl("/api/profiles"));
        if (!response.ok) throw new Error("Gagal memuat profil");
        const payload = (await response.json()) as RecentProfile[];
        setProfiles(payload);
        setSelectedProfileId((prev) => prev || payload[0]?.id || "");
      } catch (error) {
        console.error(error);
        setInfo(copy.infoLoadProfiles);
      }
    };
    loadProfiles();
  }, [copy.infoLoadProfiles]);

  const fetchLogs = useCallback(
    async (profileId: string) => {
      if (!profileId) {
        setChat([]);
        return;
      }
      setLogsLoading(true);
      try {
        const response = await fetch(resolveApiUrl(`/api/chat/logs?profileId=${profileId}`));
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
              content: copy.warmupMessage.replace("{nickname}", activeProfile.nickname),
            },
          ]);
        } else {
          setChat([]);
        }
      } catch (error) {
        console.error(error);
        setInfo(copy.infoLoadLogs);
      } finally {
        setLogsLoading(false);
      }
    },
    [activeProfile, copy.warmupMessage, copy.infoLoadLogs],
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
          fetch(resolveApiUrl(`/api/moods?profileId=${selectedProfileId}`)),
          fetch(resolveApiUrl(`/api/emotions?profileId=${selectedProfileId}&limit=1`)),
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
        setInfo(copy.infoSensor);
      } finally {
        setSensorLoading(false);
      }
    };
    loadSensors();
  }, [selectedProfileId, copy.infoSensor]);

  useEffect(() => {
    if (!selectedProfileId) return;
    const client = getBrowserSupabaseClient();
    const channel = client
      .channel(`camera-log-${selectedProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "camera_emotion_log",
          filter: `profile_id=eq.${selectedProfileId}`,
        },
        (payload) => {
          const newRow = payload.new as {
            emotion: string;
            confidence: number | null;
            created_at: string;
          };
          setSensors((prev) => ({
            ...prev,
            camera: {
              id: payload.new.id as string,
              emotion: newRow.emotion,
              confidence: newRow.confidence,
              createdAt: newRow.created_at,
            },
          }));
        },
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
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
      const response = await fetch(resolveApiUrl("/api/chat"), {
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
      setInfo(copy.infoNoResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">{copy.heroBadge}</p>
        <h1 className="text-4xl font-semibold">{copy.heroTitle}</h1>
        <p className="text-white/75">{copy.heroDescription}</p>
      </header>

      <section className="glass-card space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm uppercase tracking-[0.3em] text-white/50">{copy.profileLabel}</label>
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white sm:max-w-xs"
            value={selectedProfileId}
            onChange={(event) => setSelectedProfileId(event.target.value)}
          >
            <option value="">{copy.profilePlaceholder}</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
                {profile.nickname} • {formatFocusAreas(profile.focusAreas)[0] ?? "-"}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/50">
            {copy.profileHint}
          </p>
          {!profiles.length && (
            <p className="text-sm text-white/60">{copy.profileEmpty}</p>
          )}
        </div>
        {activeProfile && (
          <p className="text-sm text-white/70">
            {copy.focusLabel}: {formatFocusAreas(activeProfile.focusAreas).join(", ") || "-"} | {copy.moodBaselineLabel}:{" "}
            {activeProfile.moodBaseline}
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="glass-card space-y-6 p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.mirrorCamBadge}</p>
              <p className="text-sm text-white/70">{copy.mirrorCamDescription}</p>
            </div>
            <CameraLiquidWidget variant="full" profileId={selectedProfileId || null} />
            <MiniChat title={copy.logsBadge} copy={copy.miniChat} />
          </div>
          <section className="glass-card space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.sensorBadge}</p>
            {sensorLoading ? (
              <p className="text-sm text-white/60">{copy.sensorLoading}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{copy.cvTitle}</p>
                  {sensors.camera ? (
                    <>
                      <p className="mt-2 text-lg font-semibold text-white capitalize">
                        {sensors.camera.emotion}
                      </p>
                      <p className="text-xs text-white/60">
                        {copy.confidenceLabel} {sensors.camera.confidence ?? 0}% •{" "}
                        {new Date(sensors.camera.createdAt).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-white/60">{copy.cvEmpty}</p>
                  )}
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{copy.moodEntryTitle}</p>
                  {sensors.mood ? (
                    <>
                      <p className="mt-2 text-lg font-semibold text-white">{sensors.mood.mood}</p>
                      <p className="text-xs text-white/60">
                        {sensors.mood.source ?? copy.moodSourceFallback} •{" "}
                        {new Date(sensors.mood.createdAt).toLocaleString(locale)}
                      </p>
                      {sensors.mood.note && (
                        <p className="mt-1 text-xs text-white/60">
                          {copy.noteLabel}: {sensors.mood.note}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-white/60">{copy.moodEmpty}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
        <section className="glass-card space-y-6 p-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.presetBadge}</p>
            <p className="text-sm text-white/70">{copy.presetDescription}</p>
            <div className="flex flex-wrap gap-3">
              {(copy.presetList ?? studioCopy.id.presetList).map((preset) => (
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
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.logsBadge}</p>
            <div className="h-80 overflow-y-auto rounded-3xl border border-white/5 bg-white/5 p-4">
              {chat.length === 0 ? (
                <p className="text-sm text-white/60">
                  {logsLoading ? copy.logsLoading : copy.logsEmpty}
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
                  {loading && <p className="text-xs text-white/60">{copy.typing}</p>}
                  {logsLoading && <p className="text-xs text-white/60">{copy.logsLoading}</p>}
                </div>
              )}
            </div>
            <form onSubmit={handleSend} className="flex flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30"
                placeholder={copy.sendPlaceholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={!activeProfile}
              />
              <button
                type="submit"
                disabled={!activeProfile || !input.trim() || loading}
                className="white-pill rounded-full bg-white px-6 py-3 text-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? copy.sending : copy.sendButton}
              </button>
            </form>
            {info && <p className="text-sm text-rose-300">{info}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
