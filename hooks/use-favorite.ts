import { useState, useOptimistic, useTransition, useCallback } from 'react'
import { toast } from 'sonner'
import { toggleFavorite as toggleFavoriteAction } from '@/actions/books'

export function useFavorite(bookId: string, initialFavoritedStatus: boolean) {
  const [favorited, setFavorited] = useState(initialFavoritedStatus)
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(favorited)
  const [, startTransition] = useTransition()

  const toggleFavorite = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    startTransition(() => {
      setOptimisticFavorited(!optimisticFavorited)
    })

    toggleFavoriteAction(bookId)
      .then((result) => {
        if (result.success) {
          setFavorited(!favorited)
          toast.success(result.message, { duration: 1500 })
        } else {
          toast.error(result.message)
        }
      })
      .catch(() => {
        toast.error('Gagal menyimpan favorit. Coba lagi.')
      })
  }, [bookId, favorited, optimisticFavorited, setOptimisticFavorited])

  return {
    isFavorited: optimisticFavorited,
    toggleFavorite,
  }
}
