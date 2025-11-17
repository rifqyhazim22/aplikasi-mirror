"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";

const focusOptions = ["Stress akademik", "Hubungan", "Karier", "Self-growth"] as const;
const moodBaselineOptions = ["tenang", "bersemangat", "lelah"] as const;

const profileSchema = z.object({
  nickname: z.string().min(2),
  focusAreas: z.array(z.string()).min(1),
  consentCamera: z.boolean(),
  consentData: z.boolean(),
  moodBaseline: z.enum(moodBaselineOptions),
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

export default function ExperiencePage() {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [moodForm, setMoodForm] = useState<MoodForm>({ profileId: "", mood: "", note: "" });
  const [moodStatus, setMoodStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [moodMessage, setMoodMessage] = useState<string | null>(null);

  const isComplete = useMemo(
    () =>
      form.nickname.trim().length >= 2 &&
      form.focusAreas.length > 0 &&
      form.consentData === true,
    [form],
  );

  const toggleFocus = (value: string) => {
    setForm((prev) => {
      const exists = prev.focusAreas.includes(value);
      const next = exists
        ? prev.focusAreas.filter((item) => item !== value)
        : [...prev.focusAreas, value];
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
      setMoodForm((prev) => ({
        ...prev,
        profileId: prev.profileId || payload[0]?.id || "",
      }));
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Mirror lagi kesulitan menyimpan data");
      }
      setStatus("success");
      setMessage("Profil tersimpan. Kamu bisa lanjut demonstrasi chat 🎉");
      fetchProfiles();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Terjadi kendala. Coba beberapa detik lagi.",
      );
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
      if (!response.ok) {
        throw new Error("Gagal mencatat mood");
      }
      setMoodStatus("success");
      setMoodMessage("Mood entry dicatat. Gunakan ini ketika demo percakapan.");
      setMoodForm((prev) => ({ ...prev, mood: "", note: "" }));
    } catch (error) {
      console.error(error);
      setMoodStatus("error");
      setMoodMessage(
        error instanceof Error ? error.message : "Server tidak merespons, coba ulang.",
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Sandbox</p>
        <h1 className="text-4xl font-semibold">Onboarding Empatik</h1>
        <p className="text-white/75">
          Form ini menyimulasikan langkah awal Mirror ketika mengetahui preferensi pengguna.
          Tidak ada login maupun payment, semua fokus ke data primer yang langsung tersimpan di
          Supabase.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="glass-card space-y-6 p-6">
          <div>
            <label className="text-sm text-white/70">Nama panggilan</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30"
              value={form.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
              placeholder="contoh: Nara"
            />
          </div>
          <div>
            <p className="text-sm text-white/70">Topik utama yang ingin kamu fokuskan</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {focusOptions.map((option) => {
                const active = form.focusAreas.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => toggleFocus(option)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-white text-purple-900"
                        : "border border-white/20 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="glass-card space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-white/70">Mood baseline</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white"
                value={form.moodBaseline}
                onChange={(event) =>
                  updateField("moodBaseline", event.target.value as ProfileForm["moodBaseline"])
                }
              >
                {moodBaselineOptions.map((option) => (
                  <option key={option} value={option} className="bg-purple-900 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70">MBTI</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white text-center"
                value={form.mbtiType}
                onChange={(event) => updateField("mbtiType", event.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="text-sm text-white/70">Enneagram</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white text-center"
                value={form.enneagramType}
                onChange={(event) => updateField("enneagramType", event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/70">Archetype utama</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              value={form.primaryArchetype}
              onChange={(event) => updateField("primaryArchetype", event.target.value)}
              placeholder="contoh: caregiver, explorer, hero"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.consentData}
                onChange={(event) => updateField("consentData", event.target.checked)}
              />
              Saya paham data disimpan di Supabase untuk kepentingan demo.
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.consentCamera}
                onChange={(event) => updateField("consentCamera", event.target.checked)}
              />
              Izinkan Mirror membaca ekspresi (opsional)
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={!isComplete || status === "saving"}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "saving" ? "Sedang menyimpan..." : "Simpan profil ke Supabase"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setStatus("idle");
              setMessage(null);
            }}
            className="w-full rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white"
          >
            Reset form
          </button>
        </div>
        {message && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <section className="glass-card space-y-4 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white">Riwayat 10 profil terbaru</h2>
          <p className="text-sm text-white/70">
            Pakai daftar ini buat menunjukkan bahwa data benar-benar tersimpan dan dapat dipakai
            ulang untuk fitur berikutnya.
          </p>
        </div>
        {recentLoading ? (
          <p className="text-sm text-white/60">Memuat data...</p>
        ) : recentProfiles.length === 0 ? (
          <p className="text-sm text-white/60">
            Belum ada data tersimpan. Isi form di atas untuk membuat profil baru.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentProfiles.map((profile) => (
              <li key={profile.id} className="py-3 text-sm text-white/80">
                <p className="font-semibold text-white">{profile.nickname}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Mood • {profile.moodBaseline}
                </p>
                <p className="text-white/60">
                  Fokus: {profile.focusAreas.join(", ") || "-"} | {new Date(profile.createdAt).toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-card space-y-4 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white">Catat mood demo</h2>
          <p className="text-sm text-white/70">
            Kirim mood entry cepat untuk profil yang dipilih. Ini membantu saat presentasi karena
            kamu bisa menunjukkan Supabase menerima lebih dari sekadar onboarding.
          </p>
        </div>
        <form onSubmit={handleMoodSubmit} className="grid gap-4 sm:grid-cols-3">
          <select
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            value={moodForm.profileId}
            onChange={(event) =>
              setMoodForm((prev) => ({ ...prev, profileId: event.target.value }))
            }
          >
            <option value="" className="bg-purple-900 text-white">
              Pilih profil
            </option>
            {recentProfiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-purple-900 text-white">
                {profile.nickname}
              </option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            placeholder="Mood sekarang"
            value={moodForm.mood}
            onChange={(event) =>
              setMoodForm((prev) => ({ ...prev, mood: event.target.value }))
            }
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            placeholder="Catatan singkat (opsional)"
            value={moodForm.note}
            onChange={(event) =>
              setMoodForm((prev) => ({ ...prev, note: event.target.value }))
            }
          />
          <div className="sm:col-span-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={moodStatus === "saving"}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {moodStatus === "saving" ? "Mencatat..." : "Simpan mood entry"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMoodForm((prev) => ({ ...prev, mood: "", note: "" }));
                setMoodStatus("idle");
                setMoodMessage(null);
              }}
              className="w-full rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white"
            >
              Reset mood form
            </button>
          </div>
        </form>
        {moodMessage && (
          <p
            className={`text-sm ${
              moodStatus === "success" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {moodMessage}
          </p>
        )}
      </section>
    </main>
  );
}
