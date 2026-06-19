import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookGrid } from '@/components/books/book-grid'
import { TrendingUp, Search, X } from 'lucide-react'
import Link from 'next/link'

interface PopulerProps {
  searchParams: Promise<{ q?: string }>
}

export default async function PopulerPage({ searchParams }: PopulerProps) {
  const { q } = await searchParams
  const user = await getUser()

  const favoritesQuery = user
    ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } })
    : Promise.resolve([])

  // Jika ada query, filter dari semua buku populer
  const booksQuery = q && q.trim()
    ? prisma.book.findMany({
        where: {
          OR: [
            { judul: { contains: q } },
            { pengarang: { contains: q } },
            { isbn: { contains: q } },
            { kategori: { contains: q } },
          ],
        },
        orderBy: { jumlah_eksemplar: 'desc' },
      })
    : prisma.book.findMany({
        where: { is_ebook: false },
        orderBy: { jumlah_eksemplar: 'desc' },
      })

  const [books, favorites] = await Promise.all([booksQuery, favoritesQuery])
  const favIds = favorites.map(f => f.book_id)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <TrendingUp size={20} color="#F59E0B" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Buku Populer</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {q
              ? <>Hasil pencarian &quot;<strong style={{ color: '#1E293B' }}>{q}</strong>&quot; — {books.length} buku ditemukan</>
              : 'Buku dengan koleksi terbanyak di perpustakaan'}
          </p>
        </div>

        {/* Tombol hapus pencarian */}
        {q && (
          <Link
            href="/populer"
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
          background: '#FFFBEB', border: '2px solid #F59E0B',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
        }}>
          <Search size={16} color="#F59E0B" />
          <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>{q}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', background: '#FEF3C7',
            color: '#92400E', borderRadius: 20, padding: '2px 10px', fontWeight: 600,
          }}>
            {books.length} hasil
          </span>
        </div>
      )}

      <BookGrid books={books ?? []} favoritedIds={favIds} emptyType={q ? 'search' : 'books'} />
    </div>
  )
}
