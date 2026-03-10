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
    <div className="relative flex min-h-screen w-full flex-col font-display text-white z-10 overflow-hidden">

      <div className="relative z-10 flex h-full grow flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap px-6 md:px-10 py-6 w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sky-400">
              ✨
            </div>
            <h2 className="text-xl font-medium tracking-tight text-white/90">{copy.title.replace('✨', '').trim()}</h2>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="glass-card w-full max-w-[720px] rounded-[2rem] p-8 md:p-14 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

            {/* Circular Progress */}
            <div className="relative w-16 h-16 mb-10 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-sky-400 transition-all duration-500 ease-out" strokeDasharray={`${(step / 3) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
              <span className="text-sm font-medium text-white/90">{step}<span className="text-xs text-white/40">/3</span></span>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center z-10">
              {step === 1 && (
                <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center w-full mb-10">
                    <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mb-4">{copy.badge}</p>
                    <h1 className="text-3xl md:text-5xl font-light leading-tight tracking-tight text-white mb-4">
                      {copy.stepOneTitle}
                    </h1>
                    <p className="text-white/50 text-sm md:text-base font-light max-w-md mx-auto">
                      {copy.description}
                    </p>
                  </div>
                  <div className="w-full max-w-sm mb-12">
                    <input
                      className="glass-input w-full rounded-2xl px-6 py-4 text-white text-center text-lg md:text-xl font-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all placeholder-white/30"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder={copy.defaultNickname}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center w-full mb-10">
                    <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-4">{copy.badge}</p>
                    <h1 className="text-3xl md:text-5xl font-light leading-tight tracking-tight text-white mb-4">
                      {copy.stepTwoTitle}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-12">
                    {mbtiOptions.map((option) => (
                      <label key={option} className="relative group cursor-pointer w-full text-center">
                        <input type="radio" className="peer sr-only" name="mbti" checked={mbti === option} onChange={() => setMbti(option)} />
                        <div className="glass-pill w-full rounded-2xl p-4 flex flex-col items-center justify-center transition-all border border-white/5 peer-checked:border-sky-400/50 peer-checked:bg-sky-400/10 peer-checked:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                          <span className={`text-base md:text-lg font-medium tracking-wide ${mbti === option ? 'text-sky-400' : 'text-white/70 group-hover:text-white'}`}>{option}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center w-full mb-10">
                    <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase mb-4">{copy.badge}</p>
                    <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight text-white mb-4">
                      {copy.stepThreeTitle}
                    </h1>
                  </div>
                  <div className="w-full max-w-lg mb-12 space-y-4">
                    <select
                      className="glass-input w-full rounded-2xl px-6 py-4 text-white text-base md:text-lg font-light focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all appearance-none"
                      value={enneagram}
                      onChange={(event) => setEnneagram(event.target.value)}
                    >
                      {enneagramOptions.map((option) => (
                        <option key={option} value={option} className="text-slate-900 dark:text-white">
                          {option}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className="glass-input w-full rounded-2xl px-6 py-4 text-white text-base md:text-lg font-light focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all min-h-[120px] resize-none"
                      value={focus}
                      onChange={(event) => setFocus(event.target.value)}
                      placeholder={copy.defaultFocus}
                    />
                  </div>
                </div>
              )}

              <div className="flex w-full justify-between items-center mt-auto border-t border-white/10 pt-8">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="flex items-center justify-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all font-medium tracking-wide">
                    {copy.back}
                  </button>
                ) : <div></div>}

                {step < 3 ? (
                  <button type="button" onClick={() => setStep((s) => (s + 1) as Step)} className="flex items-center justify-center px-8 py-3 rounded-full bg-sky-400 text-slate-900 hover:bg-sky-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all font-medium tracking-wide">
                    {copy.next}
                  </button>
                ) : (
                  <button type="submit" disabled={status === "saving"} className="flex items-center justify-center px-8 py-3 rounded-full bg-emerald-400 text-slate-900 hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === "saving" ? copy.saving : copy.save}
                  </button>
                )}
              </div>
            </form>

            {message && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                <p className={`text-center text-sm py-2 px-4 rounded-full border backdrop-blur-md ${status === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-rose-500/20 border-rose-500/30 text-rose-300"} animate-in slide-in-from-top-4`}>
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
