export type StepLiteral = "persona" | "traits" | "ritual";

type StepCopy = {
  id: StepLiteral;
  title: string;
  subtitle: string;
};

type FocusOption = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
};

type MoodOption = {
  id: "tenang" | "bersemangat" | "lelah";
  label: string;
  emoji: string;
  blurb: string;
};

type MbtiOption = {
  code: string;
  name: string;
  spark: string;
};

type EnneagramOption = {
  code: string;
  title: string;
  spark: string;
};

type ArchetypeOption = {
  id: string;
  label: string;
  spark: string;
};

type FlowModule = {
  title: string;
  emoji: string;
  href: string;
  blurb: string;
};

type OnboardingCopy = {
  tagline: string;
  heroTitle: string;
  heroDescription: string;
  stepBadge: string;
  steps: StepCopy[];
  personaHeading: string;
  personaSub: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  focusLabel: string;
  focusHint: string;
  focusCatalog: FocusOption[];
  consentPrivacy: string;
  consentCamera: string;
  nextStep: string;
  checklistHint: string;
  traitsHeading: string;
  traitsSub: string;
  moodLabel: string;
  moodCatalog: MoodOption[];
  mbtiLabel: string;
  mbtiCatalog: MbtiOption[];
  enneagramLabel: string;
  enneagramCatalog: EnneagramOption[];
  archetypeLabel: string;
  archetypeCatalog: ArchetypeOption[];
  birthHint: string;
  birthNote: string;
  backToStepOne: string;
  saveProfileCta: string;
  saveProfileSaving: string;
  profileSaved: string;
  profileSaveError: string;
  stepOverview: string;
  ritualHeading: string;
  ritualSub: string;
  moodField: string;
  moodPlaceholder: string;
  noteField: string;
  notePlaceholder: string;
  ritualCta: string;
  ritualSaving: string;
  postRitualHint: string;
  moodLogTitle: string;
  moodLogDescription: string;
  moodSelectLabel: string;
  moodSelectPlaceholder: string;
  moodLogButton: string;
  resetMood: string;
  moodValidation: string;
  moodSaved: string;
  moodSaveError: string;
  flowHeading: string;
  flowSubheading: string;
  flowModules: FlowModule[];
  playbookHeading: string;
  playbookTitle: string;
  demoGuide: string[];
  whyMirrorTitle: string;
  whyMirrorBody: string;
  whyMirrorFootnote: string;
  historyTitle: string;
  historyDescription: string;
  historyLoading: string;
  historyEmpty: string;
  historyFocusLabel: string;
};

