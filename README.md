<div align="center">

# 📚 SchooLib

**Sistem Manajemen Perpustakaan Sekolah Modern**

[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Project ini dibuat untuk memenuhi tugas **UAS Software Testing and Quality Assurance (STQA)**.

</div>

---

## ✨ Fitur Utama

Sistem ini memiliki dua peran utama dengan kapabilitas masing-masing:

### 🧑‍🎓 Anggota
- 🔐 **Login** terautentikasi
- 📖 **Melihat katalog buku** fisik maupun digital
- 🔍 **Mencari buku** dengan mudah
- 🛒 **Meminjam buku** (koleksi fisik)
- ↩️ **Mengembalikan buku**
- 📜 **Melihat riwayat peminjaman**
- 💰 **Melihat status denda**

### 👨‍💼 Petugas
- 🔐 **Login** khusus akses admin
- 📚 **CRUD buku** (Tambah, Edit, Hapus, Lihat)
- 📋 **Mengelola peminjaman** dari anggota
- ✅ **Mengelola pengembalian** buku
- 💳 **Mengelola denda** anggota
- 👥 **Melihat daftar anggota**

---

## 🛠️ Teknologi

Aplikasi ini dibangun menggunakan teknologi web modern:
- **Framework:** Next.js 15 (App Router)
- **Library UI:** React
- **Bahasa:** TypeScript
- **ORM:** Prisma
- **Database:** SQLite
- **Styling:** Tailwind CSS

---

## 🚀 Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menjalankan project di environment lokal:

### 1. Clone Repository
```bash
git clone <repository-url>
cd schoolib
```

### 2. Install Dependency
```bash
npm install
```

### 3. Generate Database SQLite
```bash
npx prisma db push
```

### 4. Seed Data
Masukkan data dummy awal (termasuk admin dan buku):
```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```

Buka browser dan akses aplikasi di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Akun Pengujian

Gunakan kredensial berikut untuk melakukan testing pada sistem:

| Peran | Email | Password |
|---|---|---|
| **Petugas / Admin** | `admin@schoolib.com` | `admin123` |
| **Anggota** | `anggota1@schoolib.com` | `member123` |

*(Tersedia juga `anggota2@schoolib.com` hingga `anggota5@schoolib.com` dengan password yang sama).*

---

## 📜 Aturan Bisnis

### 📦 Peminjaman
- **Maksimal:** 3 buku aktif per anggota
- **Durasi Pinjam:** 7 hari
- Buku dengan **stok 0** tidak dapat dipinjam
- Anggota yang masih **memiliki denda** tidak dapat meminjam buku baru

### 💸 Denda
- **Tarif:** Rp1.000 per hari keterlambatan
  - *Contoh: Telat 1 hari = Rp1.000*
  - *Contoh: Telat 3 hari = Rp3.000*

### 🔄 Perpanjangan
- **Batas:** Maksimal 1 kali perpanjangan per peminjaman
- **Tambahan Durasi:** 7 hari
- **Syarat:** Tidak dapat dilakukan jika status peminjaman **sudah terlambat**

---

## 🎯 Pengujian STQA

Aplikasi ini dirancang khusus untuk mendukung metodologi pengujian STQA berikut:
- **Equivalence Partitioning**
- **Boundary Value Analysis**
- **State Transition Testing**

> **Note:** Skenario pengujian mengacu pada **FR-P-1 hingga FR-P-8** yang diberikan pada tugas UAS.

---

## 📂 Struktur Project

```text
schoolib/
├── app/          # Routing dan halaman Next.js (App Router)
├── components/   # Komponen UI React yang reusable
├── actions/      # Server Actions untuk mutasi data
├── lib/          # Konfigurasi, utilitas, dan helper function
├── prisma/       # Skema database dan seeder ORM
└── public/       # Aset statis (gambar, font, dll)
```

---

## ⚠️ Catatan

Jika database mengalami masalah atau Anda ingin mereset data pengujian, cukup jalankan kembali perintah berikut:

```bash
npx prisma db push
npx prisma db seed
```
Perintah di atas akan menyinkronkan ulang skema database SQLite dan mengisi kembali data dummy pengujian secara otomatis.

---
*Dibuat dengan ❤️ untuk UAS STQA.*
