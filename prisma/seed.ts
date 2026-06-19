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
    { judul: 'One Piece', pengarang: 'Eiichiro Oda', isbn: '978-979-3062-79-2', kategori: 'Manga', is_ebook: false, cover_url: '/assets/One-Piece.webp' },
    { judul: 'Naruto', pengarang: 'Masashi Kishimoto', isbn: '978-979-97312-3-4', kategori: 'Manga', is_ebook: false, cover_url: '/assets/Naruto.webp' },
    { judul: 'Doraemon', pengarang: 'Fujiko F. Fujio', isbn: '978-602-412-518-9', kategori: 'Komik', is_ebook: true, cover_url: '/assets/Doraemon.webp' },
    { judul: 'Alan', pengarang: 'James Clear', isbn: '978-602-06-3317-6', kategori: 'Novel', is_ebook: false, cover_url: '/assets/Alan.webp' },
    { judul: 'Winter In Tokyo', pengarang: 'Kiritsugu', isbn: '978-602-412-412-0', kategori: 'Manga', is_ebook: false, cover_url: '/assets/Winter-In-Tokyo.webp' },
    { judul: 'The Wonderful Wizard Of Oz', pengarang: 'L. Frank Baum', isbn: '978-602-220-141-9', kategori: 'Fiksi Anak', is_ebook: false, cover_url: '/assets/The-Woderful-Wizard.webp' },
    { judul: 'Vinland Saga', pengarang: 'Makoto Yukimura', isbn: '978-602-0822-12-9', kategori: 'Manga', is_ebook: false, cover_url: '/assets/Vinland-Saga.webp' },
    { judul: 'Jujutsu Kaisen 0', pengarang: 'Gege Akutami', isbn: '978-979-1227-73-0', kategori: 'Manga', is_ebook: false, cover_url: '/assets/Jujutsu-Kaisen.webp' },
    { judul: 'Fullmetal Alchemist', pengarang: 'Hiromu Arakawa', isbn: '978-979-22-8141-5', kategori: 'Manga', is_ebook: false, cover_url: '/assets/Fullmetal-Alchemist.webp' },
    { judul: 'Life of Pi', pengarang: 'Yann Martel', isbn: '978-602-422-212-3', kategori: 'Novel', is_ebook: false, cover_url: '/assets/Life-of-Pi.webp' },
    { judul: 'The Dragon Republic', pengarang: 'RF Kuang', isbn: '978-602-03-2478-4', kategori: 'Novel', is_ebook: false, cover_url: '/assets/The-Dragon-Republic.webp' },
    { judul: 'Alam Para Dewa', pengarang: 'Fiersa Besari', isbn: '978-602-03-0415-1', kategori: 'Novel', is_ebook: false, cover_url: '/assets/Alam-Para-Dewa.webp' },
    { judul: 'Oregairu', pengarang: 'Wataru Watari', isbn: '978-111-823-072-5', kategori: 'Fiksi', is_ebook: false, cover_url: '/assets/Oregairu.webp' },
    { judul: 'Si Juki', pengarang: 'Faza Meonk', isbn: '978-602-8758-78-0', kategori: 'Komik', is_ebook: false, cover_url: '/assets/Si-Juki.webp' },
    { judul: 'Laskar Pelangi', pengarang: 'Andrea Hirata', isbn: '978-602-8758-78-9', kategori: 'Fiksi', is_ebook: false, cover_url: '/assets/Laskar-Pelangi.webp' },
    { judul: 'Negeri 5 Menara', pengarang: 'Ahmad Fuadi', isbn: '978-602-293-148-1', kategori: 'Fiksi', is_ebook: false, cover_url: '/assets/Negri-5-Menara.webp' },
    { judul: 'Selat Bali', pengarang: 'Bagus Ariyadi', isbn: '978-623-6744-53-9', kategori: 'Fiksi', is_ebook: false, cover_url: '/assets/Selat-Bali.webp' },
    { judul: 'Sejarah Dunia', pengarang: 'Yuval Noah Harari', isbn: '978-020-163-361-0', kategori: 'Sejarah', is_ebook: false, cover_url: '/assets/Sejarah-Dunia.webp' },
    { judul: 'Kisah Tanah Jawa', pengarang: 'Mario Ganaz', isbn: '978-150-111-110-5', kategori: 'Horor', is_ebook: false, cover_url: '/assets/Kisah-Tanah-Jawa.webp' },
    { judul: 'Grand Magasin', pengarang: 'Jens Christian Grondahl', isbn: '978-085-719-768-9', kategori: 'Fiksi', is_ebook: true, cover_url: '/assets/Grand-Magasin.webp' },
  ]

  for (const b of booksData) {
    await prisma.book.create({
      data: {
        judul: b.judul,
        pengarang: b.pengarang,
        isbn: b.isbn,
        kategori: b.kategori,
        is_ebook: b.is_ebook,
        cover_url: b.cover_url,
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
