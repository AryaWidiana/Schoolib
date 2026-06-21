# SchooLib — Deployment Guide

Panduan lengkap untuk mendeploy SchooLib ke **Supabase** (PostgreSQL) + **Vercel**.

---

## Stack

```
Next.js 15 → Prisma ORM → Supabase PostgreSQL → Vercel
```

Sistem autentikasi menggunakan **JWT (jose) + session cookie** — tidak menggunakan Supabase Auth.

---

## Tahap 1 — Buat Supabase Project

1. Buka [https://supabase.com](https://supabase.com) dan login.
2. Klik **New project**.
3. Pilih organisasi, isi nama project (contoh: `schoolib`), dan buat password database. **Simpan password ini.**
4. Pilih region terdekat (contoh: `Southeast Asia (Singapore)`).
5. Klik **Create new project** dan tunggu hingga selesai (~2 menit).

---

## Tahap 2 — Ambil Connection Strings

1. Di Supabase Dashboard, buka **Project Settings → Database**.
2. Scroll ke bagian **Connection string**.
3. Ambil **dua** URL berikut:

### `DATABASE_URL` — Transaction Mode (Pooled, port 6543)
Digunakan oleh Prisma saat runtime (Vercel serverless).

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### `DIRECT_URL` — Session Mode / Direct (port 5432)
Digunakan oleh Prisma saat menjalankan migrations.

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

> **Catatan:** Pastikan `?pgbouncer=true&connection_limit=1` ada di `DATABASE_URL`. Ini mencegah connection pool exhaustion di Vercel serverless.

---

## Tahap 3 — Setup Environment Lokal

Buat file `.env.local` di root project:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_SECRET="generate-dengan-command-di-bawah"
```

### Generate JWT_SECRET yang aman:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Tahap 4 — Jalankan Migrasi & Seed

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Jalankan migration ke Supabase PostgreSQL
npx prisma migrate deploy

# Seed database (membuat admin, 5 anggota, 20 buku)
npx prisma db seed
```

### Data yang dibuat oleh seed:

| Role | Email | Password |
|---|---|---|
| Petugas | `admin@schoolib.com` | `admin123` |
| Anggota | `anggota1@schoolib.com` | `member123` |
| Anggota | `anggota2@schoolib.com` | `member123` |
| Anggota | `anggota3@schoolib.com` | `member123` |
| Anggota | `anggota4@schoolib.com` | `member123` |
| Anggota | `anggota5@schoolib.com` | `member123` |

Dan **20 buku dummy** untuk keperluan QA.

---

## Tahap 5 — Verifikasi Build Lokal

```bash
npm run build
```

Pastikan output:
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Tahap 6 — Deploy ke Vercel

### 6.1 — Push ke GitHub

```bash
git add .
git commit -m "feat: migrate database to Supabase PostgreSQL"
git push
```

> Pastikan `.env.local` **tidak** ikut ter-commit (sudah diabaikan oleh `.gitignore`).

### 6.2 — Import Project di Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login.
2. Klik **Add New → Project**.
3. Import repository GitHub SchooLib.
4. Vercel otomatis mendeteksi Next.js.

### 6.3 — Tambahkan Environment Variables di Vercel

Di halaman konfigurasi deployment Vercel, tambahkan:

| Key | Value |
|---|---|
| `DATABASE_URL` | URL Pooled dari Supabase (port 6543) |
| `DIRECT_URL` | URL Direct dari Supabase (port 5432) |
| `JWT_SECRET` | Secret key yang sama dengan lokal |

### 6.4 — Deploy

Klik **Deploy**. Vercel akan menjalankan `npm run build` secara otomatis.

> **Catatan:** `prisma migrate deploy` dan `npx prisma db seed` harus dijalankan secara manual dari lokal (atau via Supabase Dashboard SQL Editor) sebelum atau setelah deployment pertama. Vercel **tidak** menjalankan migration secara otomatis.

---

## Troubleshooting

### Error: `Environment variable not found: DATABASE_URL`
- Pastikan file `.env.local` ada dan berisi `DATABASE_URL` yang benar.
- Untuk Vercel, pastikan sudah menambahkan env var di dashboard.

### Error: `Can't reach database server`
- Periksa apakah IP Vercel sudah diizinkan di Supabase. Supabase secara default mengizinkan semua IP, tapi cek **Project Settings → Database → Network Restrictions**.

### Error: `prepared statement already exists` (pgBouncer)
- Pastikan `?pgbouncer=true` ada di `DATABASE_URL`.
- Pastikan `connection_limit=1` ada di `DATABASE_URL`.

### Error saat `prisma migrate deploy`
- Gunakan `DIRECT_URL` (bukan pooled URL) untuk migration. Pastikan `DIRECT_URL` di-set di `.env.local`.

### Build error: `Prisma client not generated`
- Jalankan `npx prisma generate` sebelum `npm run build`.
- Vercel otomatis menjalankan `prisma generate` jika ada di `postinstall` script. Tambahkan di `package.json` jika diperlukan:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

---

## Checklist Deployment

- [ ] Supabase project dibuat
- [ ] `DATABASE_URL` (pooled) didapat
- [ ] `DIRECT_URL` (direct) didapat  
- [ ] `JWT_SECRET` digenerate
- [ ] `.env.local` dibuat
- [ ] `npx prisma generate` berhasil
- [ ] `npx prisma migrate deploy` berhasil
- [ ] `npx prisma db seed` berhasil
- [ ] `npm run build` berhasil
- [ ] Environment variables ditambahkan di Vercel
- [ ] Deployment Vercel berhasil
- [ ] Login petugas berfungsi
- [ ] Login anggota berfungsi
- [ ] Semua fitur FR-P-1 s/d FR-P-8 berfungsi
