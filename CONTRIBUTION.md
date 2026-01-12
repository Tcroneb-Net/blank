# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada proyek NextA-API! Kami menyambut segala bentuk kontribusi, mulai dari pelaporan bug, perbaikan dokumentasi, hingga penambahan fitur baru.

## Lokasi File Penting

Jika Anda ingin menambahkan fitur, berikut adalah peta lokasinya:

- **`app/api/`**: Tempat utama untuk mendefinisikan endpoint API. Gunakan struktur folder yang rapi (contoh: `app/api/downloader/ig/route.js`).
- **`lib/controllers/`**: Tempat menaruh logika utama API. Jangan menaruh logika berat langsung di `route.js`.
- **`lib/`**: Utilitas global seperti koneksi database (`db.js`), uploader, atau service pihak ketiga.
- **`components/`**: Komponen UI React (Next.js) jika ingin mengubah tampilan dashboard atau dokumentasi.
- **`app/`**: Halaman utama (Page) dan Layout aplikasi.

## Cara Menambahkan Fitur (Workflow)

1.  **Identifikasi Kategori**: Tentukan apakah fitur Anda masuk ke AI, Downloader, Tools, atau lainnya.
2.  **Buat Controller**: Tulis fungsi scraper atau logika di `lib/controllers/`.
3.  **Buat Route**: Hubungkan controller tersebut ke `app/api/`.
4.  **Testing**: Uji API menggunakan Postman atau browser.
5.  **Dokumentasi**: Update daftar endpoint di UI agar pengguna tahu fitur baru telah tersedia.

## Standar Kode
- Gunakan Bahasa Indonesia untuk komentar yang menjelaskan alur kompleks.
- Pastikan menangani error dengan blok `try-catch` di setiap API route.
- Kembalikan response JSON yang konsisten: `{ status: true, creator: "...", result: ... }`.

## Cara Berkontribusi Secara Teknis

1.  **Fork Repositori**
2.  **Clone Fork Anda**
3.  **Buat Branch Baru**: `git checkout -b fitur-baru-anda`
4.  **Commit Perubahan**: `git commit -m "Menambahkan fitur X"`
5.  **Push & Pull Request**
