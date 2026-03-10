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
    <main className="relative flex-grow flex flex-col items-center justify-start min-h-screen w-full antialiased overflow-hidden">

      <header className="w-full max-w-[1200px] px-6 py-6 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-400 flex items-center justify-center text-[#111e21] shadow-lg shadow-sky-400/30">
            ✨
          </div>
          <h2 className="text-xl font-medium tracking-tight text-white/90">Mirror V2</h2>
        </div>
        <div className="flex items-center gap-6">
          <Link className="text-sm font-medium hover:text-sky-400 text-white/70 transition-colors duration-300" href="/login">
            Log In
          </Link>
          <Link href="/experience" className="glass-pill hover:bg-white/10 transition-all duration-300 h-10 px-6 rounded-full text-sm font-medium flex items-center justify-center shadow-sm text-white border border-white/10">
            Start Journey
          </Link>
        </div>
      </header>

      <div id="hero" className="flex flex-col items-center text-center justify-center pt-20 pb-16 px-4 z-10 w-full max-w-5xl mx-auto">
        <p className="text-sky-400 text-sm font-medium tracking-widest uppercase mb-6 flex items-center gap-2">
          <span>{copy.heroTagline}</span>
        </p>
        <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 pb-2">
          {copy.heroTitle.split(' ').slice(0, 3).join(' ')}<br />
          {copy.heroTitle.split(' ').slice(3).join(' ')}
        </h1>
        <p className="text-lg md:text-xl font-light text-white/60 mb-12 max-w-2xl">
          {copy.heroDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-16">
          <Link href="/experience" className="bg-sky-400 hover:bg-sky-300 text-[#111e21] h-14 px-8 rounded-full text-lg font-medium flex items-center justify-center shadow-lg shadow-sky-400/30 transition-all duration-300 transform hover:-translate-y-1">
            Start Journey
            <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 w-full max-w-3xl">
          <span className="glass-pill px-4 py-2 border border-white/10 rounded-full">🪞 Nickname & vibes</span>
          <span className="glass-pill px-4 py-2 border border-white/10 rounded-full">📷 Micro-expression tracker</span>
          <span className="glass-pill px-4 py-2 border border-white/10 rounded-full">🧠 Empathic AI</span>
          <span className="glass-pill px-4 py-2 border border-white/10 rounded-full">🌊 Liquid glass look</span>
        </div>
      </div>

      <div className="w-full max-w-[1200px] px-6 py-12 z-10 flex flex-col gap-12">

        {/* Preference Toggle & How To */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card flex flex-col gap-6 p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <p className="text-purple-400 text-xs font-medium tracking-widest uppercase relative z-10">Preferences</p>
            <div className="relative z-10">
              <PreferenceTogglePanel />
            </div>
          </div>

          <div className="glass-card flex flex-col gap-6 p-8 rounded-3xl border border-white/5 md:col-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <p className="text-sky-400 text-xs font-medium tracking-widest uppercase">{copy.howTo.heading}</p>
              <h2 className="text-3xl font-light text-white">{copy.howTo.title}</h2>
              <p className="text-base text-white/60 leading-relaxed max-w-xl">{copy.howTo.description}</p>

              <div className="glass-pill p-6 rounded-2xl border border-white/5 mt-4 group-hover:border-white/10 transition-colors">
                <p className="font-semibold text-white/90 mb-3">{copy.howTo.flowTitle}</p>
                <ol className="list-decimal space-y-3 pl-5 text-white/60 text-sm">
                  {copy.howTo.flowSteps.map((step, index) => (
                    <li key={`${step}-${index}`} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
              <p className="text-xs text-white/40 italic mt-2">{copy.howTo.footnote}</p>
            </div>
          </div>
        </div>

        {/* Highlight Features */}
        <section className="grid gap-6 md:grid-cols-3">
          {copy.highlightFeatures.map((item) => (
            <article key={item.title} className="glass-card p-8 text-[inherit] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
              <p className="text-3xl mb-4 relative z-10">{item.emoji}</p>
              <h3 className="text-xl font-medium text-white tracking-wide relative z-10">{item.title}</h3>
              <p className="mt-3 text-sm text-white/50 leading-relaxed relative z-10">{item.description}</p>
            </article>
          ))}
        </section>

        {/* Modules & Single Code */}
        <section className="glass-card p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          <div className="grid gap-12 lg:grid-cols-2 relative z-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-white tracking-tight">{copy.singleCode.title}</h2>
              <div className="space-y-4">
                {copy.singleCode.body.map((paragraph) => (
                  <p key={paragraph} className="text-base text-white/60 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-6 flex flex-col justify-center">
              <p className="text-sky-400 text-xs font-medium tracking-widest uppercase">{copy.singleCode.note}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {copy.modules.map((module) => (
                  <Link
                    href={module.href}
                    key={module.href}
                    className="glass-pill p-5 flex flex-col gap-2 hover:bg-white/5 transition-all duration-300"
                  >
                    <span className="text-2xl">{module.emoji}</span>
                    <span className="text-white/80 font-medium tracking-wide">{module.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group mb-12">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-20 -mb-20 pointer-events-none"></div>

          <div className="space-y-3 mb-10 relative z-10">
            <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase">{copy.downloadSection.heading}</p>
            <h2 className="text-4xl font-light text-white tracking-tight">{copy.downloadSection.title}</h2>
            <p className="text-base text-white/50 max-w-2xl leading-relaxed">{copy.downloadSection.description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 relative z-10">
            {downloadCatalog.map((entry) => (
              <article
                key={entry.filename}
                className="glass-pill p-6 transition-colors duration-300 flex flex-col"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-white tracking-wide">{entry.platform}</h3>
                    <p className="text-xs text-white/40 mt-1 tracking-widest font-mono">{entry.filename}</p>
                  </div>
                  {entry.status && (
                    <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest font-medium ${statusTone[entry.status].tone}`}>
                      {statusTone[entry.status].label}
                    </span>
                  )}
                </div>

                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-grow">{entry.notes}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Size: {entry.size}</span>
                  <a
                    href={entry.href}
                    download
                    className="flex items-center justify-center px-6 py-2 rounded-full bg-white text-[#111e21] text-xs font-medium hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-8 italic relative z-10">{copy.downloadSection.footnote}</p>
        </section>

      </div>

      <footer className="w-full py-8 text-center border-t border-white/5 relative z-10 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
          <Link href="#" className="text-xs text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors">Terms of Service</Link>
        </div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest italic">© 2026 Mirror OS V2.0</p>
      </footer>
    </main>
  );
}
