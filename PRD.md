# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# JALUR LANGIT
### Personal Islamic Habit Tracker & Spiritual Journal

**Version:** 1.0  
**Product Type:** Personal Web Application / PWA  
**Platform:** Web (Desktop & Mobile)  
**Deployment:** Vercel  
**Database:** Supabase PostgreSQL  
**Frontend:** Svelte 5 + SvelteKit + TypeScript

---

# 1. Product Overview

## 1.1. Latar Belakang

Jalur Langit merupakan aplikasi personal untuk membantu pengguna memantau konsistensi ibadah sehari-hari, menetapkan target spiritual, serta mendokumentasikan perjalanan dan refleksi pribadi.

Aplikasi ini terinspirasi dari template Islamic Habit Tracker berbasis Google Sheets yang menggunakan sistem pencatatan aktivitas harian, weekly habits, monthly goals, dan persentase pencapaian.

Jalur Langit mengembangkan konsep tersebut menjadi aplikasi web modern yang memiliki pengalaman penggunaan lebih baik, visualisasi data interaktif, serta fitur personal journaling untuk menyimpan doa, harapan, dan hajat pribadi.

Aplikasi dirancang khusus untuk penggunaan pribadi (single-user), sehingga tidak membutuhkan sistem registrasi maupun manajemen akun pengguna.

## 1.2. Product Vision

Menjadi ruang digital pribadi untuk membantu pengguna menjaga konsistensi ibadah, mengevaluasi perkembangan spiritual, serta mendokumentasikan doa dan perjalanan hidup secara lebih teratur.

## 1.3. Product Principles

1. **Simple:** Pencatatan ibadah harus cepat dan tidak merepotkan.
2. **Personal:** Seluruh data hanya diperuntukkan bagi pemilik aplikasi.
3. **Reflective:** Fokus pada konsistensi dan refleksi, bukan kompetisi.
4. **Beautiful:** Memiliki tampilan modern, elegan, dan nyaman digunakan.
5. **Private:** Aplikasi dilindungi password dan tidak menyediakan registrasi publik.
6. **Accessible:** Dapat diakses melalui laptop maupun smartphone dengan data yang tersinkronisasi.

---

# 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit |
| UI Framework | Svelte 5 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn-svelte |
| Icons | Lucide |
| Database | Supabase PostgreSQL |
| Database Access | Supabase server-side client |
| Authentication | Custom password protection |
| Session | Secure HttpOnly Cookie |
| Charts | LayerChart |
| Date Utilities | date-fns |
| Deployment | Vercel |
| PWA | vite-plugin-pwa |

### Architecture Decisions

- Tidak menggunakan Next.js.
- Tidak menggunakan React.
- Tidak menggunakan Express.js.
- Tidak menggunakan sistem registrasi dan login akun.
- Tidak membuat backend server terpisah.
- Menggunakan SvelteKit server routes untuk kebutuhan backend.
- Seluruh database operation dilakukan melalui server-side endpoint.
- Supabase Service Role Key hanya boleh digunakan di server.
- Password disimpan melalui environment variables server-side.

---

# 3. Application Access & Security

## 3.1. Password Protection

Aplikasi menggunakan satu password utama yang ditentukan secara manual oleh pemilik aplikasi.

Password tidak disimpan di database dan tidak ditanamkan di frontend.

Environment variables:

