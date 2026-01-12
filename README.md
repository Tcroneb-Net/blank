# NextA-API (PuruBoy API)

Proyek API Publik modular dengan fitur Fast Update via AI - Next.js Version.
Menyediakan berbagai layanan API mulai dari AI, Downloader, Anime Streaming, hingga Tools utilitas.

## Fitur Utama

- **AI Tools**: Integrasi dengan berbagai model AI (Vheer, Typli, Svara, Grok, dll).
- **Downloader**: TikTok, YouTube, Instagram, Facebook, SoundCloud.
- **Anime**: Streaming dan Search (Oploverz, MyAnimeList).
- **Fast Update**: Sistem pembaruan kode otomatis berbasis AI.
- **Modular**: Struktur kode yang terorganisir memudahkan pengembangan.

## Panduan Menambah Fitur Baru

Untuk menambahkan fitur baru (misalnya API baru), ikuti langkah-langkah berikut:

1.  **Logic Backend (`lib/`)**:
    - Buat file baru di `lib/controllers/category/feature.js` untuk logika pemrosesan data.
    - Opsional: Buat service di `lib/featureService.js` jika membutuhkan interaksi database (`lib/db.js`).

2.  **API Route (`app/api/`)**:
    - Buat folder dan file `app/api/category/feature/route.js`.
    - Impor controller dari `lib/controllers/` dan buat fungsi `GET` atau `POST`.

3.  **Dokumentasi (`components/DocsClient.jsx` atau via script)**:
    - Pastikan endpoint baru terdaftar agar muncul di halaman dokumentasi.

## Persiapan Lokal

1.  **Clone repositori**
2.  **Install dependensi**: `npm install`
3.  **Setup Database**: Masukkan `PURUBOY_PG_URL` di environment variables.
4.  **Jalankan**: `npm run dev`
