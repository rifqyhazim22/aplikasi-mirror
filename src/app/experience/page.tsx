"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { usePreferences } from "@/contexts/preferences-context";
import { onboardingCopy } from "@/lib/onboarding-i18n";

const focusCatalog = [
  { id: "stress", label: "Stress akademik", emoji: "📚", blurb: "Deadline, tugas, dan rasa takut gagal." },
  { id: "relationship", label: "Hubungan & pertemanan", emoji: "💞", blurb: "Ngatur emosi dengan pasangan atau sahabat." },
  { id: "self-love", label: "Self-love & growth", emoji: "🌱", blurb: "Biar kamu makin cinta diri dan percaya diri." },
  { id: "career", label: "Karier & masa depan", emoji: "🚀", blurb: "Rencana kerja, magang, sampai passion project." },
] as const;

const moodCatalog = [
  { id: "tenang", label: "Tenang stabil", emoji: "🌤️", blurb: "Butuh ruang aman untuk cerita pelan." },
  { id: "bersemangat", label: "Bersemangat", emoji: "⚡️", blurb: "Suka eksplor ide, perlu grounding lembut." },
  { id: "lelah", label: "Sering lelah", emoji: "🌧️", blurb: "Energi cepat turun, butuh ritme stabil." },
] as const;

const mbtiCatalog = [
  { code: "INFJ", name: "Advocate", spark: "Empatik & penuh makna" },
  { code: "INFP", name: "Mediator", spark: "Imaginatif & idealis" },
  { code: "ENFJ", name: "Protagonist", spark: "Leader hangat" },
  { code: "ENFP", name: "Campaigner", spark: "Optimis & spontan" },
  { code: "INTJ", name: "Architect", spark: "Visioner & strategis" },
  { code: "INTP", name: "Logician", spark: "Analitis & curious" },
  { code: "ENTJ", name: "Commander", spark: "Tegas & terstruktur" },
  { code: "ENTP", name: "Debater", spark: "Eksplor ide liar" },
] as const;

const enneagramCatalog = [
  { code: "1", title: "The Reformer", spark: "Perfeksionis, peduli nilai" },
  { code: "2", title: "The Helper", spark: "Hangat, suka membantu" },
  { code: "3", title: "The Achiever", spark: "Ambisius, fokus pencapaian" },
  { code: "4", title: "The Individualist", spark: "Autentik & emosional" },
  { code: "5", title: "The Investigator", spark: "Observan & private" },
  { code: "6", title: "The Loyalist", spark: "Setia, cari rasa aman" },
  { code: "7", title: "The Enthusiast", spark: "Petualang, fun" },
  { code: "8", title: "The Challenger", spark: "Protektif, berani bersuara" },
  { code: "9", title: "The Peacemaker", spark: "Tenang, cari harmoni" },
] as const;

const archetypeCatalog = [
  { id: "caregiver", label: "Caregiver", spark: "Peluk paling hangat" },
  { id: "creator", label: "Creator", spark: "Selalu punya ide baru" },
  { id: "explorer", label: "Explorer", spark: "Penasaran & suka petualangan" },
  { id: "hero", label: "Hero", spark: "Tahan banting, siap bantu" },
  { id: "lover", label: "Lover", spark: "Peka hubungan & rasa nyaman" },
  { id: "magician", label: "Magician", spark: "Suka transformasi" },
  { id: "sage", label: "Sage", spark: "Bijak & reflektif" },
] as const;

const zodiacCatalog = [
  { id: "aries", label: "Aries ♈︎", start: [3, 21], end: [4, 19] },
  { id: "taurus", label: "Taurus ♉︎", start: [4, 20], end: [5, 20] },
  { id: "gemini", label: "Gemini ♊︎", start: [5, 21], end: [6, 20] },
  { id: "cancer", label: "Cancer ♋︎", start: [6, 21], end: [7, 22] },
  { id: "leo", label: "Leo ♌︎", start: [7, 23], end: [8, 22] },
  { id: "virgo", label: "Virgo ♍︎", start: [8, 23], end: [9, 22] },
  { id: "libra", label: "Libra ♎︎", start: [9, 23], end: [10, 22] },
  { id: "scorpio", label: "Scorpio ♏︎", start: [10, 23], end: [11, 21] },
  { id: "sagittarius", label: "Sagittarius ♐︎", start: [11, 22], end: [12, 21] },
  { id: "capricorn", label: "Capricorn ♑︎", start: [12, 22], end: [1, 19] },
  { id: "aquarius", label: "Aquarius ♒︎", start: [1, 20], end: [2, 18] },
  { id: "pisces", label: "Pisces ♓︎", start: [2, 19], end: [3, 20] },
] as const;

