import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import dynamic from 'next/dynamic'

// Poin 5: Implementasi Code Splitting & Lazy Loading untuk komponen berat (Banyak Gambar)
const SearchableBookGrid = dynamic(
  () => import('@/components/books/searchable-book-grid').then(mod => mod.SearchableBookGrid),
  { 
    loading: () => (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>
        Memuat koleksi buku perpustakaan...
      </div>
    )
  }
)

const getCachedKoleksiBooks = unstable_cache(
  async () => {
    const books = await prisma.book.findMany({
      where: { is_ebook: false },
      orderBy: { judul: 'asc' },
      select: {
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

  // Fetching data secara paralel menggunakan Promise.all (tidak waterfall)
  const [books, categoryData, favorites] = await Promise.all([
    getCachedKoleksiBooks(),
    getCachedCategories(),
    user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : [],
  ])

  const filteredByCategory = kategori
    ? books.filter(b => b.kategori === kategori)
    : books

  const cats = [...new Set(categoryData.map(c => c.kategori as string))].sort()
  const favIds = (favorites as { book_id: string }[]).map(f => f.book_id)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Koleksi Buku</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
          {kategori ? `Kategori: ${kategori}` : 'Semua koleksi buku perpustakaan'}
          {` — ${filteredByCategory.length} buku tersedia`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <a href="/koleksi" style={{
          padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
          textDecoration: 'none',
          background: !kategori ? '#1D2A8A' : '#F1F5F9',
          color: !kategori ? 'white' : '#64748B',
        }}>Semua</a>
        {cats.map(cat => (
          <a key={cat} href={`/koleksi?kategori=${encodeURIComponent(cat)}`} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
            textDecoration: 'none',
            background: kategori === cat ? '#1D2A8A' : '#F1F5F9',
            color: kategori === cat ? 'white' : '#64748B',
          }}>{cat}</a>
        ))}
      </div>

      <SearchableBookGrid
        books={filteredByCategory}
        favoritedIds={favIds}
        initialQuery={q ?? ''}
        placeholder="Cari judul, pengarang, atau ISBN..."
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
