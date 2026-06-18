'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { payFine } from '@/actions/denda'
import { formatRupiah } from '@/lib/utils'

export function PayButton({ userId, amount }: { userId: string, amount: number }) {
  const [pending, startTransition] = useTransition()

  const handlePay = () => {
    if (!confirm(`Konfirmasi pembayaran denda sebesar ${formatRupiah(amount)}?`)) return
    startTransition(async () => {
      const result = await payFine(userId, amount)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <button onClick={handlePay} disabled={pending} className="schoolib-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #059669, #10B981)' }}>
      {pending ? <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Loader2 size={12} className="animate-spin" /> Proses...</span> : 'Terima Pembayaran'}
    </button>
  )
}
