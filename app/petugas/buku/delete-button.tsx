'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
// import { deleteBook } from '@/actions/books'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DeleteBookButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Hapus buku ini? Tindakan ini tidak dapat dibatalkan.')) return
    startTransition(async () => {
      // Mock delete functionality
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake delay
      toast.success('Buku berhasil dihapus.')
    })
  }

  return (
    <button onClick={handleDelete} disabled={pending} style={{
      padding: 6, background: '#FEF2F2', color: '#EF4444', borderRadius: 6,
      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}
