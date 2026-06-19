import { getMyLoans } from '@/actions/loans'
import { LoanCard } from '@/components/loans/loan-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Clock, Search, X } from 'lucide-react'
import Link from 'next/link'

interface RiwayatProps {
  searchParams: Promise<{ q?: string }>
}

export default async function RiwayatPage({ searchParams }: RiwayatProps) {
  const { q } = await searchParams
  const allLoans = await getMyLoans()

  // Filter berdasarkan judul atau pengarang buku
  const filteredLoans = q && q.trim()
    ? allLoans.filter(l =>
        l.book?.judul?.toLowerCase().includes(q.toLowerCase()) ||
        l.book?.pengarang?.toLowerCase().includes(q.toLowerCase())
      )
    : allLoans

  const active = filteredLoans.filter(l => l.status !== 'dikembalikan')
  const history = filteredLoans.filter(l => l.status === 'dikembalikan')

  // Stats selalu dari semua data (tidak terpengaruh filter)
  const stats = {
    total: allLoans.length,
    dipinjam: allLoans.filter(l => l.status === 'dipinjam').length,
    terlambat: allLoans.filter(l => l.status === 'terlambat').length,
    dikembalikan: allLoans.filter(l => l.status === 'dikembalikan').length,
    totalDenda: allLoans.reduce((s, l) => s + l.denda, 0),
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Clock size={20} color="#1D2A8A" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Riwayat Peminjaman</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {q
              ? <>Hasil pencarian &quot;<strong style={{ color: '#1E293B' }}>{q}</strong>&quot; — {filteredLoans.length} dari {allLoans.length} peminjaman</>
              : 'Semua aktivitas peminjaman buku Anda'}
          </p>
        </div>

        {/* Tombol hapus pencarian */}
        {q && (
          <Link
            href="/riwayat"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem',
              fontWeight: 600, textDecoration: 'none',
              background: '#F1F5F9', color: '#475569',
              border: '1px solid #E2E8F0',
            }}
          >
            <X size={14} /> Hapus pencarian
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Pinjam', value: stats.total, color: '#1D2A8A', bg: '#DBEAFE' },
          { label: 'Aktif', value: stats.dipinjam, color: '#0369A1', bg: '#E0F2FE' },
          { label: 'Terlambat', value: stats.terlambat, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Dikembalikan', value: stats.dikembalikan, color: '#16A34A', bg: '#DCFCE7' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search indicator */}
      {q && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#EFF6FF', border: '2px solid #1D2A8A',
          borderRadius: 12, padding: '10px 16px', marginBottom: 20,
        }}>
          <Search size={16} color="#1D2A8A" />
          <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>{q}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', background: '#DBEAFE',
            color: '#1E40AF', borderRadius: 20, padding: '2px 10px', fontWeight: 600,
          }}>
            {filteredLoans.length} hasil
          </span>
        </div>
      )}

      {/* Konten */}
      {allLoans.length === 0 ? (
        <EmptyState type="loans" />
      ) : filteredLoans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
          <Search size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>Tidak ada peminjaman yang cocok dengan &quot;{q}&quot;</p>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Coba kata kunci lain seperti judul atau pengarang buku</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {active.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                📚 Pinjaman Aktif
                <span className="badge badge-blue">{active.length}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {active.map(loan => <LoanCard key={loan.id} loan={loan} showActions />)}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
                ✅ Riwayat Pengembalian ({history.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(loan => <LoanCard key={loan.id} loan={loan} showActions={false} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
