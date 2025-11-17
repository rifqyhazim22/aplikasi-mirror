import { CameraLiquidWidget } from "@/components/camera-liquid";
import Link from "next/link";

export default function CameraPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 text-white">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Liquid glass lab</p>
        <h1 className="text-4xl font-semibold">Demo kamera + CV Mirror 💜📸</h1>
        <p className="text-white/75">
          Gunakan halaman ini ketika ingin menonjolkan sisi computer vision Mirror. Kamera hanya digunakan
          di perangkat ini dan tidak ada frame yang dikirim ke server. Klik tombol di bawah jika ingin menyimpan
          ringkasan mood ke Supabase melalui halaman onboarding.
        </p>
      </header>
      <CameraLiquidWidget />
      <div className="liquid-card flex flex-col gap-3 p-6 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-white">Butuh lanjut ke form?</p>
          <p className="text-white/60">Isi profil + mood baseline lalu lihat efeknya di Studio chat.</p>
        </div>
        <Link
          href="/experience"
          className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-purple-900 transition hover:-translate-y-0.5"
        >
          Ke onboarding 💫
        </Link>
      </div>
    </main>
  );
}
