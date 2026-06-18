# SchooLib — School Online Library

Sistem Perpustakaan Digital Sekolah/Kampus berbasis web modern untuk memenuhi tugas UAS Software Testing & Quality Assurance (STQA).

## 🚀 Fitur Utama
- **Role-based Access:** Petugas & Anggota
- **Katalog Buku:** Manajemen lengkap, e-book, pencarian
- **Peminjaman & Pengembalian:** Aturan denda otomatis, perpanjangan, cek stok
- **State Transition Validations:** Buku & Anggota (QA ready)
- **Desain Modern:** Biru muda & gelap, layout responsif

## 🛠️ Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS (v4)
- Supabase (PostgreSQL, Auth, RLS)
- Zod + Server Actions

## 📦 Panduan Instalasi
1. Clone / copy repository ini.
2. Jalankan `npm install`.
3. Copy `.env.local.example` ke `.env.local` dan isi credentials Supabase.
4. Setup Database Supabase:
   - Copy & jalankan isi `supabase/migrations/001_initial_schema.sql` di Supabase SQL Editor.
   - (Opsional) Buat 2 user manual via Supabase Dashboard Auth (petugas@schoolib.ac.id, budi@schoolib.ac.id)
   - Copy & jalankan isi `supabase/seed.sql`. Pastikan mengganti id pada query insert books agar sesuai atau biarkan default uuid jika tidak perlu menautkan user_id ke seed awal. (Seed buku tidak terikat user, seed loans/favorites terikat).
5. Jalankan `npm run dev`.

## 🧪 QA Testing
Buka halaman `/qa-testing` untuk melihat matriks fitur Business Rules dan state diagram.
