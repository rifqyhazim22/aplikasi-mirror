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
  heroTitle: "Mulai perjalanan refleksi 💗🪞",
  heroDescription:
    "Ikuti tiga langkah sederhana ini untuk menyelaraskan Mirror dengan karakter aslimu.",
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
  nextStep: "Selanjutnya",
  checklistHint: "Simpan profil untuk melangkah.",
  traitsHeading: "Mood & Tipe Kepribadian ✍️",
  traitsSub: "Bantu Mirror beradaptasi dengan karaktermu secara natural.",
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
  backToStepOne: "Kembali",
  saveProfileCta: "Simpan Profil",
  saveProfileSaving: "Menyimpan...",
  profileSaved: "Profil tersimpan. Siap untuk ritual suasana hati ✨",
  profileSaveError: "Gagal menyimpan profil",
  stepOverview: "Sebuah ritual personalisasi agar pengalamanmu lebih relevan.",
  ritualHeading: "Ritual Suasana Hati 🎧",
  ritualSub: "Jeda sejenak. Tuliskan perasaan jujurmu hari ini sebelum bercermin.",
  moodField: "Mood / vibe hari ini",
  moodPlaceholder: "contoh: mellow tapi pengen validasi",
  noteField: "Catatan (opsional)",
  notePlaceholder: "cerita singkat buat memicu Studio chat",
  ritualCta: "Catat Perasaan",
  ritualSaving: "Mencatat...",
  postRitualHint: "Setelah tercatat, kamu bisa melangkah ke Lab Kamera atau Studio.",
  moodLogTitle: "Jurnal Harian",
  moodLogDescription:
    "Catat perasaanmu dan biarkan Mirror memahaminya secara mendalam.",
  moodSelectLabel: "Gunakan profil",
  moodSelectPlaceholder: "Pilih salah satu",
  moodLogButton: "Simpan mood entry",
  resetMood: "Reset mood form",
  moodValidation: "Pilih profil dan isi mood minimal 2 huruf",
  moodSaved: "Perasaanmu telah didengar.",
  moodSaveError: "Gagal menyimpan catatan.",
  flowHeading: "Ekosistem Mirror",
  flowSubheading: "Langkah selanjutnya",
  flowModules: [
    { title: "Lab Kamera", emoji: "🔮", href: "/camera", blurb: "Cermin digital analisismu." },
    { title: "Studio Chat", emoji: "💬", href: "/studio", blurb: "Ruang aman bercerita." },
    { title: "Jejak Emosi", emoji: "📊", href: "/stats", blurb: "Pola perasaanmu." },
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
  whyMirrorFootnote: "Perjalanan penyembuhan dimulai dari refleksi.",
  historyTitle: "Jejak Emosi Terakhir",
  historyDescription: "Catatan riwayat perasaan dan fokus yang pernah kamu bagi.",
  historyLoading: "Memuat data...",
  historyEmpty: "Belum ada data tersimpan. Isi form di atas untuk membuat profil baru.",
  historyFocusLabel: "Fokus",
};

const enCatalog: OnboardingCopy = {
  tagline: "Mirror in your hands",
  heroTitle: "Start your reflection journey 💗🪞",
  heroDescription: "Follow these simple steps to naturally align Mirror with your authentic self.",
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
  nextStep: "Next",
  checklistHint: "Save your profile to proceed.",
  traitsHeading: "Mood & Personality ✍️",
  traitsSub: "Help Mirror naturally adapt to your character.",
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
  backToStepOne: "Back",
  saveProfileCta: "Save Profile",
  saveProfileSaving: "Saving...",
  profileSaved: "Profile saved. Ready for your mood ritual ✨",
  profileSaveError: "Failed to save profile",
  stepOverview:
    "A personalization ritual to make your experience deeply relevant.",
  ritualHeading: "Mood Ritual 🎧",
  ritualSub: "Take a pause. Write your honest feelings before stepping into the mirror.",
  moodField: "Mood / vibe today",
  moodPlaceholder: "example: mellow but needing validation",
  noteField: "Notes (optional)",
  notePlaceholder: "short story to trigger Studio chat",
  ritualCta: "Log Feelings",
  ritualSaving: "Logging...",
  postRitualHint: "After logging, step into Camera Lab or Studio.",
  moodLogTitle: "Daily Journal",
  moodLogDescription:
    "Log your feelings and let Mirror deeply understand your state.",
  moodSelectLabel: "Use profile",
  moodSelectPlaceholder: "Select profile",
  moodLogButton: "Save mood entry",
  resetMood: "Reset mood form",
  moodValidation: "Pick a profile and type at least 2 letters",
  moodSaved: "Your feelings are heard.",
  moodSaveError: "Failed to save log.",
  flowHeading: "Mirror Ecosystem",
  flowSubheading: "Next steps",
  flowModules: [
    { title: "Camera Lab", emoji: "🔮", href: "/camera", blurb: "Your digital reflection." },
    { title: "Studio Chat", emoji: "💬", href: "/studio", blurb: "Safe space to talk." },
    { title: "Emotion Tracks", emoji: "📊", href: "/stats", blurb: "Your feeling patterns." },
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
    "Healing begins with reflection.",
  historyTitle: "Emotion Footprints",
  historyDescription:
    "A trail of stories and emotions you've shared with Mirror.",
  historyLoading: "Loading data...",
  historyEmpty: "No profile stored yet. Fill the form to create one.",
  historyFocusLabel: "Focus",
};

export const onboardingCopy: Record<"id" | "en", OnboardingCopy> = {
  id: idCatalog,
  en: enCatalog,
};
