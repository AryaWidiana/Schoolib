'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { returnBook } from '@/actions/loans'

export function ReturnButton({ loanId }: { loanId: string }) {
  const [pending, startTransition] = useTransition()

  const handleReturn = () => {
    if (!confirm('Proses pengembalian buku ini?')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('loan_id', loanId)
      const result = await returnBook(fd)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <button onClick={handleReturn} disabled={pending} className="schoolib-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
      {pending ? <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Loader2 size={12} className="animate-spin" /> Memproses...</span> : 'Terima Buku'}
    </button>
  )
}
