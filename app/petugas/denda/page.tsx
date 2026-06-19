import { getMembersWithFines } from '@/actions/denda'
import { AlertCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { PayButton } from './pay-button'

export default async function KelolaDendaPage() {
  const members = await getMembersWithFines()
  const total = members.reduce((s, m) => s + m.total_denda, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertCircle size={20} color="#EF4444" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Kelola Denda</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Daftar anggota yang memiliki tunggakan denda keterlambatan</p>
        </div>
        <div style={{ background: '#FEF2F2', padding: '12px 20px', borderRadius: 12, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600 }}>TOTAL PIUTANG DENDA</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626' }}>{formatRupiah(total)}</div>
        </div>
      </div>

      <div className="schoolib-card" style={{ padding: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Anggota</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Denda</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{m.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.nim || m.phone || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#EF4444' }}>
                    {formatRupiah(m.total_denda)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <PayButton userId={m.id} amount={m.total_denda} />
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={3} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Tidak ada anggota yang memiliki denda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
