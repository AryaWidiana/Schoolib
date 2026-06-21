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
 *
 * @param bookId - ID buku yang akan di-toggle favoritnya
 * @param initialFavoritedStatus - Status favorit awal dari server
 * @param onToggleSuccess - Callback opsional yang dipanggil SETELAH mutasi server
 *   berhasil, menerima status favorit terbaru (boolean). Digunakan oleh halaman
 *   /favorit untuk optimistic removal dari daftar lokal.
 */
export function useFavorite(
  bookId: string,
  initialFavoritedStatus: boolean,
  onToggleSuccess?: (newIsFavorited: boolean) => void
) {
  // 1. STATE LOKAL — satu-satunya sumber kebenaran untuk tampilan ikon.
  //    Tidak terhubung ke global state, context, atau cache apapun.
  const [isLiked, setIsLiked] = useState(initialFavoritedStatus)

  // Ref untuk membaca nilai terkini tanpa perlu isLiked masuk ke dependency array.
  // Ini mencegah stale closure dan menghindari pembuatan ulang handler.
  const isLikedRef = useRef(isLiked)
  isLikedRef.current = isLiked

  // Ref stabil untuk callback — menghindari onToggleSuccess masuk ke dependency
  // array useCallback (yang akan menyebabkan handler dibuat ulang setiap render).
  const onToggleSuccessRef = useRef(onToggleSuccess)
  onToggleSuccessRef.current = onToggleSuccess

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
    const nextValue = !prevValue
    setIsLiked(nextValue)

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
          // Beritahu parent (misal halaman /favorit) bahwa mutasi berhasil.
          // Dipanggil SETELAH server konfirmasi — bukan optimistic — sehingga
          // parent bisa memutuskan untuk menghapus card dari daftar dengan aman.
          onToggleSuccessRef.current?.(nextValue)
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
  }, [bookId]) // bookId saja — isLiked & callback dibaca via ref (bukan closure)

  return {
    isFavorited: isLiked,
    toggleFavorite,
  }
}
