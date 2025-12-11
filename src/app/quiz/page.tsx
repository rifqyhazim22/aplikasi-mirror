"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { resolveApiUrl } from "@/lib/api";
import { usePreferences } from "@/contexts/preferences-context";

type Step = 1 | 2 | 3;

const mbtiOptions = ["INFP", "INFJ", "ENFP", "ENFJ", "INTJ", "ENTJ", "ISFP", "ESFP"];
const enneagramOptions = ["1 Reformist", "2 Caregiver", "3 Achiever", "4 Individualist", "5 Observer", "6 Loyalist", "7 Enthusiast", "8 Challenger", "9 Peacemaker"];

const quizCopy = {
  id: {
    badge: "Personality Lab",
    title: "Mini quiz Mirror ✨",
    description:
      "Isian cepat supaya Mirror tahu kamu tipe apa. 3 langkah aja—tanpa email, tanpa sales pitch. Hasilnya langsung nyambung ke chat Studio.",
    stepLabel: "Langkah",
    stepOneTitle: "Nama panggilan favorit",
    stepTwoTitle: "Energi MBTI",
    stepThreeTitle: "Enneagram + fokus curhat",
    next: "Lanjut ➡️",
    back: "⬅️ Kembali",
    save: "Simpan hasil 💾",
    saving: "Menyimpan...",
    success: "Yay! Profil psikologi tersimpan. Gunakan hasilnya di Studio atau onboarding ✨",
    error: "Server lagi capek. Coba ulang sebentar lagi 🙏",
    saveError: "Gagal menyimpan kuis",
    defaultNickname: "Gemini Soul",
    defaultFocus: "Aku ingin Mirror membantuku memahami pola overthinking 🌧️",
  },
  en: {
    badge: "Personality Lab",
    title: "Mirror mini quiz ✨",
    description:
      "Quick inputs so Mirror knows your type. Just 3 steps—no email, no pitch. The results flow straight into Studio chat.",
    stepLabel: "Step",
    stepOneTitle: "Favorite nickname",
    stepTwoTitle: "MBTI energy",
    stepThreeTitle: "Enneagram + focus",
    next: "Next ➡️",
    back: "⬅️ Back",
    save: "Save results 💾",
    saving: "Saving...",
    success: "Saved! Personality profile is ready for Studio or onboarding ✨",
    error: "Server is tired. Try again shortly 🙏",
    saveError: "Failed to save quiz",
    defaultNickname: "Gemini Soul",
    defaultFocus: "I want Mirror to help me understand my overthinking pattern 🌧️",
  },
} as const;

export default function QuizPage() {
  const { language } = usePreferences();
  const copy = quizCopy[language] ?? quizCopy.id;
  const defaultsRef = useRef<{ nickname: string; focus: string }>({
    nickname: quizCopy.id.defaultNickname,
    focus: quizCopy.id.defaultFocus,
  });
  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState<string>(copy.defaultNickname);
  const [mbti, setMbti] = useState("INFP");
  const [enneagram, setEnneagram] = useState("4 Individualist");
  const [focus, setFocus] = useState<string>(copy.defaultFocus);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const prevDefaults = defaultsRef.current;
    if (nickname === prevDefaults.nickname || nickname === quizCopy.en.defaultNickname || nickname === quizCopy.id.defaultNickname) {
      setNickname(copy.defaultNickname);
    }
    if (focus === prevDefaults.focus || focus === quizCopy.en.defaultFocus || focus === quizCopy.id.defaultFocus) {
      setFocus(copy.defaultFocus);
    }
    defaultsRef.current = { nickname: copy.defaultNickname, focus: copy.defaultFocus };
  }, [language, copy.defaultNickname, copy.defaultFocus, nickname, focus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch(resolveApiUrl("/api/personality"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          mbtiResult: mbti,
          enneagramResult: enneagram,
          focusNote: focus,
        }),
      });
      if (!response.ok) throw new Error(copy.saveError);
      setStatus("success");
      setMessage(copy.success);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(copy.error);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">{copy.badge}</p>
        <h1 className="text-4xl font-semibold">{copy.title}</h1>
        <p className="text-white/75">{copy.description}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              {copy.stepLabel} 1
            </p>
            <h2 className="text-2xl font-semibold text-white">{copy.stepOneTitle}</h2>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <button type="button" onClick={() => setStep(2)} className="white-pill rounded-full bg-white px-5 py-2 text-sm">
              {copy.next}
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              {copy.stepLabel} 2
            </p>
            <h2 className="text-2xl font-semibold text-white">{copy.stepTwoTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {mbtiOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    option === mbti ? "white-pill bg-white shadow-lg" : "border border-white/20 text-white/70"
                  }`}
                  onClick={() => setMbti(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-full border border-white/30 px-4 py-2 text-sm">
                {copy.back}
              </button>
              <button type="button" onClick={() => setStep(3)} className="white-pill rounded-full bg-white px-5 py-2 text-sm">
                {copy.next}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              {copy.stepLabel} 3
            </p>
            <h2 className="text-2xl font-semibold text-white">{copy.stepThreeTitle}</h2>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              value={enneagram}
              onChange={(event) => setEnneagram(event.target.value)}
            >
              {enneagramOptions.map((option) => (
                <option key={option} value={option} className="bg-purple-900 text-white">
                  {option}
                </option>
              ))}
            </select>
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
            />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep(2)} className="rounded-full border border-white/30 px-4 py-2 text-sm">
                {copy.back}
              </button>
              <button type="submit" disabled={status === "saving"} className="white-pill rounded-full bg-white px-6 py-3 text-sm">
                {status === "saving" ? copy.saving : copy.save}
              </button>
            </div>
          </section>
        )}
      </form>

      {message && (
        <p className={`text-center text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>
          {message}
        </p>
      )}
    </main>
  );
}
