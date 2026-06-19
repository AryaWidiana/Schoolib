import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookGrid } from '@/components/books/book-grid'
import { EmptyState } from '@/components/shared/empty-state'
import { Heart } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function FavoritPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const favorites = await prisma.favorite.findMany({
    where: { user_id: user.id },
    include: { book: true },
    orderBy: { created_at: 'desc' }
  })

  const books = favorites.map(f => f.book)
  const favIds = favorites.map(f => f.book_id)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Heart size={20} color="#EF4444" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Favorit Saya</h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>{favorites.length} buku tersimpan</p>
      </div>
      {favorites.length === 0
        ? <EmptyState type="favorites" />
        : <BookGrid books={books} favoritedIds={favIds} emptyType="favorites" />
      }
    </div>
  )
}
