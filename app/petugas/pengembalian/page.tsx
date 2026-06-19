import { getAllLoans } from '@/actions/loans'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'
import { ReturnButton } from './return-button'

export default async function PengembalianPage() {
  const loans = await getAllLoans({ limit: 100 })
  const activeLoans = loans.filter(l => l.status === 'dipinjam' || l.status === 'terlambat')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ArrowLeftRight size={20} color="#1D2A8A" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Proses Pengembalian</h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Terima pengembalian buku dan hitung denda otomatis</p>
      </div>

      <div className="schoolib-card" style={{ padding: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Anggota</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Buku</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status / Jatuh Tempo</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{l.profile?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.profile?.nim || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{l.book?.judul?.substring(0, 30)}{l.book?.judul?.length > 30 ? '...' : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.book?.isbn}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ marginBottom: 4 }}><StatusBadge status={l.status} /></div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{formatDate(l.tanggal_jatuh_tempo)}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <ReturnButton loanId={l.id} />
                  </td>
                </tr>
              ))}
              {activeLoans.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Tidak ada buku yang sedang dipinjam</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
