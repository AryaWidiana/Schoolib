'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { toggleMemberStatus } from '@/actions/denda'

export function BlockButton({ userId, isBlocked, hasDenda }: { userId: string, isBlocked: boolean, hasDenda: boolean }) {
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    if (isBlocked && hasDenda) {
      toast.error('Tidak dapat mengaktifkan anggota yang masih memiliki denda.')
      return
    }

    const action = isBlocked ? 'aktifkan' : 'blokir'
    if (!confirm(`Apakah Anda yakin ingin meng${action} anggota ini?`)) return

    startTransition(async () => {
      const result = await toggleMemberStatus(userId)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <button onClick={handleToggle} disabled={pending || (isBlocked && hasDenda)} style={{
      padding: '6px 12px', fontSize: '0.75rem', borderRadius: 8, cursor: (isBlocked && hasDenda) ? 'not-allowed' : 'pointer',
      background: isBlocked ? '#DCFCE7' : '#FEF2F2',
      color: isBlocked ? '#166534' : '#991B1B',
      border: '1px solid', borderColor: isBlocked ? '#BBF7D0' : '#FECACA',
      opacity: (isBlocked && hasDenda) ? 0.5 : 1,
    }}>
      {pending ? <Loader2 size={12} className="animate-spin" /> : isBlocked ? 'Aktifkan' : 'Blokir'}
    </button>
  )
}
