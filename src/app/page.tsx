'use client';

import Link from "next/link";
import { downloadCatalog } from "@/lib/downloads";
import { PreferenceTogglePanel } from "@/components/preference-toggle";
import { usePreferences } from "@/contexts/preferences-context";
import { translations } from "@/lib/i18n";

const statusTone: Record<
  NonNullable<(typeof downloadCatalog)[number]["status"]>,
  { label: string; tone: string }
> = {
  ready: { label: "Siap demo", tone: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" },
  beta: { label: "Beta", tone: "bg-amber-500/20 text-amber-200 border-amber-400/40" },
  simulator: { label: "Simulator", tone: "bg-sky-500/20 text-sky-200 border-sky-400/40" },
};

export default function HomePage() {
  const { language } = usePreferences();
  const copy = translations[language] ?? translations.id;
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 text-white sm:py-24">
      <section id="hero" className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <header className="space-y-6">
          <p className="emoji-heading">{copy.heroTagline}</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">{copy.heroTitle}</h1>
          <p className="max-w-3xl text-lg text-white/80 sm:text-xl">{copy.heroDescription}</p>
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
              {copy.ctaExperience}
            </Link>
            <Link
              href="/camera"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              {copy.ctaCamera}
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
          <p className="emoji-heading">{copy.howTo.heading}</p>
          <h2 className="text-2xl font-semibold text-white">{copy.howTo.title}</h2>
          <p className="text-sm text-white/70">{copy.howTo.description}</p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <p className="font-semibold text-white">{copy.howTo.flowTitle}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-white/70">
              {copy.howTo.flowSteps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-white/50">{copy.howTo.footnote}</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {copy.highlightFeatures.map((item) => (
          <article key={item.title} className="glass-card p-6 text-sm text-white/80">
            <p className="text-2xl">{item.emoji}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-white/70">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-card grid gap-6 p-8 text-white/80 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">{copy.singleCode.title}</h2>
          {copy.singleCode.body.map((paragraph) => (
            <p key={paragraph} className="text-sm text-white/80">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">{copy.singleCode.note}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.modules.map((module) => (
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
        <PreferenceTogglePanel />
        <div className="space-y-2">
          <p className="emoji-heading">{copy.downloadSection.heading}</p>
          <h2 className="text-2xl font-semibold text-white">{copy.downloadSection.title}</h2>
          <p className="text-sm text-white/70">{copy.downloadSection.description}</p>
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
        <p className="text-xs text-white/50">{copy.downloadSection.footnote}</p>
        <a
          href="#hero"
          className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-center text-sm text-white transition hover:border-white hover:text-white/90"
        >
          {copy.backToTop}
        </a>
      </section>
    </main>
  );
}
