import Link from "next/link";
import { downloadCatalog } from "@/lib/downloads";

const highlightFeatures = [
  {
    title: "Check-in santai",
    description:
      "Masuk pake nickname lucu, pilih fokus cerita, lalu Mirror kenalin mood kamu kayak journaling interaktif.",
    emoji: "🪞",
  },
  {
    title: "Kamera nggak serem",
    description:
      "Video cuma dibaca di device-mu. Mirror nge-scan ekspresi & cahaya buat nyari vibe, bukan buat simpen foto.",
    emoji: "📸",
  },
  {
    title: "Teman curhat 24/7",
    description:
      "Abis onboarding, langsung lanjut chat. AI-nya ngeblend data onboarding + kamera biar terasa kayak bestie yang ngerti batasan.",
    emoji: "🤝",
  },
];

const modules = [
  { href: "/experience", label: "Ritual onboarding", emoji: "🌅" },
  { href: "/camera", label: "Lab kamera", emoji: "🔍" },
  { href: "/studio", label: "Studio chat", emoji: "💬" },
  { href: "/stats", label: "Mood timeline", emoji: "📊" },
  { href: "/quiz", label: "Quiz MBTI/Enneagram", emoji: "🧩" },
  { href: "/insights", label: "Insight CBT", emoji: "🧠" },
];

const statusTone: Record<
  NonNullable<(typeof downloadCatalog)[number]["status"]>,
  { label: string; tone: string }
> = {
  ready: { label: "Siap demo", tone: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" },
  beta: { label: "Beta", tone: "bg-amber-500/20 text-amber-200 border-amber-400/40" },
  simulator: { label: "Simulator", tone: "bg-sky-500/20 text-sky-200 border-sky-400/40" },
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 text-white sm:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <header className="space-y-6">
          <p className="emoji-heading">Mirror playground</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Cermin digital buat Gen Z: buka kamera, ngomong jujur soal mood, Mirror jawab sebagai teman baikmu. 💜
          </h1>
          <p className="max-w-3xl text-lg text-white/80 sm:text-xl">
            Ini bukan deck investor—ini versi yang bisa kamu pakai langsung buat daily check-in. Tinggal kasih izin kamera,
            pilih mood fokus, terus Mirror bakal baca ekspresi + teks kamu untuk bikin chat yang relate.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <span className="mirror-pill px-4 py-2">🪞 Nickname & vibes</span>
            <span className="mirror-pill px-4 py-2">📷 Micro-expression tracker</span>
            <span className="mirror-pill px-4 py-2">🧠 Empathic AI</span>
            <span className="mirror-pill px-4 py-2">🌊 Liquid glass look</span>
            <span className="mirror-pill px-4 py-2">📱 Siap jadi apk</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/experience"
              className="white-pill rounded-full bg-white px-7 py-3 text-sm transition hover:-translate-y-0.5"
            >
              Mulai ritual sekarang
            </Link>
            <Link
              href="/camera"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              Uji kamera 🔮
            </Link>
            <Link
              href="https://github.com/rifqyhazim22/aplikasi-mirror"
              target="_blank"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              Buka repository
            </Link>
          </div>
        </header>

        <div className="glass-card flex flex-col gap-4 p-6 sm:p-8">
          <p className="emoji-heading">Cara pakainya</p>
          <h2 className="text-2xl font-semibold text-white">“Tatap kamera, tarik napas, cerita jujur.”</h2>
          <p className="text-sm text-white/70">
            Udah nggak ada bahasa pitch lagi. Kamu tinggal jelasin ke pengguna bahwa Mirror cuma baca vibe
            lewat brightness & bounding box di device mereka. Abis itu semuanya jadi teks Supabase + prompt AI.
          </p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <p className="font-semibold text-white">Flow favorit pengguna:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-white/70">
              <li>Isi ritual onboarding sambil bercermin.</li>
              <li>Nyalakan kamera besar biar berasa kayak selfie filter.</li>
              <li>Catat mood singkat, terus buka chat Studio.</li>
              <li>Liat timeline & insight buat track healing journey-mu.</li>
            </ol>
          </div>
          <p className="text-xs text-white/50">
            Build ini tinggal kamu bungkus jadi apk/desktop via Capacitor, jadi bisa dites offline event atau
            dibagikan ke teman tanpa harus ngobrolin backend lagi.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlightFeatures.map((item) => (
          <article key={item.title} className="glass-card p-6 text-sm text-white/80">
            <p className="text-2xl">{item.emoji}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-white/70">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-card grid gap-6 p-8 text-white/80 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Satu kodebase untuk semua ritual</h2>
          <p>
            Bahasa di setiap halaman udah disesuaikan buat Gen Z tester. Kamu tinggal ganti copy detil kalau mau,
            tapi flow besar (onboarding → kamera → chat → stats) tetap sama.
          </p>
          <p className="text-sm text-white/70">
            Kalau nanti balik lagi ke mode premium, tinggal tambahin gate / payment tanpa harus rombak UI.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Modul siap demo</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <Link
                href={module.href}
                key={module.href}
                className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 transition hover:border-white hover:text-white"
              >
                <span className="text-lg">{module.emoji}</span> {module.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6 p-8 text-white/80">
        <div className="space-y-2">
          <p className="emoji-heading">Download builds</p>
          <h2 className="text-2xl font-semibold text-white">Unduh Mirror untuk semua device</h2>
          <p className="text-sm text-white/70">
            Semua shell disambungkan ke deploy Vercel, jadi begitu dibuka langsung sinkron dengan Supabase & OpenAI.
            Pastikan koneksi aktif supaya kamera dan chat berjalan normal.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {downloadCatalog.map((entry) => (
            <article
              key={entry.filename}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{entry.platform}</p>
                  <p className="text-xs text-white/50">{entry.filename}</p>
                </div>
                {entry.status && (
                  <span className={`rounded-full border px-3 py-1 text-xs ${statusTone[entry.status].tone}`}>
                    {statusTone[entry.status].label}
                  </span>
                )}
              </div>
              <p className="mt-3 text-white/70">{entry.notes}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                <span>Ukuran: {entry.size}</span>
                <a
                  href={entry.href}
                  download
                  className="white-pill rounded-full bg-white px-4 py-2 text-xs text-purple-900 transition hover:-translate-y-0.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="text-xs text-white/50">
          Build Windows & iOS fisik lagi disiapkan (perlu wine/mono & signing Apple Developer). Begitu siap akan otomatis
          muncul di daftar ini tanpa perlu mengganti kode karena daftar bersumber dari release GitHub.
        </p>
      </section>
    </main>
  );
}
