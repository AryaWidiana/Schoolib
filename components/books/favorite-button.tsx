'use client'

import { memo } from 'react'
import { Heart } from 'lucide-react'
import { useFavorite } from '@/hooks/use-favorite'

interface FavoriteButtonProps {
  bookId: string
  initialFavoritedStatus: boolean
  /**
   * Callback opsional yang dipanggil setelah mutasi server BERHASIL.
   * Menerima status favorit terbaru sebagai argumen (true = ditambahkan, false = dihapus).
   *
   * Gunakan ini di halaman /favorit untuk langsung menghapus card dari daftar
   * lokal tanpa menunggu router refresh:
   * @example
   * <FavoriteButton
   *   bookId={book.id}
   *   initialFavoritedStatus={true}
   *   onToggleSuccess={(isFav) => {
   *     if (!isFav) setLocalBooks(prev => prev.filter(b => b.id !== book.id))
   *   }}
   * />
   */
  onToggleSuccess?: (newIsFavorited: boolean) => void
}

// Menggunakan memo agar komponen ini tidak re-render kecuali props berubah.
// Catatan: onToggleSuccess harus stabil (pakai useCallback di parent) agar
// memo comparison tidak gagal setiap render.
export const FavoriteButton = memo(function FavoriteButton({ 
  bookId, 
  initialFavoritedStatus,
  onToggleSuccess,
}: FavoriteButtonProps) {
  const { isFavorited: favoritedNow, toggleFavorite } = useFavorite(
    bookId,
    initialFavoritedStatus,
    onToggleSuccess,
  )

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
        zIndex: 10,
      }}
      aria-label={favoritedNow ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
    >
      <Heart size={14} fill={favoritedNow ? '#EF4444' : 'none'} color={favoritedNow ? '#EF4444' : '#64748B'} />
    </button>
  )
})
