import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookGrid } from '@/components/books/book-grid'
import { EmptyState } from '@/components/shared/empty-state'
import { Heart, Search, X } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface FavoritProps {
  searchParams: Promise<{ q?: string }>
}

export default async function FavoritPage({ searchParams }: FavoritProps) {
  const { q } = await searchParams
  const user = await getUser()
  if (!user) redirect('/login')

  const favorites = await prisma.favorite.findMany({
    where: { user_id: user.id },
    include: { 
      book: {
        select: {
          id: true,
          judul: true,
          pengarang: true,
          kategori: true,
          cover_url: true,
          is_ebook: true,
          stok_tersedia: true,
          jumlah_eksemplar: true,
        }
      } 
    },
    orderBy: { created_at: 'desc' }
  })

  const allBooks = favorites.map(f => f.book) as unknown as import('@/types').Book[]
  const favIds = favorites.map(f => f.book_id)

  // Filter di sisi server berdasarkan query
  const books = q && q.trim()
    ? allBooks.filter(book =>
        book.judul.toLowerCase().includes(q.toLowerCase()) ||
        book.pengarang.toLowerCase().includes(q.toLowerCase()) ||
        (book.kategori ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : allBooks

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Heart size={20} color="#EF4444" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Favorit Saya</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {q
              ? <>Hasil pencarian &quot;<strong style={{ color: '#1E293B' }}>{q}</strong>&quot; — {books.length} dari {allBooks.length} buku favorit</>
              : `${allBooks.length} buku tersimpan`}
          </p>
        </div>

        {/* Tombol hapus pencarian */}
        {q && (
          <Link
            href="/favorit"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem',
              fontWeight: 600, textDecoration: 'none',
              background: '#F1F5F9', color: '#475569',
              border: '1px solid #E2E8F0',
            }}
          >
            <X size={14} /> Hapus pencarian
          </Link>
        )}
      </div>

      {/* Search indicator */}
      {q && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFF1F2', border: '2px solid #EF4444',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
        }}>
          <Search size={16} color="#EF4444" />
          <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>{q}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', background: '#FFE4E6',
            color: '#9F1239', borderRadius: 20, padding: '2px 10px', fontWeight: 600,
          }}>
            {books.length} hasil
          </span>
        </div>
      )}

      {/* Konten */}
      {allBooks.length === 0
        ? <EmptyState type="favorites" />
        : <BookGrid books={books} favoritedIds={favIds} emptyType={q ? 'search' : 'favorites'} />
      }
    </div>
  )
}
