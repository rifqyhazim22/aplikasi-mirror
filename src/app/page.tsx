import Link from "next/link";

const highlightFeatures = [
  {
    title: "Ritual bercermin 2.0",
    description:
      "Nama panggilan, fokus cerita, dan perjanjian kamera mengikuti dokumen Mirror Word lama, kini tampil dalam liquid glass.",
    emoji: "🪞",
  },
  {
    title: "Kamera + computer vision",
    description:
      "Widget kamera besar meniru perangkat Mirror fisik. TensorFlow (BlazeFace) membaca mikro-ekspresi lalu disimpan ke Supabase.",
    emoji: "📸",
  },
  {
    title: "AI empatik tanpa paywall",
    description:
      "Data Supabase langsung dipakai modul chat/insight/quiz. Semua endpoint terbuka agar bisa diuji sebelum kembali memakai payment.",
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

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 text-white sm:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <header className="space-y-6">
          <p className="emoji-heading">Mirror Demo Lab</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Mirror adalah cermin digital yang membaca bahasa tubuhmu, menerjemahkannya lewat computer vision,
            lalu membalas dengan empati. 💜
          </h1>
          <p className="max-w-3xl text-lg text-white/80 sm:text-xl">
            Setelah evaluasi, seluruh backend dipindah ke Next.js API + Supabase sehingga demo ini bisa
            dipush cepat ke Vercel dan di-build menjadi APK/desktop melalui Capacitor. Tidak ada paywall,
            semua modul terbuka untuk validasi value primer: kamera, cermin, computer vision, dan ritual Mirror Word.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <span className="mirror-pill px-4 py-2">🪞 Mirror persona</span>
            <span className="mirror-pill px-4 py-2">📷 Micro-expression</span>
            <span className="mirror-pill px-4 py-2">🧠 Prompt OpenAI</span>
            <span className="mirror-pill px-4 py-2">🌊 Liquid glass aesthetic</span>
            <span className="mirror-pill px-4 py-2">📱 Multi-platform ready</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/experience"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5"
            >
              Masuk ke ritual onboarding
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
          <p className="emoji-heading">Narasi Mirror Word</p>
          <h2 className="text-2xl font-semibold text-white">“Tatap kamera seperti kamu menatap cermin.”</h2>
          <p className="text-sm text-white/70">
            Kami mempertahankan gaya tutur Mirror generasi lama namun menambahkan konteks teknologi:
            jelaskan bahwa kamera aktif hanya di perangkat pengguna, hanya brightness & bounding box
            yang diproses, kemudian Mirror menggunakan OpenAI untuk menyusun respons empatik.
          </p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <p className="font-semibold text-white">Flow demo cepat:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-white/70">
              <li>Onboarding + perkenalan cermin.</li>
              <li>Aktifkan kamera besar, jelaskan CV.</li>
              <li>Catat mood ke Supabase untuk timeline.</li>
              <li>Buka Studio/Insight untuk menunjukkan AI.</li>
            </ol>
          </div>
          <p className="text-xs text-white/50">
            Build ini siap untuk di-wrap ke mobile/desktop. Setelah PWA stabil, kita tinggal generate APK
            lewat Capacitor tanpa mengubah flow front-end.
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
          <h2 className="text-2xl font-semibold text-white">Rujukan dokumen Mirror Word ➜ kode</h2>
          <p>
            Semua teks onboarding & insight mengambil tone yang sama: Mirror menenangkan, menanyakan
            kamera, lalu menyebut diri “teman cermin”. Kita sengaja menjaga konsistensi karena tujuan
            build ini adalah demo yang langsung menggambarkan value proposition.
          </p>
          <p className="text-sm text-white/70">
            Bila nanti modul pembayaran kembali dinyalakan, flow ini tidak perlu dirombak lagi.
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
    </main>
  );
}