```env
APP_PASSWORD_HASH=your_password_hash
SESSION_SECRET=your_random_secret

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Password disimpan dalam bentuk hash, bukan plaintext.

Ketentuan:
- Tidak ada halaman registrasi.
- Tidak ada halaman login Google.
- Tidak ada multi-user.
- Tidak ada username.
- Pengguna hanya memasukkan satu password untuk mengakses aplikasi.
- Password diperiksa melalui server-side endpoint.
- Session menggunakan cookie HttpOnly, Secure, dan SameSite.
- Sediakan tombol Logout.
- Terapkan rate limiting pada percobaan password.
- Jangan pernah mengirimkan hash password atau service role key ke frontend.

## 3.2. Session Management

Setelah password benar:
1. Server membuat session yang ditandatangani secara kriptografis.
2. Browser menerima session melalui HttpOnly cookie.
3. Pengguna dapat mengakses halaman aplikasi selama session masih valid.
4. Ketika session kedaluwarsa, pengguna diminta memasukkan password kembali.

Session dapat memiliki masa berlaku, misalnya 7 hari.

## 3.3. Privacy Considerations

Karena aplikasi menyimpan catatan pribadi, doa, dan hajat, keamanan menjadi prioritas.

Ketentuan:
- Semua komunikasi menggunakan HTTPS.
- Semua API data harus memeriksa session.
- Tidak ada endpoint database publik.
- Data tidak boleh dikirim ke layanan analytics pihak ketiga.
- Jangan mencatat isi journaling di server logs.
- Password tidak boleh disimpan dalam localStorage.
- Database backup perlu disediakan.

Catatan: password gate melindungi akses normal aplikasi, tetapi bukan enkripsi end-to-end. Jika ingin isi journaling tetap tidak dapat dibaca oleh penyedia database, implementasikan client-side encryption menggunakan Web Crypto API sebagai peningkatan keamanan tersendiri.

---

# 4. Information Architecture

Aplikasi memiliki navigasi utama berikut:

| Menu | Description |
|---|---|
| Dashboard | Ringkasan kondisi dan aktivitas ibadah |
| Ibadah Tracker | Pencatatan aktivitas ibadah harian |
| Calendar | Riwayat aktivitas dalam kalender |
| My Hajat | Daftar doa, harapan, dan target pribadi |
| Journal | Catatan dan refleksi pribadi |
| Analytics | Statistik dan evaluasi ibadah |
| Settings | Pengaturan aplikasi dan backup |

Navigasi desktop menggunakan sidebar.

Navigasi mobile menggunakan bottom navigation atau drawer yang nyaman dioperasikan dengan satu tangan.

---

# 5. Functional Requirements

## 5.1. Dashboard

Dashboard merupakan halaman utama setelah pengguna berhasil memasukkan password.

### A. Greeting Section

Menampilkan:
- Sapaan berdasarkan waktu.
- Tanggal Masehi.
- Tanggal Hijriah.
- Kalimat reflektif singkat.
- Ringkasan aktivitas ibadah hari ini.

Contoh:

"Assalamu'alaikum."

"Semoga hari ini menjadi kesempatan untuk memperbaiki diri dan mendekatkan hati kepada Allah."

### B. Daily Progress

Menampilkan:
- Jumlah aktivitas yang telah diselesaikan.
- Total aktivitas yang ditargetkan.
- Persentase pencapaian.
- Progress ring atau progress bar.

### C. Today's Ibadah

Menampilkan checklist aktivitas ibadah hari ini.

Pengguna dapat mengubah status langsung dari dashboard tanpa membuka halaman tracker.

### D. Weekly Overview

Menampilkan:
- Konsistensi ibadah selama tujuh hari terakhir.
- Persentase pencapaian setiap hari.
- Jumlah aktivitas yang selesai.
- Perbandingan dengan minggu sebelumnya.

### E. Quick Access

Shortcut menuju:
- Tambah catatan journal.
- Tambah hajat.
- Lihat kalender.
- Lihat statistik.

---

## 5.2. Ibadah Tracker

Fitur utama aplikasi.

Terinspirasi dari spreadsheet Jalur Langit yang menggunakan format kalender bulanan dan daftar aktivitas.

### A. Monthly Tracker

Menampilkan satu bulan penuh dalam format grid.

Struktur:

| Daily Habits | 1 | 2 | 3 | ... | 30 | Goals |
|---|---|---|---|---|---|---|
| Shalat Subuh | ✓ | ✓ | ✓ | ... | | |
| Shalat Dzuhur | ✓ | ✓ | | ... | | |
| Shalat Ashar | ✓ | ✓ | ✓ | ... | | |
| Shalat Maghrib | ✓ | | ✓ | ... | | |
| Shalat Isya | ✓ | ✓ | ✓ | ... | | |
| Shalat Tahajud | | ✓ | | ... | | |
| Shalat Dhuha | ✓ | ✓ | | ... | | |
| Membaca Al-Qur'an | ✓ | ✓ | ✓ | ... | | |
| Dzikir Pagi | ✓ | ✓ | | ... | | |

Ketentuan:
- Navigasi antarbulan.
- Hari dikelompokkan berdasarkan minggu.
- Setiap sel dapat diklik untuk mengubah status aktivitas.
- Hari ini diberi penanda khusus.
- Tanggal di masa depan dapat ditampilkan tetapi tidak otomatis dianggap gagal.
- Aktivitas dapat ditambahkan, diedit, dihapus, dan diurutkan.
- Data bulan sebelumnya tetap dapat diakses.

### B. Activity Categories

Default categories:

**1. Shalat Wajib**
- Subuh
- Dzuhur
- Ashar
- Maghrib
- Isya

**2. Shalat Sunnah**
- Tahajud
- Dhuha
- Witir
- Rawatib
- Shalat sunnah lainnya

**3. Al-Qur'an**
- Membaca Al-Qur'an
- Menghafal Al-Qur'an
- Murajaah
- Mendengarkan murottal

**4. Dzikir dan Doa**
- Dzikir pagi
- Dzikir petang
- Dzikir setelah shalat
- Membaca Al-Matsurat
- Doa harian

**5. Puasa**
- Puasa Senin
- Puasa Kamis
- Puasa Ayyamul Bidh
- Puasa sunnah lainnya

**6. Amal Kebaikan**
- Sedekah
- Membantu orang lain
- Berbakti kepada orang tua
- Membaca ilmu agama

Seluruh kategori dan aktivitas dapat dikustomisasi.

### C. Activity Status

Untuk setiap aktivitas, sediakan status:

- Not Completed
- Completed

Untuk aktivitas shalat wajib, pengguna dapat mengaktifkan opsi status tambahan:

- Tepat waktu
- Terlambat
- Berjamaah

Status tambahan bersifat opsional.

### D. Activity Goals

Pengguna dapat menetapkan target untuk aktivitas tertentu.

Contoh:
- Membaca Al-Qur'an: 30 hari dalam sebulan.
- Shalat Tahajud: 12 kali dalam sebulan.
- Sedekah: 4 kali dalam sebulan.

Target ditampilkan pada kolom Goals seperti referensi Google Sheets.

### E. Weekly Habits

Sediakan bagian khusus untuk aktivitas yang ditargetkan secara mingguan.

Contoh:
- Puasa Senin/Kamis.
- Membaca Surah Al-Kahfi.
- Sedekah mingguan.
- Kajian agama.

Progress dihitung berdasarkan aktivitas dalam minggu berjalan.

---

## 5.3. My Hajat

Fitur untuk mendokumentasikan doa, keinginan, harapan, dan hajat pribadi.

Fitur ini merupakan salah satu pembeda utama Jalur Langit dibandingkan habit tracker biasa.

### A. Hajat Dashboard

Menampilkan daftar hajat dalam bentuk cards.

Setiap card menampilkan:
- Judul hajat.
- Kategori.
- Tanggal dibuat.
- Status.
- Target date (opsional).
- Ringkasan doa atau catatan.

Contoh:

**Hajat: Mendapatkan Pekerjaan dan Karier yang Baik**

Kategori: Karier

Status: In Progress

Dibuat: 8 November 2026

### B. Hajat Categories

Kategori default:

- Pribadi
- Keluarga
- Karier
- Pendidikan
- Finansial
- Kesehatan
- Jodoh dan Pernikahan
- Akhirat
- Lainnya

Kategori dapat dikustomisasi.

### C. Hajat Detail

Setiap hajat memiliki halaman detail dengan informasi:

- Judul hajat.
- Deskripsi.
- Doa yang ingin dipanjatkan.
- Alasan atau latar belakang.
- Tanggal dibuat.
- Target date (opsional).
- Status.
- Catatan perkembangan.
- Riwayat refleksi.

### D. Hajat Status

Status yang tersedia:

1. Active — masih menjadi harapan atau doa.
2. In Progress — sedang diusahakan.
3. Granted — telah dikabulkan atau tercapai.
4. Paused — sementara ditunda.
5. Archived — disimpan sebagai arsip.

Status dapat diperbarui secara manual.

### E. Hajat Timeline

Setiap hajat memiliki timeline untuk mencatat perkembangan.

Contoh:
- 8 November: Pertama kali mencatat hajat.
- 15 November: Memulai langkah pertama.
- 20 November: Menambahkan refleksi dan perkembangan.

Pengguna dapat menambahkan catatan perkembangan kapan saja.

### F. Hajat Reflection

Ketika sebuah hajat telah tercapai, pengguna dapat menuliskan:
- Bagaimana hajat tersebut tercapai.
- Kapan tercapai.
- Refleksi pribadi.
- Rasa syukur.

Tidak perlu ada sistem penilaian atau skor untuk hajat.

---

## 5.4. Personal Journal

Fitur journaling untuk menyimpan pikiran, pengalaman, refleksi, dan catatan pribadi.

### A. Journal Entry

Pengguna dapat membuat catatan dengan informasi:

- Title.
- Content.
- Date.
- Category.
- Tags.
- Mood (opsional).
- Related Hajat (opsional).

### B. Journal Categories

Kategori default:

- Daily Reflection
- Doa dan Harapan
- Muhasabah
- Gratitude
- Personal Notes
- Life Updates

Pengguna dapat membuat kategori sendiri.

### C. Journal Editor

Sediakan editor yang nyaman dengan:
- Judul.
- Rich text atau Markdown sederhana.
- Bold dan italic.
- Bullet list.
- Numbered list.
- Autosave atau draft.
- Informasi waktu terakhir diperbarui.

### D. Journal Timeline

Menampilkan catatan dalam urutan kronologis.

Fitur:
- Filter berdasarkan kategori.
- Filter berdasarkan tanggal.
- Pencarian berdasarkan judul dan isi.
- Pin catatan penting.
- Edit dan hapus catatan.

### E. Journal Privacy

Semua journal hanya dapat diakses setelah pengguna melewati password protection.

Isi journal tidak boleh muncul pada dashboard secara penuh. Dashboard hanya menampilkan jumlah catatan atau cuplikan yang memang dipilih pengguna.

---

## 5.5. Calendar

Halaman kalender untuk melihat aktivitas dan perjalanan ibadah.

Fitur:
- Tampilan bulanan.
- Navigasi antarbulan.
- Penanda tanggal dengan aktivitas tercatat.
- Indikator konsistensi harian.
- Klik tanggal untuk membuka detail aktivitas.
- Indikator jika terdapat journal pada tanggal tersebut.
- Indikator jika terdapat perkembangan hajat pada tanggal tersebut.

Gunakan visualisasi heatmap yang terinspirasi dari GitHub Contribution Calendar, tetapi dengan desain yang lebih lembut.

Warna heatmap tidak boleh membuat pengguna merasa dihakimi ketika ada hari tanpa pencatatan.

---

## 5.6. Analytics

Halaman statistik untuk mengevaluasi konsistensi pribadi.

### A. Overview

Menampilkan:
- Total aktivitas yang diselesaikan.
- Rata-rata pencapaian harian.
- Aktivitas paling konsisten.
- Jumlah hari yang memiliki pencatatan.
- Perbandingan mingguan dan bulanan.

### B. Category Analytics

Grafik untuk setiap kategori:
- Shalat wajib.
- Shalat sunnah.
- Al-Qur'an.
- Dzikir.
- Puasa.
- Amal kebaikan.

### C. Monthly Report

Menampilkan:
- Total aktivitas selesai dalam sebulan.
- Persentase pencapaian per kategori.
- Grafik perkembangan harian.
- Aktivitas dengan konsistensi tertinggi.
- Target yang tercapai.

### D. Yearly Overview

Menampilkan:
- Total pencatatan sepanjang tahun.
- Heatmap tahunan.
- Statistik per bulan.
- Perkembangan target tahunan.

Analytics berfungsi sebagai alat refleksi, bukan kompetisi atau penilaian kualitas ibadah.

---

## 5.7. Settings

Pengaturan aplikasi meliputi:

**Appearance**
- Light mode.
- Dark mode.
- System theme.

**Tracker Settings**
- Pengaturan kategori.
- Pengaturan aktivitas.
- Pengaturan target.
- Urutan aktivitas.

**Data Management**
- Export seluruh data ke JSON.
- Import dan restore data dari JSON.
- Export tracker ke CSV.
- Konfirmasi sebelum menghapus seluruh data.

**Security**
- Logout.
- Informasi session.
- Pengaturan durasi session.

---

# 6. UI/UX Design Requirements

## 6.1. Design Direction

Konsep desain:

**Modern Islamic Minimalism + Premium Personal Dashboard**

Tampilan harus terasa seperti aplikasi produktivitas premium, bukan template spreadsheet atau website religi konvensional.

Referensi karakter desain:
- Linear: konsistensi layout dan visual hierarchy.
- Notion: pengalaman pencatatan.
- Habitify: habit tracking.
- Apple Health: visualisasi progress.
- Modern SaaS Dashboard: penggunaan cards dan analytics.

Hindari:
- Ornamen islami berlebihan.
- Background dengan banyak motif.
- Penggunaan gradient di hampir semua komponen.
- Terlalu banyak warna.
- Terlalu banyak rounded cards.
- Tampilan seperti dashboard admin template.
- Gamification berlebihan.
- Desain yang terlihat seperti hasil AI generatif tanpa konsistensi.

## 6.2. Color Palette

Gunakan warna yang hangat, tenang, dan elegan.

| Token | Color | Hex |
|---|---|---|
| Primary | Deep Forest Green | #173F35 |
| Primary Light | Soft Sage | #DCE9DF |
| Background | Warm Ivory | #F7F5EF |
| Surface | White | #FFFFFF |
| Accent | Muted Gold | #C6A46A |
| Text Primary | Charcoal | #242B27 |
| Text Secondary | Muted Gray | #778078 |
| Border | Soft Gray | #E8E9E3 |
| Success | Soft Green | #4E8B67 |

Dark mode menggunakan warna forest green gelap dan surface charcoal yang tetap nyaman dibaca.

## 6.3. Typography

- Primary font: Plus Jakarta Sans.
- Secondary font: Inter.
- Arabic typography: Amiri atau Noto Naskh Arabic.

Gunakan hierarki typography yang konsisten.

## 6.4. Layout

### Desktop

- Sidebar di sebelah kiri.
- Main content di sebelah kanan.
- Lebar konten terkontrol.
- Dashboard menggunakan grid yang proporsional.
- Monthly tracker memiliki horizontal scrolling yang nyaman jika diperlukan.

### Mobile

- Mobile-first responsive design.
- Bottom navigation.
- Daily tracker berbentuk daftar atau cards, bukan spreadsheet yang dipaksakan masuk layar kecil.
- Tombol interaksi mudah dijangkau.
- Form input nyaman digunakan dengan keyboard mobile.

## 6.5. Component Design

Gunakan komponen reusable:
- StatCard
- ProgressRing
- ProgressBar
- HabitCard
- HabitCheckbox
- MonthlyTracker
- CalendarHeatmap
- HajatCard
- HajatTimeline
- JournalCard
- JournalEditor
- CategoryBadge
- EmptyState
- ConfirmDialog
- ToastNotification

---

# 7. Database Design

Gunakan PostgreSQL dengan struktur relasional yang sederhana.

## 7.1. Tables

### `ibadah_categories`

Menyimpan kategori ibadah.

Fields:
- id
- name
- icon
- color
- sort_order
- created_at

### `ibadah_activities`

Menyimpan aktivitas ibadah.

Fields:
- id
- category_id
- name
- description
- tracking_type
- is_active
- sort_order
- created_at

### `ibadah_logs`

Menyimpan catatan ibadah harian.

Fields:
- id
- activity_id
- activity_date
- status
- prayer_status (nullable)
- notes
- created_at
- updated_at

Tambahkan unique constraint untuk activity_id dan activity_date.

### `ibadah_goals`

Menyimpan target aktivitas.

Fields:
- id
- activity_id
- target_count
- period_type
- start_date
- end_date
- created_at

### `hajats`

Menyimpan daftar hajat.

Fields:
- id
- title
- description
- category
- prayer_text
- status
- target_date
- granted_at
- created_at
- updated_at

### `hajat_entries`

Menyimpan timeline perkembangan hajat.

Fields:
- id
- hajat_id
- title
- content
- entry_date
- created_at

### `journal_entries`

Menyimpan catatan pribadi.

Fields:
- id
- title
- content
- category
- mood
- is_pinned
- entry_date
- created_at
- updated_at

### `journal_tags`

Menyimpan tag journal.

Fields:
- id
- name

### `journal_entry_tags`

Relasi journal dan tags.

Fields:
- journal_entry_id
- tag_id

Semua data bersifat single-user dan tidak membutuhkan user_id.

---

# 8. API & Backend Requirements

Seluruh operasi data dilakukan melalui SvelteKit server routes.

Contoh endpoint:

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/session`

