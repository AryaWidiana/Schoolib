import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { BookGrid } from '@/components/books/book-grid'
import { Search, Filter } from 'lucide-react'

interface KoleksiProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function KoleksiPage({ searchParams }: KoleksiProps) {
  const { q, kategori } = await searchParams
  const user = await getUser()

  // Jika ada query pencarian, cari di semua buku (termasuk e-book)
  // Jika tidak ada query, tampilkan buku fisik saja (default halaman koleksi)
  // SQLite: mode 'insensitive' tidak didukung, tapi LIKE sudah case-insensitive untuk ASCII
  const where: Prisma.BookWhereInput = q ? {} : { is_ebook: false }

  if (q) {
    where.OR = [
      { judul: { contains: q, mode: 'insensitive' } },
      { pengarang: { contains: q, mode: 'insensitive' } },
      { isbn: { contains: q, mode: 'insensitive' } },
      { kategori: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (kategori) {
    where.kategori = kategori
  }

  const [books, categories, favorites] = await Promise.all([
    prisma.book.findMany({ where, orderBy: { judul: 'asc' } }),
    prisma.book.findMany({ select: { kategori: true }, where: { kategori: { not: null } } }),
    user ? prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } }) : [],
  ])

  const cats = [...new Set(categories.map(c => c.kategori as string))].sort()
  const favIds = favorites.map(f => f.book_id)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Koleksi Buku</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
          {q ? `Hasil pencarian "${q}"` : 'Semua koleksi buku perpustakaan'}
          {books && ` — ${books.length} buku ditemukan`}
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <form method="GET" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              name="q" defaultValue={q}
              placeholder="Cari judul, pengarang, atau ISBN..."
              className="schoolib-input" style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
          </div>
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
        </form>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> Kategori:
          </span>
          <a href="/koleksi" style={{
            padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
            textDecoration: 'none',
            background: !kategori ? '#1D2A8A' : '#F1F5F9',
            color: !kategori ? 'white' : '#64748B',
          }}>Semua</a>
          {cats.map(cat => (
            <a key={cat} href={`/koleksi?${q ? `q=${q}&` : ''}kategori=${cat}`} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
              textDecoration: 'none',
              background: kategori === cat ? '#1D2A8A' : '#F1F5F9',
              color: kategori === cat ? 'white' : '#64748B',
            }}>{cat}</a>
          ))}
        </div>
      </div>

      <BookGrid books={books ?? []} favoritedIds={favIds} emptyType={q ? 'search' : 'books'} />
    </div>
  )
}
