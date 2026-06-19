'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { formatDate, formatRupiah } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { returnBook, extendLoan } from '@/actions/loans'
import type { LoanWithBook } from '@/types'

interface LoanCardProps {
  loan: LoanWithBook
  showActions?: boolean
}

export function LoanCard({ loan, showActions = true }: LoanCardProps) {
  const [pending, startTransition] = useTransition()
  const book = loan.book

  const handleReturn = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('loan_id', loan.id)
      fd.set('tanggal_kembali', new Date().toISOString().split('T')[0])
      const result = await returnBook(fd)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  const handleExtend = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('loan_id', loan.id)
      const result = await extendLoan(fd)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  const isActive = loan.status === 'dipinjam' || loan.status === 'terlambat'

  return (
    <div className="schoolib-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* Book cover mini */}
      <div style={{
        width: 52, height: 72, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.2rem' }}>📖</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.3 }}>
            {book?.judul}
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 8 }}>{book?.pengarang}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 12 }}>
          <Info label="Tanggal Pinjam" value={formatDate(loan.tanggal_pinjam)} />
          <Info label="Jatuh Tempo" value={formatDate(loan.tanggal_jatuh_tempo)} />
          {loan.tanggal_kembali && <Info label="Dikembalikan" value={formatDate(loan.tanggal_kembali)} />}
          {loan.denda > 0 && <Info label="Denda" value={formatRupiah(loan.denda)} highlight />}
          {loan.hari_telat > 0 && <Info label="Telat" value={`${loan.hari_telat} hari`} highlight />}
          {loan.sudah_diperpanjang && <Info label="Perpanjangan" value="Sudah 1×" />}
        </div>

        {showActions && isActive && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleReturn}
              disabled={pending}
              className="schoolib-btn-primary"
              style={{ fontSize: '0.78rem', padding: '7px 14px' }}
            >
              ✓ Kembalikan
            </button>
            {loan.status === 'dipinjam' && !loan.sudah_diperpanjang && (
              <button
                onClick={handleExtend}
                disabled={pending}
                className="schoolib-btn-secondary"
                style={{ fontSize: '0.78rem', padding: '7px 14px' }}
              >
                ↻ Perpanjang +7 Hari
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: highlight ? '#EF4444' : '#1E293B' }}>{value}</div>
    </div>
  )
}
