import { createClient } from '@/lib/supabase/server'
import { BookGrid } from '@/components/books/book-grid'
import { Tablet, ExternalLink } from 'lucide-react'

export default async function EbookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ebooks }, { data: favorites }] = await Promise.all([
    supabase.from('books').select('*').eq('is_ebook', true).order('judul'),
    user ? supabase.from('favorites').select('book_id').eq('user_id', user.id) : { data: [] },
  ])

  const favIds = (favorites ?? []).map((f: { book_id: string }) => f.book_id)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Tablet size={20} color="#7C3AED" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>E-Book</h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Buku digital — baca di mana saja, kapan saja</p>
      </div>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>📱 Akses E-Book Gratis</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>Semua anggota aktif dapat mengakses e-book tanpa batas</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 14px', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
          <ExternalLink size={14} /> Baca Online
        </div>
      </div>

      <BookGrid books={ebooks ?? []} favoritedIds={favIds} emptyType="books" />
    </div>
  )
}
