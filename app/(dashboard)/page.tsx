import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookGrid } from '@/components/books/book-grid'
import { SearchableBookGrid } from '@/components/books/searchable-book-grid'
import { BookOpen, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { unstable_cache } from 'next/cache'

const getCachedBerandaBooks = unstable_cache(
  async () => {
    const [rekomendasi, populer, terbaru] = await Promise.all([
      prisma.book.findMany({ where: { stok_tersedia: { gt: 0 } }, orderBy: { created_at: 'desc' }, take: 6 }),
      prisma.book.findMany({ where: { stok_tersedia: { gt: 0 } }, orderBy: { jumlah_eksemplar: 'desc' }, take: 6 }),
      prisma.book.findMany({ orderBy: { created_at: 'desc' }, take: 6 }),
    ])
    return { rekomendasi, populer, terbaru }
  },
  ['beranda-books'],
  { revalidate: 60, tags: ['books'] }
)

interface BerandaProps {
  searchParams: Promise<{ q?: string }>
}

export default async function BerandaPage({ searchParams }: BerandaProps) {
  const { q } = await searchParams

  // 1. Fetching Paralel dengan Try-Catch untuk proteksi database crash
  let cachedBooks = { rekomendasi: [] as import('@/types').Book[], populer: [] as import('@/types').Book[], terbaru: [] as import('@/types').Book[] }
  let safeFavorites: { book_id: string }[] = []

  try {
    const [user, fetchedBooks] = await Promise.all([
      getUser(),
      getCachedBerandaBooks()
    ])

    const favorites = user
      ? await prisma.favorite.findMany({ where: { user_id: user.id }, select: { book_id: true } })
      : []

    cachedBooks = fetchedBooks as { rekomendasi: import('@/types').Book[], populer: import('@/types').Book[], terbaru: import('@/types').Book[] }
    safeFavorites = favorites || []
  } catch {
    // Tangkap error diam-diam untuk mencegah layar mati
    safeFavorites = []
  }

  const { rekomendasi = [], populer = [], terbaru = [] } = cachedBooks
  const favIds = safeFavorites.map(f => f?.book_id).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Hero Banner */}
      <div className="hero-banner animate-fade-in-up">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '4px 12px', marginBottom: 12 }}>
            <Sparkles size={12} color="#BFE8F7" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#BFE8F7' }}>School Online Library</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 12, maxWidth: 500 }}>
            Temukan buku <br />
            <span style={{ color: '#BFE8F7' }}>impianmu</span> di sini
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 380 }}>
            Akses ribuan koleksi buku fisik dan digital. Pinjam, baca, dan kembalikan dengan mudah.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/koleksi" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'white', color: '#1D2A8A',
              padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
              fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
            }}>
              <BookOpen size={16} /> Jelajahi Koleksi
            </Link>
            <Link href="/ebook" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
              fontWeight: 700, fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.3)',
            }}>
              E-Book Gratis
            </Link>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
            {[{ label: 'Koleksi Buku', value: '20+' }, { label: 'Anggota Aktif', value: '100+' }, { label: 'Dipinjam Hari Ini', value: '12' }].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rekomendasi */}
      <section className="animate-fade-in-up stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Rekomendasi untuk Kamu</h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Buku pilihan yang tersedia sekarang</p>
          </div>
          <Link href="/koleksi" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        {/* SearchableBookGrid agar pencarian dari Topbar berfungsi di Beranda */}
        <SearchableBookGrid
          books={rekomendasi ?? []}
          favoritedIds={favIds}
          initialQuery={q ?? ''}
          placeholder="Cari judul, pengarang, atau ISBN..."
        />
      </section>

      {/* Populer */}
      <section className="animate-fade-in-up stagger-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
              <TrendingUp size={18} style={{ display: 'inline', marginRight: 6, color: '#F59E0B' }} />
              Buku Populer
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Paling banyak dipinjam anggota</p>
          </div>
          <Link href="/populer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <BookGrid books={populer ?? []} favoritedIds={favIds} />
      </section>

      {/* Terbaru */}
      <section className="animate-fade-in-up stagger-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Buku Terbaru</h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Koleksi yang baru ditambahkan</p>
          </div>
          <Link href="/koleksi" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <BookGrid books={terbaru ?? []} favoritedIds={favIds} />
      </section>
    </div>
  )
}
