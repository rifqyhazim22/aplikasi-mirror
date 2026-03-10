export const translations = {
  id: {
    heroTagline: "Mirror playground",
    heroTitle: "Refleksi diri harian, diberdayakan oleh AI. 💜",
    heroDescription:
      "Jelajahi sisi lain dirimu. Buka kamera, tuangkan perasaanmu, dan biarkan Mirror memahami suasana hatimu seperti seorang sahabat lama.",
    ctaExperience: "Mulai ritual sekarang",
    ctaCamera: "Uji kamera 🔮",
    highlightFeatures: [
      {
        emoji: "🪞",
        title: "Check-in santai",
        description:
          "Masuk pake nickname lucu, pilih fokus cerita, lalu Mirror kenalin mood kamu kayak journaling interaktif.",
      },
      {
        emoji: "📸",
        title: "Kamera nggak serem",
        description:
          "Video cuma dibaca di device-mu. Mirror nge-scan ekspresi & cahaya buat nyari vibe, bukan buat simpen foto.",
      },
      {
        emoji: "🤝",
        title: "Teman curhat 24/7",
        description:
          "Abis onboarding, langsung lanjut chat. AI-nya ngeblend data onboarding + kamera biar terasa kayak bestie yang ngerti batasan.",
      },
    ],
    modules: [
      { href: "/experience", label: "Ritual onboarding", emoji: "🌅" },
      { href: "/camera", label: "Lab kamera", emoji: "🔍" },
      { href: "/studio", label: "Studio chat", emoji: "💬" },
      { href: "/stats", label: "Mood timeline", emoji: "📊" },
      { href: "/quiz", label: "Quiz MBTI/Enneagram", emoji: "🧩" },
      { href: "/insights", label: "Insight CBT", emoji: "🧠" },
    ],
    howTo: {
      heading: "Cara pakainya",
      title: "“Tatap kamera, tarik napas, cerita jujur.”",
      description:
        "Udah nggak ada bahasa pitch lagi. Jelaskan bahwa Mirror cuma baca vibe lewat brightness & bounding box langsung di device pengguna.",
      flowTitle: "Flow favorit pengguna:",
      flowSteps: [
        "Isi ritual onboarding sambil bercermin.",
        "Nyalakan kamera besar biar berasa kayak selfie filter.",
        "Catat mood singkat, terus buka chat Studio.",
        "Lihat timeline & insight buat track healing journey.",
      ],
      footnote:
        "Build ini tinggal dibungkus jadi apk/desktop via Capacitor—siap dibawa ke event atau dibagiin tanpa bahas backend lagi.",
    },
    singleCode: {
      title: "Satu kodebase untuk semua ritual",
      body: [
        "Bahasa tiap halaman sudah disetel buat Gen Z tester. Kamu bisa ubah copy spesifik tanpa merusak flow besar (onboarding → kamera → chat → stats).",
        "Kalau nanti butuh mode premium, tinggal tambahin gate/payment di atas UI yang sama.",
      ],
      note: "Modul siap demo",
    },
    downloadSection: {
      heading: "Download builds",
      title: "Unduh Mirror untuk semua device",
      description:
        "Semua shell mengarah ke deploy Vercel, jadi begitu dibuka langsung sinkron dengan Supabase & OpenAI. Pastikan koneksi aktif supaya kamera dan chat lancar.",
      footnote:
        "Build Windows dan iOS Simulator tersedia di GitHub Releases. IPA signed/installer lain bisa ditambah di release yang sama dan link ini otomatis ikut.",
    },
    backToTop: "⬅︎ Kembali ke awal demo",
  },
  en: {
    heroTagline: "Mirror playground",
    heroTitle: "Daily self-reflection, empowered by AI. 💜",
    heroDescription:
      "Discover the other side of you. Turn on your camera, speak your mind, and let Mirror understand your emotional state like an old friend.",
    ctaExperience: "Start the ritual",
    ctaCamera: "Try the camera 🔮",
    highlightFeatures: [
      {
        emoji: "🪞",
        title: "Soft check-in",
        description: "Pick a nickname, choose your focus, let Mirror read your vibe like an interactive journal.",
      },
      {
        emoji: "📸",
        title: "Camera feels safe",
        description: "Video never leaves your device. Mirror only scans light & micro-expressions to detect vibes.",
      },
      {
        emoji: "🤝",
        title: "24/7 empathic buddy",
        description: "After onboarding jump straight into chat—AI blends persona + camera cues like a trusted bestie.",
      },
    ],
    modules: [
      { href: "/experience", label: "Onboarding ritual", emoji: "🌅" },
      { href: "/camera", label: "Camera lab", emoji: "🔍" },
      { href: "/studio", label: "Studio chat", emoji: "💬" },
      { href: "/stats", label: "Mood timeline", emoji: "📊" },
      { href: "/quiz", label: "MBTI/Enneagram quiz", emoji: "🧩" },
      { href: "/insights", label: "CBT insights", emoji: "🧠" },
    ],
    howTo: {
      heading: "How it works",
      title: "“Face the cam, breathe, speak honestly.”",
      description:
        "No more pitchy talk. Tell testers Mirror only reads light & micro-expressions locally before blending them with text.",
      flowTitle: "Common flow:",
      flowSteps: [
        "Fill the onboarding ritual while looking at the mirror UI.",
        "Keep the large cam visible so it feels like an AR selfie filter.",
        "Log a quick mood then open Studio chat.",
        "Review the timeline & insights to track the healing journey.",
      ],
      footnote:
        "This build ships as apk/desktop via Capacitor so you can bring it to events or friends without touching backend again.",
    },
    singleCode: {
      title: "One codebase, all rituals",
      body: [
        "Every page uses Gen-Z friendly copy so you can tweak details without breaking the onboarding → camera → chat → stats flow.",
        "When premium mode returns, add gates/payments on top of the same UI.",
      ],
      note: "Demo-ready modules",
    },
    downloadSection: {
      heading: "Download builds",
      title: "Grab Mirror for every device",
      description:
        "Each shell points to the Vercel deploy so it immediately syncs with Supabase & OpenAI. Keep the internet on for smooth camera/chat.",
      footnote:
        "Windows & iOS Simulator builds live on GitHub Releases. Upload signed IPAs or installers to the same release and these links update automatically.",
    },
    backToTop: "⬅︎ Back to the top",
  },
};
