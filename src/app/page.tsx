import Link from "next/link";

const highlights = [
  {
    label: "Ritual bercermin",
    description:
      "Ikuti sapaan, pilih panggilan, dan lakukan selfie check-in seperti versi Mirror sebelumnya.",
  },
  {
    label: "Kamera & computer vision",
    description:
      "Tunjukkan bagaimana kamera menangkap mikro-ekspresi yang kemudian dibaca oleh mesin empati Mirror.",
  },
  {
    label: "Chat empatik",
    description:
      "Data onboarding langsung menginfusik ke OpenAI sehingga Mirror terdengar seperti teman cermin sejati.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16 text-white sm:py-24">
      <header className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">MIRROR DEMO LAB</p>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Mirror adalah cermin digital: kamera membaca bahasa tubuhmu, computer vision menerjemahkan, dan AI menjawab dengan empati.
        </h1>
        <p className="max-w-3xl text-lg text-white/75 sm:text-xl">
          Narasi lama—menatap cermin, memberi izin kamera, lalu berbagi cerita ke Mirror—kita pertahankan di sini dengan bahasa yang lebih matang. Build ini membantu kamu menjelaskan value kamera + CV + teman curhat tanpa harus menyiapkan backend tambahan.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/experience"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5"
          >
            Masuk ke ritual onboarding
          </Link>
          <Link
            href="/studio"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Lihat Studio cermin
          </Link>
          <Link
            href="/camera"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Uji kamera 🔮
          </Link>
          <Link
            href="/stats"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Lihat mood timeline 📅
          </Link>
          <Link
            href="/quiz"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Main kuis 💡
          </Link>
          <Link
            href="/insights"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Insight CBT 🧠
          </Link>
          <Link
            href="https://github.com/rifqyhazim22/aplikasi-mirror"
            target="_blank"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Buka repository
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.label} className="glass-card p-6 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{item.label}</p>
            <p className="mt-3 text-base text-white">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-card mt-6 grid gap-6 p-8 text-white/80 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Flow demo yang disarankan</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Ritual bercermin: pilih nama panggilan, aktifkan consent kamera, dan pilih fokus cerita.</li>
            <li>Computer vision: jelaskan bahwa Mirror menganalisis ekspresi untuk menyetel mood baseline.</li>
            <li>Data primer masuk Supabase, lalu menjadi bahan prompt + pipeline CV Mirror.</li>
            <li>Studio chat memperlihatkan bagaimana Mirror berbicara lembut seolah memahami tatapanmu.</li>
          </ol>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Bahasa yang konsisten</h3>
          <p>
            Kita menggunakan gaya tutur hangat layaknya Mirror generasi sebelumnya, namun ditambah penjelasan
            teknologi yang lebih jelas. Halaman ini bisa dipakai pada presentasi investor, testing pengguna,
            maupun demo internal yang menekankan nuansa kamera + empati.
          </p>
          <p className="text-sm text-white/70">
            Eksperimen lain tinggal menambahkan modul CV asli atau countdown selfie—UI-nya sudah siap.
          </p>
        </div>
      </section>
    </main>
  );
}