const onboardingSteps = [
  { id: "persona", title: "Persona Mirror", subtitle: "Nama panggilan + fokus" },
  { id: "traits", title: "Mood baseline", subtitle: "MBTI & Enneagram" },
  { id: "ritual", title: "Mood ritual", subtitle: "Jurnal singkat" },
] as const;
type StepId = (typeof onboardingSteps)[number]["id"];

const flowModules = [
  { title: "Lab Kamera", emoji: "🔮", href: "/camera", blurb: "Tunjukkan CV Mirror & log emosi realtime." },
  { title: "Studio Chat", emoji: "💬", href: "/studio", blurb: "Gunakan persona baru untuk curhat." },
  { title: "Mood Timeline", emoji: "📊", href: "/stats", blurb: "Validasi Supabase menyimpan data terbuka." },
  { title: "Insight CBT", emoji: "🧠", href: "/insights", blurb: "Mapping value primer Mirror Word." },
] as const;

const profileSchema = z.object({
  nickname: z.string().min(2),
  focusAreas: z.array(z.string()).min(1),
  consentCamera: z.boolean(),
  consentData: z.boolean(),
  moodBaseline: z.enum(["tenang", "bersemangat", "lelah"] as const),
  mbtiType: z.string().min(3).max(4),
  enneagramType: z.string().min(1).max(2),
  primaryArchetype: z.string().min(3),
});

type ProfileForm = z.infer<typeof profileSchema>;

type RecentProfile = {
  id: string;
  nickname: string;
  focusAreas: string[];
  moodBaseline: string;
  createdAt: string;
};

type MoodForm = {
  profileId: string;
  mood: string;
  note: string;
};

const initialForm: ProfileForm = {
  nickname: "",
  focusAreas: [],
  consentCamera: true,
  consentData: true,
  moodBaseline: "tenang",
  mbtiType: "INFJ",
  enneagramType: "2",
  primaryArchetype: "caregiver",
};

function detectZodiac(date: string) {
  if (!date) return null;
  const [, monthStr, dayStr] = date.split("-");
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!month || !day) return null;
  for (const sign of zodiacCatalog) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    if (startMonth < endMonth) {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return sign;
      }
    } else {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        month > startMonth ||
        month < endMonth
      ) {
        return sign;
      }
    }
  }
  return null;
}