const idCatalog: OnboardingCopy = {
  tagline: "Teman dalam genggaman",
  heroTitle: "Onboarding eksklusif Mirror • siap lanjut ke Lab Kamera & Studio 💗🪞",
  heroDescription:
    "Bahasa pitch lama kita sederhanakan supaya tetap empatik. Ikuti tiga langkah ini dan balikin rasa personal Mirror.",
  stepBadge: "Langkah",
  steps: [
    { id: "persona", title: "Persona Mirror", subtitle: "Nickname + fokus personal" },
    { id: "traits", title: "Mood & tipe diri", subtitle: "Atur tone Studio & Insight" },
    { id: "ritual", title: "Mood ritual", subtitle: "Check-in sebelum Lab Kamera" },
  ],
  personaHeading: "Persona Mirror + fokus 😌",
  personaSub: "Nickname + pilihan fokus bikin Mirror terasa personal.",
  nicknameLabel: "Nama panggilan",
  nicknamePlaceholder: "contoh: Nara, Mas Gio, Kak Mira",
  focusLabel: "Topik utama yang mau kamu fokuskan",
  focusHint: "Pilih maksimal tiga. Bisa kamu ubah kapan saja.",
  focusCatalog: [
    { id: "stress", label: "Stress akademik", emoji: "📚", blurb: "Deadline, tugas, dan rasa takut gagal." },
    { id: "relationship", label: "Hubungan & pertemanan", emoji: "💞", blurb: "Ngatur emosi dengan pasangan atau sahabat." },
    { id: "self-love", label: "Self-love & growth", emoji: "🌱", blurb: "Biar kamu makin cinta diri dan percaya diri." },
    { id: "career", label: "Karier & masa depan", emoji: "🚀", blurb: "Rencana kerja, magang, sampai passion project." },
  ],
  consentPrivacy: "Aku mengerti kebijakan privasi Mirror.",
  consentCamera: "Izinkan analisis ekspresi (opsional).",
  nextStep: "Lanjut ke langkah 2",
  checklistHint: "Checklist ini menggantikan slide onboarding lama.",
  traitsHeading: "Mood baseline + tipe kepribadian ✍️",
  traitsSub: "Data ini menyetir tone Studio & Insight tanpa kamu harus mengetik banyak.",
  moodLabel: "Mood baseline",
  moodCatalog: [
    { id: "tenang", label: "Tenang stabil", emoji: "🌤️", blurb: "Butuh ruang aman untuk cerita pelan." },
    { id: "bersemangat", label: "Bersemangat", emoji: "⚡️", blurb: "Suka eksplor ide, perlu grounding lembut." },
    { id: "lelah", label: "Sering lelah", emoji: "🌧️", blurb: "Energi cepat turun, butuh ritme stabil." },
  ],
  mbtiLabel: "MBTI",
  mbtiCatalog: [
    { code: "INFJ", name: "Advocate", spark: "Empatik & penuh makna" },
    { code: "INFP", name: "Mediator", spark: "Imaginatif & idealis" },
    { code: "ENFJ", name: "Protagonist", spark: "Leader hangat" },
    { code: "ENFP", name: "Campaigner", spark: "Optimis & spontan" },
    { code: "INTJ", name: "Architect", spark: "Visioner & strategis" },
    { code: "INTP", name: "Logician", spark: "Analitis & curious" },
    { code: "ENTJ", name: "Commander", spark: "Tegas & terstruktur" },
    { code: "ENTP", name: "Debater", spark: "Eksplor ide liar" },
  ],
  enneagramLabel: "Enneagram",
  enneagramCatalog: [
    { code: "1", title: "The Reformer", spark: "Perfeksionis, peduli nilai" },
    { code: "2", title: "The Helper", spark: "Hangat, suka membantu" },
    { code: "3", title: "The Achiever", spark: "Ambisius, fokus pencapaian" },
    { code: "4", title: "The Individualist", spark: "Autentik & emosional" },
    { code: "5", title: "The Investigator", spark: "Observan & private" },
    { code: "6", title: "The Loyalist", spark: "Setia, cari rasa aman" },
    { code: "7", title: "The Enthusiast", spark: "Petualang, fun" },
    { code: "8", title: "The Challenger", spark: "Protektif, berani bersuara" },
    { code: "9", title: "The Peacemaker", spark: "Tenang, cari harmoni" },
  ],
  archetypeLabel: "Archetype Mirror",
  archetypeCatalog: [
    { id: "caregiver", label: "Caregiver", spark: "Peluk paling hangat" },
    { id: "creator", label: "Creator", spark: "Selalu punya ide baru" },
    { id: "explorer", label: "Explorer", spark: "Penasaran & suka petualangan" },
    { id: "hero", label: "Hero", spark: "Tahan banting, siap bantu" },
    { id: "lover", label: "Lover", spark: "Peka hubungan & rasa nyaman" },
    { id: "magician", label: "Magician", spark: "Suka transformasi" },
    { id: "sage", label: "Sage", spark: "Bijak & reflektif" },
  ],
  birthHint: "Tanggal lahir (opsional)",
  birthNote: "{sign} — Mirror pakai ini buat ice breaker manis di chat.",
  backToStepOne: "Kembali ke langkah 1",
  saveProfileCta: "Simpan profil ke Supabase",
  saveProfileSaving: "Sedang menyimpan...",
  profileSaved: "Profil tersimpan. Siap lanjut ke mood ritual ✨",
  profileSaveError: "Mirror lagi kesulitan menyimpan data",
  stepOverview: "Langkah 1–2 berada di form Supabase, sedangkan langkah 3 adalah mood ritual tambahan sebelum masuk Lab Kamera.",
  ritualHeading: "Mood ritual + log demo 🎧",
  ritualSub: "Gunakan jurnal singkat ini sebelum masuk Lab Kamera. Log otomatis tersimpan di Supabase.",
  moodField: "Mood / vibe hari ini",
  moodPlaceholder: "contoh: mellow tapi pengen validasi",
  noteField: "Catatan (opsional)",
  notePlaceholder: "cerita singkat buat memicu Studio chat",
  ritualCta: "Simpan mood ritual",
  ritualSaving: "Mencatat...",
  postRitualHint: "Setelah log tersimpan, buka Lab Kamera atau Studio buat nerusin cerita.",
  moodLogTitle: "Catat mood demo",
  moodLogDescription:
    "Kirim mood entry cepat untuk profil yang dipilih sambil jelaskan bahwa kamera Mirror memantau perubahan ekspresi dan menerjemahkannya ke jurnal digital.",
  moodSelectLabel: "Gunakan profil",
  moodSelectPlaceholder: "Pilih salah satu",
  moodLogButton: "Simpan mood entry",
  resetMood: "Reset mood form",
  moodValidation: "Pilih profil dan isi mood minimal 2 huruf",
  moodSaved: "Mood entry dicatat. Gunakan di Studio.",
  moodSaveError: "Gagal mencatat mood",
  flowHeading: "Flow eksklusif",
  flowSubheading: "Setelah onboarding selesai",
  flowModules: [
    { title: "Lab Kamera", emoji: "🔮", href: "/camera", blurb: "Tunjukkan CV Mirror & log emosi realtime." },
    { title: "Studio Chat", emoji: "💬", href: "/studio", blurb: "Gunakan persona baru untuk curhat." },
    { title: "Mood Timeline", emoji: "📊", href: "/stats", blurb: "Validasi Supabase menyimpan data terbuka." },
    { title: "Insight CBT", emoji: "🧠", href: "/insights", blurb: "Mapping value primer Mirror Word." },
  ],
  playbookHeading: "Playbook demo",
  playbookTitle: "Narasi Mirror Word versi singkat ✨",
  demoGuide: [
    "1. Sapa pengguna sebagai ‘teman cermin’ dan jelaskan bahwa kamera hanya dibaca lokal.",
    "2. Saat kamera aktif, ceritakan bahwa Mirror mengukur mikro-ekspresi untuk mencocokkan nada.",
    "3. Setelah data tersimpan, lanjutkan ke Studio/Quiz untuk menunjukkan alur penuh.",
  ],
  whyMirrorTitle: "Kenapa besar seperti cermin?",
  whyMirrorBody:
    "Kolom ini didesain portrait dengan sudut melengkung agar mirip device Mirror generasi awal. Silakan tampilkan juga pada layar eksternal atau perangkat mobile lewat mode PWA.",
  whyMirrorFootnote:
    "Ke depannya halaman ini akan dibungkus ke APK/desktop via Capacitor sehingga saat offline dia hanya menunggu koneksi lalu menyinkronkan data ke Supabase kembali.",
  historyTitle: "Riwayat 10 profil terbaru",
  historyDescription:
    "Pakai daftar ini untuk membuktikan bahwa Supabase menyimpan data onboarding secara terbuka (tidak ada paywall, siap untuk proses AI / mobile app).",
  historyLoading: "Memuat data...",
  historyEmpty: "Belum ada data tersimpan. Isi form di atas untuk membuat profil baru.",
  historyFocusLabel: "Fokus",
};

