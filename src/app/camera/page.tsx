"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraLiquidWidget } from "@/components/camera-liquid";
import { MiniChat } from "@/components/mini-chat";
import { VisionAnalyticsPanel } from "@/components/vision-analytics";
import Link from "next/link";
import type { VisionSignal } from "@/types/vision";
import { resolveApiUrl } from "@/lib/api";
import { usePreferences } from "@/contexts/preferences-context";

type ProfileOption = {
  id: string;
  nickname: string;
};

const cameraCopy = {
  id: {
    heroBadge: "Liquid glass cam",
    heroTitle: "Nyalain kamera, liat vibemu kebaca 💜📸",
    heroDescription:
      "Halaman ini buat nunjukkin “Hei, Mirror baca ekspresi kamu di sini aja”. Ingatkan penguji bahwa feed nggak pernah dikirim ke server—jadi aman buat freestyle ekspresi lucu.",
    profileBadge: "Profil Mirror",
    profileDescription: "Pilih profil onboarding supaya log kamera & chat memakai data yang sama.",
    selectPlaceholder: "Tanpa profil",
    infoNoProfile: "Belum ada profil tersimpan. Simpan ritual onboarding terlebih dulu.",
    quickChatTitle: "Chat cepat",
    continueTitle: "Lanjutkan ritual onboarding?",
    continueDescription: "Isi profil + mood baseline lalu lihat efeknya di Studio chat. Data otomatis tercatat ke Supabase.",
    continueCta: "Ke onboarding 💫",
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
    visionPanel: undefined,
  },
  en: {
    heroBadge: "Liquid glass cam",
    heroTitle: "Turn on the cam, watch your vibe get read 💜📸",
    heroDescription:
      "This page proves Mirror reads expressions locally. Remind testers the feed never leaves the device—safe to freestyle goofy faces.",
    profileBadge: "Mirror profile",
    profileDescription: "Pick your onboarding profile so camera + chat share the same data.",
    selectPlaceholder: "No profile",
    infoNoProfile: "No saved profiles yet. Finish the onboarding ritual first.",
    quickChatTitle: "Quick chat",
    continueTitle: "Continue the onboarding ritual?",
    continueDescription: "Fill profile + mood baseline, then see the effect in Studio chat. Data syncs to Supabase automatically.",
    continueCta: "Go to onboarding 💫",
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
    visionPanel: {
      idleHeading: "Vision analytics",
      idleDescription: "Camera inactive or the signal is stale. Open Mirror Cam to see live data.",
      signalHeading: "Realtime mood signal",
      metricsLabel: "Valence {valence} • Energy {energy}",
      cuesTitle: "Camera cues",
      cuesEmpty: "No cues from the latest detection yet.",
      headPoseTitle: "Head pose",
      headPoseEmpty: "No head pose estimated yet.",
      focusTitle: "Camera focus",
      attentionHigh: "very focused",
      attentionLow: "needs relaxation",
      attentionBalanced: "balanced",
      attentionLabel: "Attention {percent} ({state})",
      attentionEmpty: "Vision hasn’t read visual attention yet.",
      expressionTitle: "Dominant expressions",
      expressionEmpty: "No expression data yet.",
    },
  },
} as const;

export default function CameraPage() {
  const { language } = usePreferences();
  const copy = cameraCopy[language] ?? cameraCopy.id;
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [visionSignal, setVisionSignal] = useState<VisionSignal | null>(null);
  const synchronizedVision = useMemo(() => {
    if (!visionSignal) return null;
    const sameProfile =
      !visionSignal.profileId ||
      !activeProfileId ||
      visionSignal.profileId === activeProfileId;
    const fresh = Date.now() - visionSignal.timestamp < 15000;
    return sameProfile && fresh ? visionSignal : null;
  }, [visionSignal, activeProfileId]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(resolveApiUrl("/api/profiles"));
        if (!response.ok) throw new Error("Gagal memuat profil");
        const payload = (await response.json()) as ProfileOption[];
        setProfiles(payload);
        setActiveProfileId((prev) => prev || payload[0]?.id || "");
        setInfo(null);
      } catch (error) {
        console.error(error);
        setInfo(copy.infoNoProfile);
      }
    };
    load();
  }, [copy.infoNoProfile]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="emoji-heading">{copy.heroBadge}</p>
        <h1 className="text-4xl font-semibold">{copy.heroTitle}</h1>
        <p className="text-white/75">{copy.heroDescription}</p>
      </header>
      <section className="glass-card space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.profileBadge}</p>
            <p className="text-sm text-white/70">{copy.profileDescription}</p>
          </div>
          <select
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white sm:max-w-xs"
            value={activeProfileId}
            onChange={(event) => setActiveProfileId(event.target.value)}
            disabled={!profiles.length}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
                {profile.nickname}
              </option>
            ))}
          </select>
        </div>
        {info && <p className="text-xs text-rose-300">{info}</p>}
        <CameraLiquidWidget
          variant="full"
          profileId={activeProfileId || null}
          onVisionSignal={(signal) => setVisionSignal(signal)}
        />
        <MiniChat
          title={copy.quickChatTitle}
          copy={copy.miniChat}
          profiles={profiles}
          selectedProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          visionSignal={synchronizedVision}
        />
        <VisionAnalyticsPanel signal={synchronizedVision} copy={copy.visionPanel} />
      </section>
      <div className="liquid-card flex flex-col gap-3 p-6 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-white font-semibold">{copy.continueTitle}</p>
          <p className="text-white/60">{copy.continueDescription}</p>
        </div>
        <Link
          href="/experience"
          className="white-pill rounded-full bg-white px-6 py-3 text-center text-sm transition hover:-translate-y-0.5"
        >
          {copy.continueCta}
        </Link>
      </div>
    </main>
  );
}