function OptionCard({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
        active ? "border-white bg-white/10 text-white" : "border-white/20 text-white/70 hover:border-white/40"
      }`}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/60">{subtitle}</p>
    </button>
  );
}

export default function ExperiencePage() {
  const { language } = usePreferences();
  const copy = onboardingCopy[language] ?? onboardingCopy.id;
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [moodForm, setMoodForm] = useState<MoodForm>({ profileId: "", mood: "", note: "" });
  const [moodStatus, setMoodStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [moodMessage, setMoodMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepId>("persona");
  const [birthDate, setBirthDate] = useState("");

  const isComplete = useMemo(
    () => form.nickname.trim().length >= 2 && form.focusAreas.length > 0 && form.consentData === true,
    [form],
  );
  const activeIndex = onboardingSteps.findIndex((step) => step.id === activeStep);
  const goToStep = (id: StepId) => setActiveStep(id);
  const zodiacInsight = useMemo(() => detectZodiac(birthDate), [birthDate]);

  const toggleFocus = (label: string) => {
    setForm((prev) => {
      const exists = prev.focusAreas.includes(label);
      const next = exists ? prev.focusAreas.filter((item) => item !== label) : [...prev.focusAreas, label];
      return { ...prev, focusAreas: next.slice(0, 3) };
    });
  };

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchProfiles = async () => {
    try {
      setRecentLoading(true);
      const response = await fetch("/api/profiles");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const payload = (await response.json()) as RecentProfile[];
      setRecentProfiles(payload);
      setMoodForm((prev) => ({ ...prev, profileId: prev.profileId || payload[0]?.id || "" }));
    } catch (error) {
      console.error(error);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;
    setStatus("saving");
    setMessage(null);
    try {
      profileSchema.parse(form);
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Mirror lagi kesulitan menyimpan data");
      setStatus("success");
      setMessage("Profil tersimpan. Siap lanjut ke mood ritual ✨");
      fetchProfiles();
      setActiveStep("ritual");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Terjadi kendala. Coba beberapa detik lagi.");
    }
  };

  const handleMoodSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!moodForm.profileId || moodForm.mood.trim().length < 2) {
      setMoodMessage("Pilih profil dan isi mood minimal 2 huruf");
      setMoodStatus("error");
      return;
    }
    setMoodStatus("saving");
    setMoodMessage(null);
    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: moodForm.profileId,
          mood: moodForm.mood,
          note: moodForm.note || undefined,
          source: "sandbox",
        }),
      });
      if (!response.ok) throw new Error("Gagal mencatat mood");
      setMoodStatus("success");
      setMoodMessage("Mood entry dicatat. Siap tampilkan di Studio.");
      setMoodForm((prev) => ({ ...prev, mood: "", note: "" }));
    } catch (error) {
      console.error(error);
      setMoodStatus("error");
      setMoodMessage(error instanceof Error ? error.message : "Server tidak merespons, coba ulang.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 text-white">
      <header className="space-y-4">
        <p className="emoji-heading">Teman dalam genggaman</p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{copy.heroTitle}</h1>
        <p className="text-lg text-white/80">{copy.heroDescription}</p>
      </header>

      <nav className="glass-card flex flex-col gap-4 p-5 text-sm text-white/70">
        <div className="flex flex-wrap gap-4">
          {onboardingSteps.map((step, index) => {
            const completed = index < activeIndex;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={`flex min-w-[160px] flex-1 flex-col rounded-3xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-white bg-white/10 text-white shadow-lg"
                    : completed
                      ? "border-emerald-300/40 text-emerald-100 hover:border-emerald-200/70"
                      : "border-white/15 text-white/60 hover:text-white"
                }`}
              >
                <span className="text-xs uppercase tracking-[0.4em] text-white/40">Langkah {index + 1}</span>
                <span className="text-base font-semibold text-white">{step.title}</span>
                <span className="text-[11px] text-white/60">{step.subtitle}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-white/50">
          Langkah 1–2 berada di form Supabase, sedangkan langkah 3 adalah mood ritual tambahan sebelum masuk Lab Kamera.
        </p>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeStep === "persona" && (
              <section className="glass-card space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <p className="emoji-heading">Langkah 1</p>
                  <h2 className="text-2xl font-semibold text-white">Persona Mirror + fokus 😌</h2>
                  <p className="text-sm text-white/70">Nickname + pilihan fokus bikin Mirror terasa personal.</p>
                </div>
                <div>
                  <label className="text-sm text-white/70">Nama panggilan</label>
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30"
                    value={form.nickname}
                    onChange={(event) => updateField("nickname", event.target.value)}
                    placeholder="contoh: Nara, Mas Gio, Kak Mira"
                  />
                </div>
                <div>
                  <p className="text-sm text-white/70">Topik utama yang mau kamu fokuskan</p>
                  <p className="text-xs text-white/50">Pilih maksimal tiga. Bisa kamu ubah kapan saja.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {focusCatalog.map((option) => (
                      <OptionCard
                        key={option.id}
                        title={`${option.emoji} ${option.label}`}
                        subtitle={option.blurb}
                        active={form.focusAreas.includes(option.label)}
                        onClick={() => toggleFocus(option.label)}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={form.consentData}
                      onChange={(event) => updateField("consentData", event.target.checked)}
                    />
                    Aku mengerti kebijakan privasi Mirror.
                  </label>
                  <label className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={form.consentCamera}
                      onChange={(event) => updateField("consentCamera", event.target.checked)}
                    />
                    Izinkan analisis ekspresi (opsional).
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep("traits")}
                    disabled={!isComplete}
                    className="white-pill rounded-full bg-white px-6 py-3 text-sm text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Lanjut ke langkah 2
                  </button>
                  <p className="text-xs text-white/50">Checklist ini menggantikan slide onboarding lama.</p>
                </div>
              </section>
            )}

            {activeStep === "traits" && (
              <section className="glass-card space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <p className="emoji-heading">Langkah 2</p>
                  <h2 className="text-2xl font-semibold text-white">Mood baseline + tipe kepribadian ✍️</h2>
                  <p className="text-sm text-white/70">Data ini menyetir tone Studio & Insight tanpa kamu harus mengetik banyak.</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Mood baseline</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {moodCatalog.map((mood) => (
                      <OptionCard
                        key={mood.id}
                        title={`${mood.emoji} ${mood.label}`}
                        subtitle={mood.blurb}
                        active={form.moodBaseline === mood.id}
                        onClick={() => updateField("moodBaseline", mood.id)}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">MBTI</p>
                    <div className="grid gap-2">
                      {mbtiCatalog.map((item) => (
                        <OptionCard
                          key={item.code}
                          title={`${item.code} • ${item.name}`}
                          subtitle={item.spark}
                          active={form.mbtiType === item.code}
                          onClick={() => updateField("mbtiType", item.code)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">Enneagram</p>
                    <div className="grid gap-2">
                      {enneagramCatalog.map((item) => (
                        <OptionCard
                          key={item.code}
                          title={`Tipe ${item.code} • ${item.title}`}
                          subtitle={item.spark}
                          active={form.enneagramType === item.code}
                          onClick={() => updateField("enneagramType", item.code)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70">Archetype Mirror</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {archetypeCatalog.map((item) => (
                      <OptionCard
                        key={item.id}
                        title={item.label}
                        subtitle={item.spark}
                        active={form.primaryArchetype === item.id}
                        onClick={() => updateField("primaryArchetype", item.id)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/70">Tanggal lahir (opsional)</p>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                  />
                  {zodiacInsight && (
                    <p className="mt-2 text-sm text-white/70">
                      {zodiacInsight.label} — Mirror pakai ini buat ice breaker manis di chat.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep("persona")}
                    className="rounded-full border border-white/30 px-6 py-3 text-sm text-white/70 transition hover:border-white hover:text-white"
                  >
                    Kembali ke langkah 1
                  </button>
                  <button
                    type="submit"
                    disabled={!isComplete || status === "saving"}
                    className="white-pill rounded-full bg-white px-6 py-3 text-sm text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === "saving" ? "Sedang menyimpan..." : "Simpan profil ke Supabase"}
                  </button>
                </div>
                {message && <p className={`text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>{message}</p>}
              </section>
            )}
          </form>

          {activeStep === "ritual" && (
            <section className="glass-card space-y-5 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="emoji-heading">Langkah 3</p>
                <h2 className="text-2xl font-semibold text-white">Mood ritual + log demo 🎧</h2>
                <p className="text-sm text-white/70">
                  Gunakan jurnal singkat ini sebelum masuk Lab Kamera. Log otomatis tersimpan di Supabase.
                </p>
              </div>
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Gunakan profil</label>
                  <select
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                    value={moodForm.profileId}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, profileId: event.target.value }))}
                  >
                    <option value="">Pilih salah satu</option>
                    {recentProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
                        {profile.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/70">Mood / vibe hari ini</label>
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                    value={moodForm.mood}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, mood: event.target.value }))}
                    placeholder="contoh: mellow tapi pengen validasi"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Catatan (opsional)</label>
                  <textarea
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                    rows={3}
                    value={moodForm.note}
                    onChange={(event) => setMoodForm((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="cerita singkat buat memicu Studio chat"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="white-pill rounded-full bg-white px-6 py-3 text-sm text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!moodForm.profileId || moodStatus === "saving"}
                  >
                    {moodStatus === "saving" ? "Mencatat..." : "Simpan mood ritual"}
                  </button>
                  {moodMessage && (
                    <span className={`text-xs ${moodStatus === "success" ? "text-emerald-300" : "text-rose-300"}`}>
                      {moodMessage}
                    </span>
                  )}
                </div>
              </form>
              <p className="text-xs text-white/50">
                Setelah log tersimpan, buka <Link href="/camera" className="underline">Lab Kamera</Link> atau <Link href="/studio" className="underline">Studio</Link> buat nerusin cerita.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="glass-card space-y-4 p-6">
            <p className="emoji-heading">Flow eksklusif</p>
            <h2 className="text-xl font-semibold text-white">Setelah onboarding selesai</h2>
            <div className="space-y-3">
              {flowModules.map((module) => (
                <Link
                  href={module.href}
                  key={module.href}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white hover:text-white"
                >
                  <span>
                    <span className="mr-2 text-lg">{module.emoji}</span>
                    {module.title}
                  </span>
                  <span className="text-xs text-white/50">{module.blurb}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="glass-card space-y-3 p-6">
            <p className="emoji-heading">Playbook demo</p>
            <p className="text-lg font-semibold text-white">Narasi Mirror Word versi singkat ✨</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>1. “Mirror cuma baca ekspresi lokal—kameramu aman.”</li>
              <li>2. “Selesai ritual ini kita loncat ke Lab Kamera lalu Studio chat.”</li>
              <li>3. “Semua data transparan di Supabase, gampang jadi APK.”</li>
            </ul>
          </section>
          <section className="glass-card space-y-3 p-6">
            <p className="emoji-heading">Riwayat onboarding</p>
            {recentLoading ? (
              <p className="text-sm text-white/60">Memuat data...</p>
            ) : recentProfiles.length === 0 ? (
              <p className="text-sm text-white/60">Belum ada data tersimpan. Isi form kiri dulu.</p>
            ) : (
              <ul className="divide-y divide-white/5 text-sm text-white/80">
                {recentProfiles.map((profile) => (
                  <li key={profile.id} className="py-3">
                    <p className="font-semibold text-white">{profile.nickname}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mood • {profile.moodBaseline}</p>
                    <p className="text-white/60">
                      Fokus: {profile.focusAreas.join(", ") || "-"} · {new Date(profile.createdAt).toLocaleString("id-ID")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
