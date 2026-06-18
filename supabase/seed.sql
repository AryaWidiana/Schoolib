-- ============================================================
-- SchooLib — Seed Data
-- ============================================================
-- IMPORTANT: Run this AFTER the migration AND after creating
-- the auth users via Supabase Dashboard or Auth API.
-- The UUIDs below must match the auth.users records.
-- ============================================================

-- Seed auth users via Supabase Dashboard:
-- Email: petugas@schoolib.ac.id | Password: Petugas123! | role: petugas
-- Email: budi@schoolib.ac.id    | Password: Anggota123! | role: anggota
-- Email: siti@schoolib.ac.id    | Password: Anggota123! | role: anggota
-- Email: andi@schoolib.ac.id    | Password: Anggota123! | role: anggota
-- Email: dewi@schoolib.ac.id    | Password: Anggota123! | role: anggota
-- Email: rizky@schoolib.ac.id   | Password: Anggota123! | role: anggota

-- ============================================================
-- BOOKS SEED (20 books)
-- ============================================================

INSERT INTO books (id, judul, pengarang, isbn, penerbit, tahun_terbit, kategori, deskripsi, jumlah_eksemplar, stok_tersedia, is_ebook) VALUES
('b0000001-0000-0000-0000-000000000001', 'Pemrograman Web Modern dengan Next.js', 'Budi Santoso', '978-602-1234-01-1', 'Penerbit Informatika', 2024, 'Teknologi', 'Panduan lengkap membangun aplikasi web modern menggunakan Next.js 14 dengan App Router.', 5, 5, false),
('b0000001-0000-0000-0000-000000000002', 'Algoritma dan Struktur Data', 'Siti Rahayu', '978-602-1234-02-2', 'Graha Ilmu', 2023, 'Ilmu Komputer', 'Buku teks komprehensif tentang algoritma dasar dan struktur data untuk mahasiswa informatika.', 7, 7, false),
('b0000001-0000-0000-0000-000000000003', 'Basis Data dengan PostgreSQL', 'Ahmad Fauzi', '978-602-1234-03-3', 'Andi Publisher', 2023, 'Teknologi', 'Pengenalan dan panduan penggunaan PostgreSQL untuk aplikasi enterprise.', 4, 4, false),
('b0000001-0000-0000-0000-000000000004', 'Machine Learning untuk Pemula', 'Rizky Pratama', '978-602-1234-04-4', 'Elex Media', 2024, 'Kecerdasan Buatan', 'Pengantar machine learning dengan Python dan scikit-learn untuk mahasiswa.', 6, 6, false),
('b0000001-0000-0000-0000-000000000005', 'Jaringan Komputer: Teori dan Praktik', 'Dewi Kusuma', '978-602-1234-05-5', 'Penerbit Informatika', 2022, 'Jaringan', 'Konsep dasar jaringan komputer, protokol TCP/IP, dan keamanan jaringan.', 5, 5, false),
('b0000001-0000-0000-0000-000000000006', 'Keamanan Sistem Informasi', 'Hendra Wijaya', '978-602-1234-06-6', 'Graha Ilmu', 2023, 'Keamanan', 'Prinsip-prinsip keamanan sistem informasi, kriptografi, dan ethical hacking.', 3, 3, false),
('b0000001-0000-0000-0000-000000000007', 'Rekayasa Perangkat Lunak', 'Indah Permata', '978-602-1234-07-7', 'Andi Publisher', 2022, 'Software Engineering', 'SDLC, metodologi agile, dan praktik terbaik dalam pengembangan perangkat lunak.', 8, 8, false),
('b0000001-0000-0000-0000-000000000008', 'Kalkulus untuk Teknik', 'Prof. Bambang', '978-602-1234-08-8', 'UI Press', 2021, 'Matematika', 'Kalkulus diferensial dan integral untuk mahasiswa teknik dan sains.', 10, 10, false),
('b0000001-0000-0000-0000-000000000009', 'Statistika Terapan', 'Dr. Nurhayati', '978-602-1234-09-9', 'Erlangga', 2023, 'Matematika', 'Statistika deskriptif dan inferensial dengan aplikasi SPSS dan R.', 6, 6, false),
('b0000001-0000-0000-0000-000000000010', 'Pemrograman Python Lanjutan', 'Fajar Hidayat', '978-602-1234-10-0', 'Elex Media', 2024, 'Teknologi', 'OOP, dekorator, generator, async programming, dan best practices Python.', 5, 5, false),
('b0000001-0000-0000-0000-000000000011', 'Desain UI/UX Modern', 'Cantika Dewi', '978-602-1234-11-1', 'Penerbit Ilmu', 2024, 'Desain', 'Prinsip desain antarmuka pengguna, prototyping dengan Figma, dan user research.', 4, 4, false),
('b0000001-0000-0000-0000-000000000012', 'Cloud Computing dengan AWS', 'Teguh Santoso', '978-602-1234-12-2', 'Informatika', 2023, 'Teknologi', 'Layanan AWS: EC2, S3, RDS, Lambda, dan arsitektur cloud modern.', 5, 5, false),
('b0000001-0000-0000-0000-000000000013', 'Mobile App Development: Flutter', 'Ayu Lestari', '978-602-1234-13-3', 'Elex Media', 2024, 'Mobile', 'Pengembangan aplikasi mobile cross-platform dengan Flutter dan Dart.', 6, 6, false),
('b0000001-0000-0000-0000-000000000014', 'Manajemen Proyek IT', 'Drs. Sutrisno', '978-602-1234-14-4', 'Graha Ilmu', 2022, 'Manajemen', 'Manajemen proyek dengan metodologi PMI, PRINCE2, dan Scrum.', 7, 7, false),
('b0000001-0000-0000-0000-000000000015', 'Etika Profesi Teknologi Informasi', 'Prof. Marwah', '978-602-1234-15-5', 'UI Press', 2023, 'Etika', 'Etika profesi, hukum ITE, hak kekayaan intelektual, dan privasi digital.', 4, 4, false),
('b0000001-0000-0000-0000-000000000016', 'Docker dan Kubernetes', 'Ryan Maulana', '978-602-1234-16-6', 'Informatika', 2024, 'DevOps', 'Containerisasi aplikasi dengan Docker dan orkestrasi dengan Kubernetes.', 5, 5, false),
('b0000001-0000-0000-0000-000000000017', 'Data Science dengan Pandas', 'Rina Marlina', '978-602-1234-17-7', 'Elex Media', 2024, 'Data Science', 'Analisis data dengan Pandas, NumPy, Matplotlib, dan Seaborn.', 6, 6, false),
('b0000001-0000-0000-0000-000000000018', 'Sistem Operasi: Konsep dan Implementasi', 'Dr. Wahyu', '978-602-1234-18-8', 'Erlangga', 2022, 'Ilmu Komputer', 'Proses, thread, manajemen memori, file system, dan keamanan OS.', 5, 5, false),
('b0000001-0000-0000-0000-000000000019', 'Kecerdasan Buatan: Teori dan Aplikasi', 'Prof. Arif', '978-602-1234-19-9', 'Andi Publisher', 2023, 'Kecerdasan Buatan', 'AI klasik, neural network, deep learning, dan NLP.', 4, 4, false),
('b0000001-0000-0000-0000-000000000020', 'E-Book: Pengantar Pemrograman TypeScript', 'Tim SchooLib', '978-602-1234-20-0', 'SchooLib Press', 2024, 'Teknologi', 'Pengantar TypeScript: tipe data, interface, generics, dan integrasi dengan framework modern.', 999, 999, true);