### Tracker
- GET `/api/tracker`
- GET `/api/tracker/month`
- POST `/api/tracker/logs`
- PUT `/api/tracker/logs/:id`
- DELETE `/api/tracker/logs/:id`

### Hajat
- GET `/api/hajats`
- POST `/api/hajats`
- GET `/api/hajats/:id`
- PUT `/api/hajats/:id`
- DELETE `/api/hajats/:id`
- POST `/api/hajats/:id/entries`

### Journal
- GET `/api/journal`
- POST `/api/journal`
- GET `/api/journal/:id`
- PUT `/api/journal/:id`
- DELETE `/api/journal/:id`

### Analytics
- GET `/api/analytics/overview`
- GET `/api/analytics/monthly`
- GET `/api/analytics/yearly`

### Data Management
- GET `/api/backup/export`
- POST `/api/backup/import`

Semua endpoint selain login wajib memeriksa session yang valid.

Validasi input dilakukan di server menggunakan Zod.

---

# 9. Non-Functional Requirements

## Performance
- Initial page load harus ringan.
- Gunakan lazy loading untuk halaman yang tidak langsung diperlukan.
- Hindari library berukuran besar tanpa kebutuhan.
- Optimalkan query database.
- Gunakan caching secara tepat.
- Hindari request berulang untuk data yang sama.

