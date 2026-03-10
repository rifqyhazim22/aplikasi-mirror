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
    heroBadge: "Kamera refleksi",
    heroTitle: "Buka matamu, biarkan Mirror membaca suasana hatimu 💜📸",
    heroDescription:
      "Lepaskan bebanmu sejenak. Di sini, setiap ekspresi naturalmu dipahami tanpa penghakiman.",
    profileBadge: "Profil Mirror",
    profileDescription: "Pilih personamu agar obrolan terasa lebih intim.",
    selectPlaceholder: "Tanpa profil",
    infoNoProfile: "Kamu belum memiliki profil. Mulai perjalananmu dari ritual awal.",
    quickChatTitle: "Sapaan Singkat",
    continueTitle: "Ingin mendalami lebih jauh?",
    continueDescription: "Bentuk profil aslimu dan rasakan pengalaman Studio yang sepenuhnya personal.",
    continueCta: "Mulai ritual 💫",
    miniChat: {
      description:
        "Sapa Mirror dan lihat bagaimana cermin ini memantulkan perasaanmu.",
      visionSynced: "Tersinkronisasi ⚡ {emotion} ({confidence}%)",
      visionHint: "Aktifkan kamera agar Mirror dapat mengerti senyum maupun hela napasmu.",
      selectPlaceholder: "Pilih profil",
      fetchProfilesError: "Profil belum ditemukan. Mulailah dari ritual aslimu.",
      emptyNoProfile: "Belum ada identitas tersimpan.",
      emptyChat: "Hening. Sapalah untuk memulai.",
      inputPlaceholderNoProfile: "Bentuk profilmu dulu...",
      inputPlaceholder: "Ungkapkan sesuatu...",
      sendLabel: "Kirim",
      sendingLabel: "Mirror meresapi...",
      noResponse: "Mirror sedang hening. Tunggu sebentar.",
      logsLoading: "Mengumpulkan memori...",
      selectProfilePrompt: "Pilih personamu untuk memulai koneksi.",
    },
    visionPanel: undefined,
  },
  en: {
    heroBadge: "Reflection lab",
    heroTitle: "Open your eyes, let Mirror sense your mood 💜📸",
    heroDescription:
      "Let go for a moment. Here, your natural expressions are understood without judgment.",
    profileBadge: "Mirror profile",
    profileDescription: "Choose your persona for a more intimate connection.",
    selectPlaceholder: "No profile",
    infoNoProfile: "No profile found. Begin your journey from the initial ritual.",
    quickChatTitle: "Quick hello",
    continueTitle: "Want to dive deeper?",
    continueDescription: "Shape your true profile and feel a deeply personal Studio experience.",
    continueCta: "Start ritual 💫",
    miniChat: {
      description: "Say hello and watch the mirror reflect your feelings.",
      visionSynced: "Synced ⚡ {emotion} ({confidence}%)",
      visionHint: "Turn on the camera so Mirror understands your smiles and sighs.",
      selectPlaceholder: "Choose profile",
      fetchProfilesError: "Profile absent. Begin with your authentic ritual.",
      emptyNoProfile: "No identity saved.",
      emptyChat: "Silence. Say something to begin.",
      inputPlaceholderNoProfile: "Shape your profile first...",
      inputPlaceholder: "Express yourself...",
      sendLabel: "Send",
      sendingLabel: "Mirror is absorbing...",
      noResponse: "Mirror is quiet. Wait a moment.",
      logsLoading: "Gathering memories...",
      selectProfilePrompt: "Select your persona to start connecting.",
    },
    visionPanel: {
      idleHeading: "Deep analytics",
      idleDescription: "Camera resting or signal lost. Open Mirror Cam for live reflection.",
      signalHeading: "Realtime essence",
      metricsLabel: "Valence {valence} • Energy {energy}",
      cuesTitle: "Visual cues",
      cuesEmpty: "No recent cues caught.",
      headPoseTitle: "Posture",
      headPoseEmpty: "Posture unclear.",
      focusTitle: "Attention",
      attentionHigh: "deeply focused",
      attentionLow: "drifting",
      attentionBalanced: "balanced",
      attentionLabel: "Attention {percent} ({state})",
      attentionEmpty: "Attention reading unavailable.",
      expressionTitle: "Core expressions",
      expressionEmpty: "No expressions caught.",
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
