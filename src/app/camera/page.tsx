
import { CameraLiquidWidget } from "@/components/camera-liquid";
import { MiniChat } from "@/components/mini-chat";
import Link from "next/link";

export default function CameraPage() {
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
        <CameraLiquidWidget variant="full" />
        <MiniChat title="Chat cepat" />
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
