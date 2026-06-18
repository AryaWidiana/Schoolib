import { createClient } from '@/lib/supabase/server'
import { BookGrid } from '@/components/books/book-grid'
import { TrendingUp } from 'lucide-react'

export default async function PopulerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: books }, { data: favorites }] = await Promise.all([
    supabase.from('books').select('*').eq('is_ebook', false).order('jumlah_eksemplar', { ascending: false }),
    user ? supabase.from('favorites').select('book_id').eq('user_id', user.id) : { data: [] },
  ])

  const favIds = (favorites ?? []).map((f: { book_id: string }) => f.book_id)

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
