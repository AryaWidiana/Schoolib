'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

/**
 * Hook favorit dengan pendekatan MURNI NON-BLOCKING — versi akhir.
 *
 * Perbaikan dari versi sebelumnya (yang masih lag):
 * - TIDAK lagi memanggil Server Action `toggleFavoriteAction`.
 *   Server Actions tetap memicu serialization overhead Next.js dan
 *   memanggil getUser() yang melakukan 2 round-trip berurutan:
 *   (1) decrypt JWT → (2) prisma.profile.findUnique() — sebelum
 *   menyentuh tabel favorites sama sekali.
 *
 * - Sekarang memanggil POST /api/favorites (API Route biasa) via fetch().
 *   - fetch() adalah pure fire-and-forget dari browser: request terkirim,
 *     browser langsung lanjut tanpa memblokir render loop.
 *   - API Route hanya melakukan decrypt JWT in-memory (CPU, tanpa DB),
 *     lalu satu query Prisma ke tabel favorites. Total: 1 DB call.
 *   - Zero revalidatePath, zero router.refresh, zero global state update.
 */
export function useFavorite(bookId: string, initialFavoritedStatus: boolean) {
  // 1. STATE LOKAL — satu-satunya sumber kebenaran untuk tampilan ikon.
  //    Tidak terhubung ke global state, context, atau cache apapun.
  const [isLiked, setIsLiked] = useState(initialFavoritedStatus)

  // Ref untuk membaca nilai terkini tanpa perlu isLiked masuk ke dependency array.
  // Ini mencegah stale closure dan menghindari pembuatan ulang handler.
  const isLikedRef = useRef(isLiked)
  isLikedRef.current = isLiked

  // Flag debounce sederhana — mencegah double-click menyebabkan race condition.
  const isMutatingRef = useRef(false)

  // 2. HANDLER — referensi stabil via useCallback, hanya bergantung pada bookId.
  const toggleFavorite = useCallback((e?: React.MouseEvent) => {
    // Hentikan event bubbling agar tidak memicu <Link> di BookCard
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Tolak double-click selama mutasi sebelumnya belum selesai
    if (isMutatingRef.current) return
    isMutatingRef.current = true

    // 3. BALIK STATE INSTAN — baris pertama, tidak menunggu apapun.
    //    Ini yang memberikan 0ms visual latency pada ikon hati.
    const prevValue = isLikedRef.current
    setIsLiked(!prevValue)

    // 4. FIRE-AND-FORGET via fetch() ke API Route.
    //    fetch() tidak diawait — browser mengirim request di background
    //    dan langsung melanjutkan rendering tanpa hambatan.
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Kirim body minimal — hanya bookId yang diperlukan server
      body: JSON.stringify({ bookId }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok || !data.success) {
          // Rollback UI jika server menolak (sesi expired, dll)
          setIsLiked(prevValue)
          toast.error(data.message ?? 'Gagal menyimpan favorit.')
        } else {
          toast.success(data.message, { duration: 1500 })
        }
      })
      .catch(() => {
        // Rollback UI jika koneksi terputus
        setIsLiked(prevValue)
        toast.error('Gagal menyimpan. Cek koneksi internet Anda.')
      })
      .finally(() => {
        // Buka kunci agar klik berikutnya bisa diterima
        isMutatingRef.current = false
      })
  }, [bookId]) // bookId saja — isLiked dibaca via ref (bukan closure)

  return {
    isFavorited: isLiked,
    toggleFavorite,
  }
}
