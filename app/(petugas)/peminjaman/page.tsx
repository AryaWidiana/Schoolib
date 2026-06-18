import { getAllLoans } from '@/actions/loans'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import { BookMarked } from 'lucide-react'

export default async function PeminjamanPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  // For 'peminjaman' page we only care about active/late loans, not history, unless specified
  const loans = await getAllLoans({ status: status as 'dipinjam' | 'terlambat' | 'dikembalikan', limit: 100 })
  const filtered = status ? loans : loans.filter(l => l.status !== 'dikembalikan')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BookMarked size={20} color="#1D2A8A" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Data Peminjaman</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Daftar buku yang sedang dipinjam oleh anggota</p>
        </div>
      </div>

      <div className="schoolib-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <a href="/petugas/peminjaman" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: !status ? '#1D2A8A' : '#F1F5F9', color: !status ? 'white' : '#64748B' }}>Aktif & Terlambat</a>
          <a href="/petugas/peminjaman?status=dipinjam" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: status === 'dipinjam' ? '#1D2A8A' : '#F1F5F9', color: status === 'dipinjam' ? 'white' : '#64748B' }}>Dipinjam</a>
          <a href="/petugas/peminjaman?status=terlambat" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: status === 'terlambat' ? '#EF4444' : '#F1F5F9', color: status === 'terlambat' ? 'white' : '#64748B' }}>Terlambat</a>
          <a href="/petugas/peminjaman?status=dikembalikan" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: status === 'dikembalikan' ? '#16A34A' : '#F1F5F9', color: status === 'dikembalikan' ? 'white' : '#64748B' }}>Riwayat</a>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Anggota</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Buku</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tanggal Pinjam</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Jatuh Tempo</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{l.profiles?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.profiles?.nim || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{l.books?.judul?.substring(0, 30)}{l.books?.judul?.length > 30 ? '...' : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.books?.isbn}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(l.tanggal_pinjam)}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(l.tanggal_jatuh_tempo)}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={l.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Tidak ada data peminjaman</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
