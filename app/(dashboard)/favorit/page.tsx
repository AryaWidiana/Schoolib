import { createClient } from '@/lib/supabase/server'
import { BookGrid } from '@/components/books/book-grid'
import { EmptyState } from '@/components/shared/empty-state'
import { Heart } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { FavoriteWithBook } from '@/types'

export default async function FavoritPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favs } = await supabase
    .from('favorites')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const favorites = (favs as FavoriteWithBook[]) ?? []
  const books = favorites.map(f => f.books)
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
