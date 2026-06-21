'use client'

import { useState, useCallback } from 'react'
import { Heart, Search, X } from 'lucide-react'
import Link from 'next/link'
import { BookCard } from '@/components/books/book-card'
import { EmptyState } from '@/components/shared/empty-state'
import type { Book } from '@/types'

interface FavoritClientProps {
  /** Daftar buku favorit awal dari server (sudah difilter sesuai query jika ada) */
  initialBooks: Book[]
  /** Semua buku favorit tanpa filter — digunakan untuk counter total */
  totalCount: number
  /** Query pencarian aktif, jika ada */
  searchQuery?: string
}

/**
 * Komponen client untuk halaman /favorit.
 *
 * Mengapa ini dipisah dari page.tsx (Server Component)?
 * - page.tsx tetap sebagai Server Component agar bisa menggunakan Prisma
 *   langsung dan mendukung `force-dynamic` (selalu fresh dari server).
 * - Komponen ini mengelola daftar buku secara lokal (useState) sehingga
 *   ketika buku dihapus dari favorit, card-nya langsung menghilang dari
 *   layar tanpa menunggu navigasi atau router.refresh().
 *
 * Alur optimistic removal:
 * 1. User klik ikon hati pada BookCard → FavoriteButton toggle ikon (0ms)
 * 2. fetch('/api/favorites') dikirim ke background
 * 3. Server konfirmasi berhasil → onToggleSuccess dipanggil dengan isFav=false
 * 4. handleToggleSuccess memfilter book dari localBooks → card menghilang instan
 * 5. Server cache /favorit sudah di-revalidate oleh API route
 *    → refresh berikutnya akan menampilkan data yang benar
 */
export function FavoritClient({ initialBooks, totalCount, searchQuery }: FavoritClientProps) {
  // State lokal yang bisa di-filter secara optimistic tanpa round-trip server
  const [localBooks, setLocalBooks] = useState<Book[]>(initialBooks)

  // Stable callback factory — dibungkus useCallback dengan bookId sebagai dep
  // agar memo pada FavoriteButton tidak gagal.
  // Dipanggil oleh FavoriteButton → useFavorite setelah server konfirmasi OK.
  const makeToggleHandler = useCallback(
    (bookId: string) => (newIsFavorited: boolean) => {
      // Hanya hapus dari list lokal jika buku di-unfavorite (bukan ditambah)
      if (!newIsFavorited) {
        setLocalBooks((prev) => prev.filter((b) => b.id !== bookId))
      }
    },
    []
  )

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
            {searchQuery
              ? <><span>Hasil pencarian &quot;<strong style={{ color: '#1E293B' }}>{searchQuery}</strong>&quot; — {localBooks.length} dari {totalCount} buku favorit</span></>
              : `${localBooks.length} buku tersimpan`}
          </p>
        </div>

        {/* Tombol hapus pencarian */}
        {searchQuery && (
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
      {searchQuery && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFF1F2', border: '2px solid #EF4444',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
        }}>
          <Search size={16} color="#EF4444" />
          <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>{searchQuery}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', background: '#FFE4E6',
            color: '#9F1239', borderRadius: 20, padding: '2px 10px', fontWeight: 600,
          }}>
            {localBooks.length} hasil
          </span>
        </div>
      )}

      {/* Konten */}
      {totalCount === 0 ? (
        <EmptyState type="favorites" />
      ) : localBooks.length === 0 ? (
        // Semua buku sudah di-unfavorite dalam sesi ini, atau hasil pencarian kosong
        <EmptyState type={searchQuery ? 'search' : 'favorites'} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 16,
        }}>
          {localBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorited={true}
              showActions={true}
              // Teruskan stable callback agar FavoriteButton bisa menghapus card ini
              onFavoriteToggleSuccess={makeToggleHandler(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
