"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Extracted helper to check Speech Support
const isSpeechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);


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
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

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

  const toggleListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === "en" ? "Voice typing is not supported in this browser." : "Fitur suara tidak didukung di browser ini.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = locale;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-12 text-white">
      <header className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📸</span>
          <h1 className="text-3xl font-light tracking-tight text-white">{copy.heroTitle}</h1>
        </div>
        <p className="text-white/60 text-sm font-medium tracking-wide max-w-2xl">{copy.heroDescription}</p>
      </header>

      <section className="glass-card flex flex-col gap-4 sm:flex-row sm:items-center p-5 z-10 w-full xl:w-2/3">
        <label className="text-xs font-semibold tracking-wider text-white/50 uppercase px-1">{copy.profileLabel}</label>
        <select
          className="glass-input w-full rounded-full h-11 px-4 text-white text-sm focus:outline-none focus:ring-0 transition-all duration-300 sm:max-w-xs appearance-none"
          value={selectedProfileId}
          onChange={(event) => setSelectedProfileId(event.target.value)}
        >
          <option value="" className="text-slate-900">{copy.profilePlaceholder}</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="text-slate-900">
              {profile.nickname} • {formatFocusAreas(profile.focusAreas)[0] ?? "-"}
            </option>
          ))}
        </select>
        {!profiles.length && (
          <p className="text-sm text-yellow-400/80 ml-2">{copy.profileEmpty}</p>
        )}
        {activeProfile && (
          <div className="text-xs text-white/60 ml-auto bg-white/5 px-4 py-2 flex items-center gap-2 rounded-full border border-white/10">
            <span className="uppercase tracking-widest text-[10px] text-white/40">Mood Baseline:</span> {activeProfile.moodBaseline}
          </div>
        )}
      </section>

      <section className="flex flex-col lg:flex-row gap-6 mt-2 relative z-10" style={{ height: 'max(65vh, 600px)' }}>
        {/* Left Column: Video Feed (70%) */}
        <section className="flex-[7] relative rounded-[2rem] overflow-hidden glass-card border border-white/10 shadow-2xl flex flex-col">
          {/* Top Overlay */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
            <div className="glass-card rounded-full px-4 py-2 flex items-center gap-2 shadow-lg bg-black/40">
              <div className="size-2 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Live AI Analysis</span>
            </div>
          </div>

          <div className="h-full w-full relative -m-4 sm:m-0">
            <CameraLiquidWidget variant="full" profileId={selectedProfileId || null} />
          </div>

          {/* Bottom Telemetry Pills */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center flex-wrap gap-4 z-10 px-8 pointer-events-none">
            <div className="glass-card bg-black/40 rounded-full px-5 py-3 flex items-center gap-3 shadow-lg backdrop-blur-md">
              <span className="text-sky-400 text-xl">👁️</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">Expression</span>
                <span className="text-sm font-medium text-white">{sensors.camera?.emotion || "Scanning"} <span className="text-sky-400 ml-1">{sensors.camera?.confidence || 0}%</span></span>
              </div>
            </div>
            <div className="glass-card bg-black/40 rounded-full px-5 py-3 flex items-center gap-3 shadow-lg backdrop-blur-md">
              <span className="text-purple-400 text-xl">✨</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">Mood Context</span>
                <span className="text-sm font-medium text-white">{sensors.mood?.mood || "Awaiting entry"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: AI Chat (30%) */}
        <section className="flex-[4] xl:flex-[3] glass-card rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-inner">
                <span className="text-white">✨</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Mirror AI</h2>
                <p className="text-xs text-sky-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                  Active Monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-white/5 z-0 relative">
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-2">
              {(copy.presetList ?? studioCopy.id.presetList).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInput(preset)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {chat.length === 0 ? (
              <p className="text-xs text-white/40 text-center mt-10">
                {logsLoading ? copy.logsLoading : copy.logsEmpty}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {chat.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                    {message.role === 'assistant' && (
                      <div className="size-8 rounded-full bg-sky-400/20 flex items-center justify-center shrink-0 border border-sky-400/30">
                        <span className="text-sky-400 text-xs">✨</span>
                      </div>
                    )}
                    <div className={`${message.role === 'assistant' ? 'glass-card bg-black/20 border-white/5 rounded-tl-sm text-white/90' : 'bg-sky-400 text-slate-900 shadow-lg rounded-tr-sm'} p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] font-medium`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && <p className="text-xs text-white/40 text-center mt-2 animate-pulse">{copy.typing}</p>}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md z-10">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                className="w-full glass-input bg-black/20 rounded-full pl-5 pr-20 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 placeholder:text-white/40 text-white transition-all disabled:opacity-50"
                placeholder={copy.sendPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!activeProfile}
              />
              {isSpeechSupported && activeProfile && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Voice Typing"
                  className={`absolute right-12 rounded-full p-2 transition flex items-center justify-center ${isListening ? "text-purple-300 animate-pulse bg-purple-500/20" : "text-white/40 hover:text-white/80"}`}
                >
                  🎤
                </button>
              )}
              <button
                type="submit" disabled={!activeProfile || !input.trim() || loading}
                className="absolute right-1.5 size-10 rounded-full bg-sky-400 text-slate-900 hover:bg-sky-400/90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="font-black text-sm group-hover:-translate-y-0.5 transition-transform">↑</span>
              </button>
            </form>
            {info && <p className="text-[10px] text-rose-300 mt-2 text-center">{info}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
