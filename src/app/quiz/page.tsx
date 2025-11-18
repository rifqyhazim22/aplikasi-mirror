"use client";

import { FormEvent, useState } from "react";

type Step = 1 | 2 | 3;

const mbtiOptions = ["INFP", "INFJ", "ENFP", "ENFJ", "INTJ", "ENTJ", "ISFP", "ESFP"];
const enneagramOptions = ["1 Reformist", "2 Caregiver", "3 Achiever", "4 Individualist", "5 Observer", "6 Loyalist", "7 Enthusiast", "8 Challenger", "9 Peacemaker"];

export default function QuizPage() {
  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState("Gemini Soul");
  const [mbti, setMbti] = useState("INFP");
  const [enneagram, setEnneagram] = useState("4 Individualist");
  const [focus, setFocus] = useState("Aku ingin Mirror membantuku memahami pola overthinking 🌧️");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch("/api/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          mbtiResult: mbti,
          enneagramResult: enneagram,
          focusNote: focus,
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan kuis");
      setStatus("success");
      setMessage("Yay! Profil psikologi tersimpan. Gunakan hasilnya di Studio atau onboarding ✨");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Server lagi capek. Coba ulang sebentar lagi 🙏");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Personality Lab</p>
        <h1 className="text-4xl font-semibold">Mini quiz Mirror ✨</h1>
        <p className="text-white/75">
          Jawab 3 langkah ringan untuk menghasilkan profil MBTI + Enneagram siap pakai. Tidak ada login atau pembayaran
          — hasil langsung tersimpan di Supabase untuk demo Studio.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Langkah 1</p>
            <h2 className="text-2xl font-semibold text-white">Nama panggilan favorit</h2>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <button type="button" onClick={() => setStep(2)} className="white-pill rounded-full bg-white px-5 py-2 text-sm">
              Lanjut ➡️
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Langkah 2</p>
            <h2 className="text-2xl font-semibold text-white">Energi MBTI</h2>
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
                ⬅️ Kembali
              </button>
              <button type="button" onClick={() => setStep(3)} className="white-pill rounded-full bg-white px-5 py-2 text-sm">
                Lanjut ➡️
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="glass-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Langkah 3</p>
            <h2 className="text-2xl font-semibold text-white">Enneagram + fokus curhat</h2>
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
                ⬅️ Kembali
              </button>
              <button type="submit" disabled={status === "saving"} className="white-pill rounded-full bg-white px-6 py-3 text-sm">
                {status === "saving" ? "Menyimpan..." : "Simpan hasil 💾"}
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
