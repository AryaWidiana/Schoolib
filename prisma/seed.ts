import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing
  await prisma.favorite.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.book.deleteMany()
  await prisma.profile.deleteMany()

  // 1. Create 1 Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.profile.create({
    data: {
      email: 'admin@schoolib.com',
      password_hash: adminPassword,
      full_name: 'Administrator',
      role: 'petugas',
      status: 'aktif'
    }
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Create 5 Members
  const memberPassword = await bcrypt.hash('member123', 10)
  for (let i = 1; i <= 5; i++) {
    await prisma.profile.create({
      data: {
        email: `anggota${i}@schoolib.com`,
        password_hash: memberPassword,
        full_name: `Anggota ${i}`,
        nim: `2023000${i}`,
        role: 'anggota',
        status: 'aktif'
      }
    })
  }
  console.log('Created 5 members')

  // 3. Create 20 Books
  const booksData = [
    { judul: 'Laskar Pelangi', pengarang: 'Andrea Hirata', isbn: '978-979-3062-79-2', kategori: 'Novel', is_ebook: false },
    { judul: 'Bumi Manusia', pengarang: 'Pramoedya Ananta Toer', isbn: '978-979-97312-3-4', kategori: 'Sastra', is_ebook: false },
    { judul: 'Filosofi Teras', pengarang: 'Henry Manampiring', isbn: '978-602-412-518-9', kategori: 'Pengembangan Diri', is_ebook: true, ebook_url: 'https://example.com/ebook1' },
    { judul: 'Atomic Habits', pengarang: 'James Clear', isbn: '978-602-06-3317-6', kategori: 'Pengembangan Diri', is_ebook: false },
    { judul: 'Sapiens', pengarang: 'Yuval Noah Harari', isbn: '978-602-412-412-0', kategori: 'Sejarah', is_ebook: false },
    { judul: 'Cantik Itu Luka', pengarang: 'Eka Kurniawan', isbn: '978-602-220-141-9', kategori: 'Novel', is_ebook: false },
    { judul: 'Pulang', pengarang: 'Tere Liye', isbn: '978-602-0822-12-9', kategori: 'Novel', is_ebook: false },
    { judul: 'Mad Tan', pengarang: 'Ahmad Fuadi', isbn: '978-979-1227-73-0', kategori: 'Novel', is_ebook: false },
    { judul: 'Gadis Kretek', pengarang: 'Ratih Kumala', isbn: '978-979-22-8141-5', kategori: 'Sastra', is_ebook: false },
    { judul: 'Laut Bercerita', pengarang: 'Leila S. Chudori', isbn: '978-602-422-212-3', kategori: 'Sastra', is_ebook: false },
    { judul: 'Hujan', pengarang: 'Tere Liye', isbn: '978-602-03-2478-4', kategori: 'Novel', is_ebook: false },
    { judul: 'Bumi', pengarang: 'Tere Liye', isbn: '978-602-03-0415-1', kategori: 'Novel', is_ebook: false },
    { judul: 'Fisika Dasar', pengarang: 'Halliday Resnick', isbn: '978-111-823-072-5', kategori: 'Pendidikan', is_ebook: true, ebook_url: 'https://example.com/ebook2' },
    { judul: 'Matematika Diskrit', pengarang: 'Rinaldi Munir', isbn: '978-602-8758-78-9', kategori: 'Pendidikan', is_ebook: false },
    { judul: 'Pemrograman Web Next.js', pengarang: 'Web Master', isbn: '978-602-1234-56-7', kategori: 'Teknologi', is_ebook: true, ebook_url: 'https://example.com/ebook3' },
    { judul: 'Clean Code', pengarang: 'Robert C. Martin', isbn: '978-013-235-088-4', kategori: 'Teknologi', is_ebook: false },
    { judul: 'The Pragmatic Programmer', pengarang: 'Andrew Hunt', isbn: '978-020-161-622-4', kategori: 'Teknologi', is_ebook: false },
    { judul: 'Design Patterns', pengarang: 'Erich Gamma', isbn: '978-020-163-361-0', kategori: 'Teknologi', is_ebook: false },
    { judul: 'Grit', pengarang: 'Angela Duckworth', isbn: '978-150-111-110-5', kategori: 'Pengembangan Diri', is_ebook: false },
    { judul: 'The Psychology of Money', pengarang: 'Morgan Housel', isbn: '978-085-719-768-9', kategori: 'Keuangan', is_ebook: true, ebook_url: 'https://example.com/ebook4' },
  ]

  for (const b of booksData) {
    await prisma.book.create({
      data: {
        judul: b.judul,
        pengarang: b.pengarang,
        isbn: b.isbn,
        kategori: b.kategori,
        is_ebook: b.is_ebook,
        ebook_url: b.ebook_url,
        jumlah_eksemplar: 3,
        stok_tersedia: 3
      }
    })
  }
  console.log('Created 20 books')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
