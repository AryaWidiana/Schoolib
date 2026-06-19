import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookGrid } from '@/components/books/book-grid'
import { TrendingUp } from 'lucide-react'

export default async function PopulerPage() {
  const user = await getUser()

  const [books, favorites] = await Promise.all([
    prisma.book.findMany({ where: { is_ebook: false }, orderBy: { jumlah_eksemplar: 'desc' } }),
    user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : [],
  ])

  const favIds = favorites.map(f => f.book_id)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <TrendingUp size={20} color="#F59E0B" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Buku Populer</h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Buku dengan koleksi terbanyak di perpustakaan</p>
      </div>
      <BookGrid books={books ?? []} favoritedIds={favIds} />
    </div>
  )
}
