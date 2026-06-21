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

export default async function KoleksiPage({ searchParams }: KoleksiProps) {
  const { q, kategori } = await searchParams
  const user = await getUser()

  const [books, categoryData, favorites] = await Promise.all([
    getCachedKoleksiBooks(),
    getCachedCategories(),
    user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : [],
  ])

  // Filter by category server-side only (not search — that's done client-side)
  const filteredByCategory = kategori
    ? books.filter(b => b.kategori === kategori)
    : books

  const cats = [...new Set(categoryData.map(c => c.kategori as string))].sort()
  const favIds = (favorites as { book_id: string }[]).map(f => f.book_id)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Koleksi Buku</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
          {kategori ? `Kategori: ${kategori}` : 'Semua koleksi buku perpustakaan'}
          {` — ${filteredByCategory.length} buku tersedia`}
        </p>
      </div>

      {/* Category Filter */}
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

      {/* Client-side instant search + grid */}
      <SearchableBookGrid
        books={filteredByCategory}
        favoritedIds={favIds}
        initialQuery={q ?? ''}
        placeholder="Cari judul, pengarang, atau ISBN..."
      />
    </div>
  )
}
