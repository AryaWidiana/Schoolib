import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

import { CategoryFilterGrid } from '@/components/books/category-filter-grid'



// Batas maksimum buku yang diambil dari database sekaligus.
// Ini mencegah transfer ratusan/ribuan buku ke client yang membuat DOM bloat.
const KOLEKSI_LIMIT = 200

const getCachedKoleksiBooks = unstable_cache(
  async () => {
    const books = await prisma.book.findMany({
      where: { is_ebook: false },
      orderBy: { judul: 'asc' },
      take: KOLEKSI_LIMIT, // Poin 1: Batasi hasil query — tidak ambil seluruh tabel
      select: {
        // Poin 2: Hanya kolom esensial untuk kartu buku
        // Tidak ada: deskripsi, sinopsis, penerbit, tahun_terbit, ebook_url
        id: true,
        judul: true,
        pengarang: true,
        isbn: true,
        kategori: true,
        cover_url: true,
        stok_tersedia: true,
        jumlah_eksemplar: true,
        is_ebook: true,
      }
    })
    return books as unknown as import('@/types').Book[]
  },
  ['koleksi-books'],
  { revalidate: 60, tags: ['books'] }
)

const getCachedCategories = unstable_cache(
  async () => prisma.book.findMany({
    select: { kategori: true },
    where: { kategori: { not: null }, is_ebook: false }
  }),
  ['koleksi-categories'],
  { revalidate: 300, tags: ['books'] }
)

interface KoleksiProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

import { Suspense } from 'react'

// 1. Komponen Skeleton Loading yang Elegan (UI Fallback)
function SkeletonKoleksi() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 220, height: 32, background: '#E2E8F0', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: 320, height: 16, background: '#F1F5F9', borderRadius: 4, animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 80, height: 32, background: '#F1F5F9', borderRadius: 20, animation: 'pulse 1.5s infinite ease-in-out' }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ aspectRatio: '2/3', background: '#F1F5F9', borderRadius: 14, animation: 'pulse 1.5s infinite ease-in-out' }} />
        ))}
      </div>
    </div>
  )
}

// 2. Komponen Data Fetching Server (Dipisahkan agar tidak memblokir render utama)
async function KoleksiContent({ q, kategori }: { q?: string; kategori?: string }) {
  const user = await getUser()

  let safeBooks: import('@/types').Book[] = []
  let safeCategories: { kategori: string | null }[] = []
  let safeFavorites: { book_id: string }[] = []

  // Fetching data secara paralel dengan perlindungan database error
  try {
    const [fetchedBooks, categoryData, favorites] = await Promise.all([
      getCachedKoleksiBooks(),
      getCachedCategories(),
      user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : Promise.resolve([]),
    ])
    
    safeBooks = fetchedBooks || []
    safeCategories = categoryData || []
    safeFavorites = favorites || []
  } catch {
    // Tangkap error dan render state kosong yang aman
    safeBooks = []
    safeCategories = []
    safeFavorites = []
  }

  const cats = [...new Set(safeCategories.map(c => c?.kategori as string))].filter(Boolean).sort()
  const favIds = safeFavorites.map(f => f?.book_id).filter(Boolean)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Koleksi Buku</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
          Semua koleksi buku perpustakaan
          {` — ${safeBooks.length} buku tersedia`}
        </p>
      </div>

      {/* CategoryFilterGrid: filtering kategori murni client-side (tidak ada server round-trip) */}
      <CategoryFilterGrid
        books={safeBooks}
        categories={cats}
        favoritedIds={favIds}
        initialKategori={kategori ?? ''}
        initialQuery={q ?? ''}
      />
    </>
  )
}

// 3. Komponen Utama Halaman Koleksi (Instan dirender karena bebas dari await lambat)
export default async function KoleksiPage({ searchParams }: KoleksiProps) {
  const { q, kategori } = await searchParams

  return (
    <div>
      {/* Membungkus komponen lambat dengan Suspense */}
      <Suspense fallback={<SkeletonKoleksi />}>
        <KoleksiContent q={q} kategori={kategori} />
      </Suspense>
    </div>
  )
}