## Reliability
- Setiap perubahan data harus tersimpan dengan benar.
- Tampilkan loading dan error states.
- Cegah duplikasi pencatatan.
- Berikan konfirmasi sebelum menghapus data.
- Sediakan export dan restore backup.

## Security
- Server-side password verification.
- Secure session cookies.
- Rate limiting.
- Validasi input.
- Tidak mengekspos secret environment variables.
- Proteksi seluruh endpoint data.
- HTTPS wajib.

## Usability
- Pencatatan aktivitas harian maksimal beberapa klik.
- Navigasi mudah dipahami.
- Mobile dan desktop memiliki pengalaman yang baik.
- Tidak memerlukan onboarding panjang.

---

# 10. Development Roadmap

## Phase 1 — Foundation

- Setup SvelteKit + Svelte 5.
- Setup Tailwind CSS.
- Setup shadcn-svelte.
- Setup Supabase.
- Setup Vercel.
- Implementasi password protection.
- Implementasi session management.
- Implementasi database schema.

## Phase 2 — Core Ibadah Tracker

- Dashboard.
- Daily tracker.
- Monthly tracker.
- Activity categories.
- Activity goals.
- Weekly habits.
- Calendar history.

## Phase 3 — Personal Journal & Hajat

- Journal CRUD.
- Journal categories dan tags.
- Journal search.
- Hajat CRUD.
- Hajat timeline.
- Hajat reflection.

