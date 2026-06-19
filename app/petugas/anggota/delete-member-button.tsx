'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteMember } from '@/actions/denda'

export function DeleteMemberButton({ userId, memberName }: { userId: string, memberName: string }) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm(`Hapus anggota ${memberName}? Semua riwayat dan denda terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`)) return
    
    startTransition(async () => {
      const result = await deleteMember(userId)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <button onClick={handleDelete} disabled={pending} title="Hapus Anggota" style={{
      padding: '6px', background: '#FEF2F2', color: '#EF4444', borderRadius: 8,
      border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}
