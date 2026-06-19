'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteBook } from '@/actions/books'

export function DeleteBookButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Hapus buku ini? Tindakan ini tidak dapat dibatalkan.')) return
    startTransition(async () => {
      const result = await deleteBook(id)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
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
