import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { TrendingUp } from 'lucide-react'
import { SearchableBookGrid } from '@/components/books/searchable-book-grid'

const getCachedPopulerBooks = unstable_cache(
  async () => prisma.book.findMany({
    where: { is_ebook: false },
    orderBy: { jumlah_eksemplar: 'desc' }
  }),
  ['populer-books'],
  { revalidate: 60, tags: ['books'] }
)

interface PopulerProps {
  searchParams: Promise<{ q?: string }>
}

export default async function PopulerPage({ searchParams }: PopulerProps) {
  const { q } = await searchParams
  const user = await getUser()

  const [books, favorites] = await Promise.all([
    getCachedPopulerBooks(),
    user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : [],
  ])

  const favIds = (favorites as { book_id: string }[]).map(f => f.book_id)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <TrendingUp size={22} color="#F59E0B" />
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 2 }}>Buku Populer</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Buku dengan koleksi terbanyak di perpustakaan</p>
        </div>
      </div>

      <SearchableBookGrid
        books={books}
        favoritedIds={favIds}
        initialQuery={q ?? ''}
        placeholder="Cari di buku populer..."
      />
    </div>
  )
}