const enCatalog: OnboardingCopy = {
  tagline: "Mirror in your hands",
  heroTitle: "Mirror exclusive onboarding • ready for Camera Lab & Studio 💗🪞",
  heroDescription: "We trimmed the pitch deck into an empathic flow. Follow these three steps and keep Mirror personal.",
  stepBadge: "Step",
  steps: [
    { id: "persona", title: "Mirror persona", subtitle: "Nickname + focus chips" },
    { id: "traits", title: "Mood & personality", subtitle: "Drive Studio & Insight tone" },
    { id: "ritual", title: "Mood ritual", subtitle: "Check-in before Camera Lab" },
  ],
  personaHeading: "Mirror persona + focus 😌",
  personaSub: "Nickname plus focus chips keep the experience personal.",
  nicknameLabel: "Nickname",
  nicknamePlaceholder: "examples: Nara, Gio, Mira",
  focusLabel: "Main topics you want to focus on",
  focusHint: "Select up to three. You can tweak anytime.",
  focusCatalog: [
    { id: "stress", label: "Academic stress", emoji: "📚", blurb: "Deadlines, projects, fear of failing." },
    { id: "relationship", label: "Relationships & friends", emoji: "💞", blurb: "Navigating emotions with partners or besties." },
    { id: "self-love", label: "Self-love & growth", emoji: "🌱", blurb: "Build confidence and self-compassion." },
    { id: "career", label: "Career & future", emoji: "🚀", blurb: "Work plans, internships, passion projects." },
  ],
  consentPrivacy: "I understand Mirror’s privacy policy.",
  consentCamera: "Allow expression analysis (optional).",
  nextStep: "Next step",
  checklistHint: "This checklist replaces the old onboarding slides.",
  traitsHeading: "Mood baseline + personality ✍️",
  traitsSub: "These values set the tone for Studio & Insight without manual typing.",
  moodLabel: "Mood baseline",
  moodCatalog: [
    { id: "tenang", label: "Calm & steady", emoji: "🌤️", blurb: "Needs a soft safe space to talk." },
    { id: "bersemangat", label: "Excited", emoji: "⚡️", blurb: "Explores ideas fast, needs gentle grounding." },
    { id: "lelah", label: "Often drained", emoji: "🌧️", blurb: "Energy dips quickly, prefers stable rhythm." },
  ],
  mbtiLabel: "MBTI",
  mbtiCatalog: [
    { code: "INFJ", name: "Advocate", spark: "Empathic & purposeful" },
    { code: "INFP", name: "Mediator", spark: "Imaginative & idealistic" },
    { code: "ENFJ", name: "Protagonist", spark: "Warm leadership" },
    { code: "ENFP", name: "Campaigner", spark: "Optimistic & spontaneous" },
    { code: "INTJ", name: "Architect", spark: "Visionary strategist" },
    { code: "INTP", name: "Logician", spark: "Analytical & curious" },
    { code: "ENTJ", name: "Commander", spark: "Bold & structured" },
    { code: "ENTP", name: "Debater", spark: "Playful idea explorer" },
  ],
  enneagramLabel: "Enneagram",
  enneagramCatalog: [
    { code: "1", title: "The Reformer", spark: "Principled, cares about values" },
    { code: "2", title: "The Helper", spark: "Warm, loves supporting others" },
    { code: "3", title: "The Achiever", spark: "Ambitious, goal-driven" },
    { code: "4", title: "The Individualist", spark: "Authentic & expressive" },
    { code: "5", title: "The Investigator", spark: "Observant & private" },
    { code: "6", title: "The Loyalist", spark: "Loyal, seeks safety" },
    { code: "7", title: "The Enthusiast", spark: "Adventurous & fun" },
    { code: "8", title: "The Challenger", spark: "Protective & outspoken" },
    { code: "9", title: "The Peacemaker", spark: "Calm, craving harmony" },
  ],
  archetypeLabel: "Mirror archetype",
  archetypeCatalog: [
    { id: "caregiver", label: "Caregiver", spark: "Warmest hug" },
    { id: "creator", label: "Creator", spark: "Always creating ideas" },
    { id: "explorer", label: "Explorer", spark: "Curious & adventurous" },
    { id: "hero", label: "Hero", spark: "Resilient & ready to help" },
    { id: "lover", label: "Lover", spark: "Tuned into relationships" },
    { id: "magician", label: "Magician", spark: "Loves transformation" },
    { id: "sage", label: "Sage", spark: "Reflective & wise" },
  ],
  birthHint: "Birthdate (optional)",
  birthNote: "{sign} — Mirror uses this as a sweet ice breaker.",
  backToStepOne: "Back to step 1",
  saveProfileCta: "Save profile to Supabase",
  saveProfileSaving: "Saving...",
  profileSaved: "Profile saved. Ready for the mood ritual ✨",
  profileSaveError: "Mirror is struggling to save the profile",
  stepOverview:
    "Steps 1–2 live in the Supabase form, while step 3 is an extra mood ritual before the Camera Lab.",
  ritualHeading: "Mood ritual + demo log 🎧",
  ritualSub: "Use this quick journal before entering Camera Lab. Entries sync to Supabase.",
  moodField: "Mood / vibe today",
  moodPlaceholder: "example: mellow but needing validation",
  noteField: "Notes (optional)",
  notePlaceholder: "short story to trigger Studio chat",
  ritualCta: "Save ritual",
  ritualSaving: "Saving...",
  postRitualHint: "After saving, open Camera Lab or Studio to continue.",
  moodLogTitle: "Log demo mood",
  moodLogDescription:
    "Send a quick entry for the selected profile while explaining Mirror’s CV turns expressions into digital journaling.",
  moodSelectLabel: "Use profile",
  moodSelectPlaceholder: "Select profile",
  moodLogButton: "Save mood entry",
  resetMood: "Reset mood form",
  moodValidation: "Pick a profile and type at least 2 letters",
  moodSaved: "Mood entry saved. Use it inside Studio.",
  moodSaveError: "Failed to store mood entry",
  flowHeading: "Exclusive flow",
  flowSubheading: "After onboarding",
  flowModules: [
    { title: "Camera Lab", emoji: "🔮", href: "/camera", blurb: "Show how CV & chat sync in realtime." },
    { title: "Studio Chat", emoji: "💬", href: "/studio", blurb: "Use the persona to continue the session." },
    { title: "Mood Timeline", emoji: "📊", href: "/stats", blurb: "Prove Supabase keeps data open." },
    { title: "CBT Insights", emoji: "🧠", href: "/insights", blurb: "Map Mirror Word’s primary values." },
  ],
  playbookHeading: "Demo playbook",
  playbookTitle: "Mirror Word narrative (short) ✨",
  demoGuide: [
    "1. Greet the tester as a ‘mirror buddy’ and explain the cam stays on-device.",
    "2. While the cam runs, explain Mirror reads micro-expressions to match the tone.",
    "3. After saving, jump to Studio/Quiz to showcase the full flow.",
  ],
  whyMirrorTitle: "Why is it styled like a mirror?",
  whyMirrorBody:
    "This column mimics the first Mirror hardware with portrait glass curves. Feel free to present it on an external display or via PWA on mobile.",
  whyMirrorFootnote:
    "Later this page will ship as APK/desktop via Capacitor so it stays offline-friendly and syncs back to Supabase once online.",
  historyTitle: "Recent profiles",
  historyDescription:
    "Use this list to prove Supabase keeps onboarding data transparent (no paywall, ready for AI/mobile).",
  historyLoading: "Loading data...",
  historyEmpty: "No profile stored yet. Fill the form to create one.",
  historyFocusLabel: "Focus",
};

export const onboardingCopy: Record<"id" | "en", OnboardingCopy> = {
  id: idCatalog,
  en: enCatalog,
};
