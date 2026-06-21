'use client'

import { memo } from 'react'
import { Heart } from 'lucide-react'
import { useFavorite } from '@/hooks/use-favorite'

interface FavoriteButtonProps {
  bookId: string
  initialFavoritedStatus: boolean
}

// Menggunakan memo agar komponen ini tidak re-render kecuali props berubah
export const FavoriteButton = memo(function FavoriteButton({ 
  bookId, 
  initialFavoritedStatus 
}: FavoriteButtonProps) {
  // Pindahkan hook useFavorite ke DALAM Micro-Component ini
  // Dengan begini, saat state isLiked berubah, HANYA tombol ini yang re-render
  // bukan seluruh BookCard.
  const { isFavorited: favoritedNow, toggleFavorite } = useFavorite(bookId, initialFavoritedStatus)

  return (
    <button
      onClick={(e) => {
        // Stop event bubbling agar tidak memicu navigasi <Link> pada BookCard
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(e)
      }}
      style={{
        position: 'absolute', top: 8, right: 8,
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        zIndex: 10 // Pastikan tombol bisa di-klik dan berada di atas elemen lain
      }}
      aria-label={favoritedNow ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
    >
      <Heart size={14} fill={favoritedNow ? '#EF4444' : 'none'} color={favoritedNow ? '#EF4444' : '#64748B'} />
    </button>
  )
})
