'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { toggleFavorite as toggleFavoriteAction } from '@/actions/books'

/**
 * Hook favorit dengan pendekatan MURNI NON-BLOCKING.
 *
 * Perbedaan dari versi sebelumnya:
 * - TIDAK menggunakan useOptimistic (membutuhkan useTransition yang bisa mengunci router)
 * - TIDAK menggunakan useTransition (bisa blocking terhadap navigasi Next.js App Router)
 * - State dibalik INSTAN via useState biasa di baris pertama handler
 * - Mutasi database berjalan sepenuhnya di background (true fire-and-forget)
 * - Jika mutasi gagal, state otomatis di-rollback ke nilai sebelumnya
 */
export function useFavorite(bookId: string, initialFavoritedStatus: boolean) {
  // 1. STATE LOKAL BINER: Satu-satunya sumber kebenaran untuk UI ikon.
  // Tidak ada koneksi ke state global, tidak ada router.refresh().
  const [isLiked, setIsLiked] = useState(initialFavoritedStatus)

  // Ref untuk melacak nilai terbaru tanpa menyebabkan re-render atau
  // membuat ulang handler (menghindari stale closure di useCallback)
  const isLikedRef = useRef(isLiked)
  isLikedRef.current = isLiked

  // Ref untuk mencegah double-click (debounce sederhana via flag)
  const isMutatingRef = useRef(false)

  // 2. HANDLER NON-BLOCKING dengan useCallback agar referensi stabil
  const toggleFavorite = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Cegah double-click cepat yang bisa menyebabkan state race condition
    if (isMutatingRef.current) return
    isMutatingRef.current = true

    // 3. BALIK STATE INSTAN — tidak menunggu apapun dari server
    const prevValue = isLikedRef.current
    const nextValue = !prevValue
    setIsLiked(nextValue)

    // 4. FIRE-AND-FORGET: Jalankan mutasi database tanpa memblokir apapun.
    // Tidak ada 'await', tidak ada startTransition, tidak ada router.refresh().
    // Promise ini berjalan sepenuhnya di background event loop.
    toggleFavoriteAction(bookId)
      .then((result) => {
        if (result.success) {
          toast.success(result.message, { duration: 1500 })
        } else {
          // Rollback UI jika server menolak (misal: sesi expired)
          setIsLiked(prevValue)
          toast.error(result.message)
        }
      })
      .catch(() => {
        // Rollback UI jika koneksi gagal
        setIsLiked(prevValue)
        toast.error('Gagal menyimpan. Cek koneksi internet Anda.')
      })
      .finally(() => {
        // Buka kunci setelah mutasi selesai agar klik berikutnya bisa diterima
        isMutatingRef.current = false
      })
  }, [bookId]) // bookId saja — tidak bergantung pada isLiked (pakai ref)

  return {
    isFavorited: isLiked,
    toggleFavorite,
  }
}
