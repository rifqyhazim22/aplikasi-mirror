"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraLiquidWidget } from "@/components/camera-liquid";
import { MiniChat } from "@/components/mini-chat";
import Link from "next/link";
import type { VisionSignal } from "@/types/vision";

type ProfileOption = {
  id: string;
  nickname: string;
};

export default function CameraPage() {
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
        const response = await fetch("/api/profiles");
        if (!response.ok) throw new Error("Gagal memuat profil");
        const payload = (await response.json()) as ProfileOption[];
        setProfiles(payload);
        setActiveProfileId((prev) => prev || payload[0]?.id || "");
        setInfo(null);
      } catch (error) {
        console.error(error);
        setInfo("Belum ada profil tersimpan. Simpan ritual onboarding terlebih dulu.");
      }
    };
    load();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="emoji-heading">Liquid glass cam</p>
        <h1 className="text-4xl font-semibold">Nyalain kamera, liat vibemu kebaca 💜📸</h1>
        <p className="text-white/75">
          Halaman ini buat nunjukkin “Hei, Mirror baca ekspresi kamu di sini aja”. Ingatkan penguji bahwa feed
          nggak pernah dikirim ke server—jadi aman buat freestyle ekspresi lucu.
        </p>
      </header>
      <section className="glass-card space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Profil Mirror</p>
            <p className="text-sm text-white/70">
              Pilih profil onboarding supaya log kamera & chat memakai data yang sama.
            </p>
          </div>
          <select
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white sm:max-w-xs"
            value={activeProfileId}
            onChange={(event) => setActiveProfileId(event.target.value)}
            disabled={!profiles.length}
          >
            <option value="">Tanpa profil</option>
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
          title="Chat cepat"
          profiles={profiles}
          selectedProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          visionSignal={synchronizedVision}
        />
      </section>
      <div className="liquid-card flex flex-col gap-3 p-6 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-white font-semibold">Lanjutkan ritual onboarding?</p>
          <p className="text-white/60">
            Isi profil + mood baseline lalu lihat efeknya di Studio chat. Data otomatis tercatat ke Supabase.
          </p>
        </div>
        <Link
          href="/experience"
          className="white-pill rounded-full bg-white px-6 py-3 text-center text-sm transition hover:-translate-y-0.5"
        >
          Ke onboarding 💫
        </Link>
      </div>
    </main>
  );
}