## Phase 4 — Analytics

- Daily progress.
- Weekly statistics.
- Monthly statistics.
- Yearly heatmap.
- Category analytics.

## Phase 5 — Enhancement

- PWA.
- Dark mode.
- Export/import JSON.
- CSV export.
- Offline support dan synchronization.
- Client-side encryption untuk catatan sensitif jika dibutuhkan.

---

# 11. MVP Scope

Untuk versi pertama, prioritaskan fitur berikut:

| Feature | Priority |
|---|---|
| Password protection | P0 |
| Dashboard | P0 |
| Daily ibadah tracker | P0 |
| Monthly tracker | P0 |
| Custom activities | P0 |
| Calendar history | P0 |
| Journal CRUD | P0 |
| My Hajat CRUD | P0 |
| Hajat timeline | P1 |
| Basic analytics | P1 |
| Weekly habits | P1 |
| Monthly goals | P1 |
| Dark mode | P1 |
| PWA | P2 |
| Offline synchronization | P2 |
| Client-side encryption | P2 |
| Yearly analytics | P2 |

P0 merupakan fitur wajib untuk MVP.

---

# 12. Acceptance Criteria

Aplikasi dianggap memenuhi kebutuhan MVP apabila:

1. Pengguna dapat membuka aplikasi dengan satu password.
2. Pengguna tidak perlu membuat akun.
3. Aplikasi dapat diakses dari laptop dan smartphone menggunakan database yang sama.
4. Pengguna dapat mencatat ibadah harian.
5. Pengguna dapat melihat tracker bulanan.
6. Pengguna dapat menambahkan dan mengelola aktivitas ibadah.
7. Pengguna dapat membuat, mengedit, dan menghapus hajat.
8. Pengguna dapat menambahkan timeline perkembangan hajat.
9. Pengguna dapat membuat dan mengelola journal pribadi.
10. Pengguna dapat melihat riwayat pencatatan.
11. Dashboard menampilkan progress yang sesuai dengan data sebenarnya.
12. Aplikasi memiliki tampilan responsif.
13. Seluruh endpoint data terlindungi oleh session.
14. Pengguna dapat melakukan backup dan restore data.
15. Tidak terdapat secret atau password yang terekspos di frontend.

---

# 13. Final Product Direction

Jalur Langit bukan aplikasi untuk mengukur seberapa baik seseorang beribadah.

Aplikasi ini adalah ruang pribadi untuk:
- Menjaga konsistensi ibadah.
- Mengingat aktivitas kebaikan yang telah dilakukan.
- Mendokumentasikan doa dan hajat.
- Menyimpan refleksi dan perjalanan hidup.
- Melihat perkembangan diri dari waktu ke waktu.

Prinsip utama produk:

**"Bukan tentang seberapa banyak yang tercatat, tetapi tentang bagaimana terus berusaha menjadi lebih baik."**

Fokus pengembangan adalah menghasilkan aplikasi yang ringan, cepat, aman, elegan, dan nyaman digunakan dalam jangka panjang.
