'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Loader2 } from 'lucide-react'
import { createLoan } from '@/actions/loans'
import { toggleFavorite } from '@/actions/books'
import type { Book, Profile } from '@/types'

interface BorrowButtonProps {
  book: Book
  profile: Profile | null
  alreadyBorrowed: boolean
  isFavorited: boolean
}

export function BorrowButton({ book, profile, alreadyBorrowed, isFavorited }: BorrowButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleBorrow = () => {
    if (!profile) return router.push('/login')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('book_id', book.id)
      const result = await createLoan(fd)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavorite(book.id)
      if (result.success) {
        setFavorited(!favorited)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  // Business rules checks for UI display
  let disabledReason = null
  if (book.stok_tersedia <= 0) disabledReason = 'Buku sedang habis'
  else if (alreadyBorrowed) disabledReason = 'Anda sedang meminjam buku ini'
  else if (profile?.status === 'diblokir') disabledReason = 'Akun diblokir (cek denda)'
  else if (profile && profile.total_denda > 0) disabledReason = 'Anda memiliki denda yang belum dibayar'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <button
          onClick={handleBorrow}
          disabled={pending || !!disabledReason}
          className="schoolib-btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
        >
          {pending ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...
            </span>
          ) : disabledReason ? (
            disabledReason
          ) : (
            'Pinjam Buku Sekarang'
          )}
        </button>
      </div>

      <button
        onClick={handleFavorite}
        disabled={pending}
        style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: favorited ? '#FEE2E2' : '#F1F5F9',
          border: '1px solid', borderColor: favorited ? '#FECACA' : '#E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Heart size={20} fill={favorited ? '#EF4444' : 'none'} color={favorited ? '#EF4444' : '#64748B'} />
      </button>
    </div>
  )
}
