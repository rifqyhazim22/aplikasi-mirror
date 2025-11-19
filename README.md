## Mirror Demo Lab

Repository ini memuat build eksperimen Mirror yang difokuskan ke demonstrasi value primer: onboarding empatik, penyimpanan profil di Supabase, dan UI yang siap dipresentasikan tanpa autentikasi maupun payment gate.

### Stack

- **Next.js 16 App Router** + Tailwind CSS v4 (liquid glass + emoji heavy UI).
- **Supabase** untuk menyimpan profil, mood entry, dan log percakapan (RLS sandbox).
- **OpenAI API** untuk suara Mirror yang empatik.
- **Widget kamera** (WebRTC + analisis brightness ringan) sebagai demo computer vision.
- **Capacitor 7** sebagai jalur bungkus ke APK / desktop shell.

### Struktur penting

```
 src/
 ├─ app/
 │   ├─ page.tsx               // Landing hero
 │   ├─ experience/            // Sandbox onboarding + mood logger + kamera mini
 │   ├─ camera/                // Demo kamera liquid glass
 │   ├─ studio/                // Demo chat empatik (OpenAI)
 │   └─ api/
 │       ├─ profiles/route.ts  // Endpoint profil Supabase
 │       ├─ moods/route.ts     // Mood entry Supabase
 │       ├─ chat/route.ts      // Chat completion berbasiskan profil
 │       └─ chat/logs/route.ts // Riwayat percakapan per profil
 ├─ components/
 │   └─ camera-liquid.tsx     // Widget kamera + analisis brightness
 └─ lib/
     ├─ supabase.ts           // Helper createClient
     ├─ database.types.ts     // Definisi skema ringan
     └─ openai.ts             // Client OpenAI reusable

supabase/
 └─ bootstrap.sql             // SQL untuk bikin tabel & kebijakan sandbox (profile, mood_entry, conversation_log)
```

### Halaman penting

- `/experience` — ritual onboarding + mood logger + kamera mini.
- `/camera` — layar demo computer vision.
- `/studio` — log percakapan sesudah ritual bercermin.
- `/stats` — kalender mood 14 hari terakhir.
- `/quiz` — kuis singkat MBTI/Enneagram untuk menghasilkan profil demo.
- `/insights` — ringkasan CBT + rekomendasi berbasis kuis & log mood.

### Menjalankan secara lokal

1. Duplikasi `.env.example` menjadi `.env.local` lalu isi dengan kredensial Supabase & OpenAI. Gunakan `SUPABASE_SERVICE_ROLE_KEY` pada environment server (Vercel) supaya penulisan data tidak mentok RLS.
2. Install dependencies `pnpm install`.
3. Jalankan `pnpm dev` dan buka `http://localhost:3000`.

### Deploy

1. Pastikan env di Vercel sama persis dengan `.env.example`.
2. Jalankan `pnpm build` untuk memastikan tidak ada error.
3. Deploy menggunakan `vercel` CLI atau hubungkan repo ke Vercel dashboard.

### Downloadable builds

Artefak build di-host pada GitHub Releases [`downloadables-v1`](https://github.com/rifqyhazim22/aplikasi-mirror/releases/tag/downloadables-v1) dan juga ditautkan di landing section **Download builds**. Berkas yang tersedia:

| Platform | File | Catatan |
| --- | --- | --- |
| macOS | `Mirror-macOS.dmg` | Electron shell yang memuat deploy Vercel. |
| Windows | `Mirror-Windows-Setup.exe` | Installer NSIS, siap jalan di Windows 10/11. |
| Android | `Mirror-Android-debug.apk` | Debug APK; aktifkan *install from unknown sources*. |
| iOS Simulator | `Mirror-iOS-simulator.zip` | Ekstrak lalu `xcrun simctl install booted App.app`. Untuk device fisik perlu signing Apple ID. |

> Catatan: Direktori `public/downloads/` sengaja dikosongkan dan gitingnore agar repo serta Vercel deploy tetap ringan. Untuk merilis build baru, jalankan perintah build (APK/DMG/EXE/zip) lalu unggah ke rilis GitHub berikutnya, kemudian perbarui `src/lib/downloads.ts`.

### Jalur APK / desktop via Capacitor

`capacitor.config.ts` menargetkan web build dan fallback ke URL Vercel sehingga demo bisa dibungkus tanpa login
atau payment. Alur cepat:

1. `pnpm cap add android` (atau `ios`, `electron`).
2. Set `MIRROR_APP_URL` sebelum `pnpm cap sync` untuk menentukan URL yang dimuat webview.
3. `pnpm next build && pnpm next export` lalu `pnpm cap copy` jika ingin menyalin aset lokal ke `out/`.
4. Bangun `.apk`/`.app` melalui Android Studio/Xcode/Electron untuk distribusi internal.

> Karena API bergantung pada Supabase + OpenAI, koneksi internet tetap diperlukan. Mode offline penuh,
> kuis psikologi lengkap, kalender mood, dan integrasi psikolog manusia masih berada di backlog.

### Endpoint yang tersedia

- `POST /api/profiles` — menyimpan profil onboarding ke tabel `profile`.
- `GET /api/profiles` — menampilkan 10 profil terbaru untuk demonstrasi.
- `POST /api/moods` — mencatat mood entry terkait profil.
- `GET /api/moods?profileId=...` — melihat riwayat mood (maksimum 50 entri per profil).
- `POST /api/chat` — mengirim pesan ke Mirror dengan kontekstualisasi profil onboarding.
- `GET /api/chat/logs?profileId=...` — membaca 30 log percakapan terakhir dari Supabase.
- `GET /api/moods/summary?days=14` — ringkasan mood harian untuk halaman `/stats`.
- `POST /api/personality` — menyimpan hasil kuis MBTI/Enneagram.
- `GET /api/personality` — melihat 10 hasil kuis terbaru.
- `GET /api/insights` — mengembalikan saran CBT ringkas berdasarkan kuis & mood.

Semua endpoint menggunakan kredensial publik Supabase (RLS dibuka khusus sandbox ini).

### Setup Supabase

1. Buka SQL Editor pada project Supabase baru.
2. Jalankan `supabase/bootstrap.sql` untuk membuat tabel `profile`, `mood_entry`, dan `conversation_log` beserta kebijakan.
3. Salin URL & anon key Supabase ke `.env.local` sesuai contoh di `.env.example`.

```
NEXT_PUBLIC_SUPABASE_URL=https://gutibpbuoigchxltzxbb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # anon key (boleh dipublikasi)
SUPABASE_SERVICE_ROLE_KEY=...            # service role (jangan expose ke client)
OPENAI_API_KEY=...                       # key proyek Mirror
OPENAI_RESPONDER_MODEL=gpt-4o-mini       # opsional, fallback ke gpt-4o-mini
```

Tidak ada payment maupun autentikasi di fase ini; fokus ke value primer & demonstrasi teknologi.

### Catatan pengembangan

- Fokus fase ini: ritual onboarding + kamera demo + chat + mood logger (tanpa login/pembayaran).
- Karena RLS dinonaktifkan, **jangan** menggunakan project Supabase ini untuk data sensitif.
- Jalur APK/desktop sudah disiapkan via Capacitor, namun tetap memerlukan koneksi internet.
- Yang belum dipenuhi dari pedoman Word 2025: deteksi emosi lanjutan, kuis MBTI/Enneagram penuh,
  kalender mood visual, insight CBT terstruktur, dan integrasi psikolog manusia.
