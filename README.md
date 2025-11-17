## Mirror Demo Lab

Repository ini memuat build eksperimen Mirror yang difokuskan ke demonstrasi value primer: onboarding empatik, penyimpanan profil di Supabase, dan UI yang siap dipresentasikan tanpa autentikasi maupun payment gate.

### Stack

- **Next.js 16 App Router** + Tailwind CSS v4.
- **Supabase** untuk menyimpan profil & mood entries (RLS dibuat terbuka untuk sandbox).
- **pnpm** sebagai package manager.

### Struktur penting

```
src/
 ├─ app/
 │   ├─ page.tsx               // Landing hero
 │   ├─ experience/            // Sandbox onboarding + mood logger
 │   └─ api/
 │       ├─ profiles/route.ts  // Endpoint profil Supabase
 │       └─ moods/route.ts     // Mood entry Supabase
 └─ lib/
     ├─ supabase.ts           // Helper createClient
     └─ database.types.ts     // Definisi skema ringan

supabase/
 └─ bootstrap.sql             // SQL untuk bikin tabel & kebijakan sandbox
```

### Menjalankan secara lokal

1. Duplikasi `.env.example` menjadi `.env.local` lalu isi dengan kredensial Supabase & OpenAI.
2. Install dependencies `pnpm install`.
3. Jalankan `pnpm dev` dan buka `http://localhost:3000`.

### Deploy

1. Pastikan env di Vercel sama persis dengan `.env.example`.
2. Jalankan `pnpm build` untuk memastikan tidak ada error.
3. Deploy menggunakan `vercel` CLI atau hubungkan repo ke Vercel dashboard.

### Endpoint yang tersedia

- `POST /api/profiles` — menyimpan profil onboarding ke tabel `profile`.
- `GET /api/profiles` — menampilkan 10 profil terbaru untuk demonstrasi.
- `POST /api/moods` — mencatat mood entry terkait profil.
- `GET /api/moods?profileId=...` — melihat riwayat mood (maksimum 50 entri per profil).

Semua endpoint menggunakan kredensial publik Supabase (RLS dibuka khusus sandbox ini).

### Setup Supabase

1. Buka SQL Editor pada project Supabase baru.
2. Jalankan `supabase/bootstrap.sql` untuk membuat tabel `profile` & `mood_entry` beserta kebijakan.
3. Salin URL & anon key Supabase ke `.env.local` sesuai contoh di `.env.example`.

```
NEXT_PUBLIC_SUPABASE_URL=https://gutibpbuoigchxltzxbb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=... // isi dengan anon key terbaru
OPENAI_API_KEY=... // key proyek Mirror
```

Tidak ada payment maupun autentikasi di fase ini; fokus ke value primer & demonstrasi teknologi.

### Catatan pengembangan

- Fokus hanya pada pengalaman onboarding + penyimpanan data. Anda bebas menambahkan halaman baru untuk simulasi chat/mood visualization.
- Karena RLS dinonaktifkan, **jangan** menggunakan project Supabase ini untuk data sensitif.
- Setiap iterasi berikutnya sebaiknya langsung push & deploy supaya eksperimen cepat divalidasi.
