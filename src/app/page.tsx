'use client';

import Link from "next/link";
import { usePreferences } from "@/contexts/preferences-context";
import { translations } from "@/lib/i18n";



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
          <h2 className="text-xl font-medium tracking-tight text-white/90">Mirror</h2>
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

      <footer className="w-full py-8 text-center border-t border-white/5 relative z-10 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
          <Link href="#" className="text-xs text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors">Terms of Service</Link>
        </div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest italic">© 2026 Mirror</p>
      </footer>
    </main >
  );
}
