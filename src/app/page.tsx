import Link from "next/link";

const highlights = [
  {
    label: "Onboarding Empatik",
    description:
      "Kumpulkan vibe personal Mirror lewat kuisioner yang lembut dan siap dikirim ke Supabase.",
  },
  {
    label: "Demo Chat + Mood",
    description:
      "Lihat bagaimana profil tadi mempersonalisasi percakapan dan jurnal mini tanpa login.",
  },
  {
    label: "Stack Transparan",
    description:
      "Next.js App Router + Supabase + Tailwind siap diutak-atik untuk eksperimen berikutnya.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16 text-white sm:py-24">
      <header className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">
          MIRROR DEMO LAB
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Semua akses dibuka buat menguji value primer Mirror.
        </h1>
        <p className="max-w-3xl text-lg text-white/75 sm:text-xl">
          Fokus versi ini cuma satu: seberapa cepat kita bisa menunjukkan
          pengalaman teman curhat AI yang empatik tanpa tersandera backend
          tambahan. Ambil data, ubah UI, dan deploy sesering mungkin.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/experience"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5"
          >
            Masuk ke sandbox onboarding
          </Link>
          <Link
            href="/studio"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            Uji chat Mirror
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
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              {item.label}
            </p>
            <p className="mt-3 text-base text-white">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-card mt-6 space-y-4 p-8 text-white/80">
        <h2 className="text-2xl font-semibold text-white">
          Apa saja yang ada di build ini?
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Onboarding 2 langkah (profil & preferensi) dengan penyimpanan Supabase.</li>
          <li>API Next.js sederhana untuk CRUD profile + mood entries tanpa autentikasi.</li>
          <li>Studio percakapan yang memanggil OpenAI sesuai konteks profil pilihan.</li>
          <li>Halaman demo yang bisa kamu pakai mempresentasikan value Mirror ke siapa pun.</li>
        </ul>
      </section>
    </main>
  );
}
