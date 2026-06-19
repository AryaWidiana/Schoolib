import { getAllMembers } from '@/actions/denda'
import { Users } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { BlockButton } from './block-button'
import { StatusBadge } from '@/components/shared/status-badge'

export default async function AnggotaPage() {
  const members = await getAllMembers()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Users size={20} color="#8B5CF6" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Data Anggota</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Manajemen pengguna dan status keanggotaan</p>
        </div>
      </div>

      <div className="schoolib-card" style={{ padding: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Info Anggota</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Terdaftar</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Denda</th>
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
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(m.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: m.total_denda > 0 ? '#EF4444' : '#64748B' }}>
                    {m.total_denda > 0 ? formatRupiah(m.total_denda) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <BlockButton userId={m.id} isBlocked={m.status === 'diblokir'} hasDenda={m.total_denda > 0} />
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Tidak ada anggota terdaftar</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
