'use client'

import { memo } from 'react'
import { Heart, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { Book } from '@/types'
import { getCoverGradient, getBookAvailability, truncate } from '@/lib/utils'
import { useFavorite } from '@/hooks/use-favorite'

interface BookCardProps {
  book: Book
  isFavorited?: boolean
  showActions?: boolean
}

export const BookCard = memo(function BookCard({ book, isFavorited = false, showActions = true }: BookCardProps) {
  const { isFavorited: favoritedNow, toggleFavorite } = useFavorite(book.id, isFavorited)
  const gradient = getCoverGradient(book.judul)
  const availability = getBookAvailability(book.stok_tersedia)

  return (
    <Link href={`/buku/${book.id}`} prefetch={true} style={{ textDecoration: 'none' }}>
      <div style={{
        cursor: 'pointer', borderRadius: 14, overflow: 'hidden',
        background: 'white', border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,42,138,0.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Cover */}
        <div style={{
          aspectRatio: '2/3',
          backgroundImage: book.cover_url ? `url(${book.cover_url})` : `linear-gradient(135deg, #1D2A8A, #3B5BDB)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 16, position: 'relative',
        }}
          className={`bg-gradient-to-br ${gradient}`}
        >
          {!book.cover_url && (
            <>
              <BookOpen size={36} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
              <div style={{
                marginTop: 12, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                textAlign: 'center', lineHeight: 1.3, padding: '0 8px',
              }}>
                {truncate(book.judul, 40)}
              </div>
            </>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {book.is_ebook && (
              <span style={{ background: '#7C3AED', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.65rem', fontWeight: 700 }}>
                E-Book
              </span>
            )}
            {availability === 'Tidak Tersedia' && (
              <span style={{ background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.65rem', fontWeight: 700 }}>
                Habis
              </span>
            )}
          </div>

          {/* Favorite button */}
          {showActions && (
            <button
              onClick={toggleFavorite}
              style={{
                position: 'absolute', top: 8, right: 8,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Heart size={14} fill={favoritedNow ? '#EF4444' : 'none'} color={favoritedNow ? '#EF4444' : '#64748B'} />
            </button>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.3, marginBottom: 4 }}>
            {truncate(book.judul, 36)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: 8 }}>
            {truncate(book.pengarang, 28)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: availability === 'Tersedia' ? '#DCFCE7' : availability === 'Terbatas' ? '#FEF9C3' : '#FEE2E2',
              color: availability === 'Tersedia' ? '#166534' : availability === 'Terbatas' ? '#854D0E' : '#991B1B',
            }}>
              {book.stok_tersedia > 0 ? `${book.stok_tersedia} tersedia` : 'Habis'}
            </span>
            {book.kategori && (
              <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>{book.kategori}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}, (prevProps, nextProps) => {
  // Hanya re-render jika ID buku atau status favoritnya berubah (mencegah re-render massal di grid)
  return prevProps.book.id === nextProps.book.id && 
         prevProps.isFavorited === nextProps.isFavorited &&
         prevProps.showActions === nextProps.showActions
})
