import { createClient } from '@/lib/supabase/server'
import { LoanCard } from '@/components/loans/loan-card'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { LoanWithBook } from '@/types'

export default async function RiwayatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Refresh overdue status
  await supabase.rpc('update_overdue_loans')

  const { data: loans } = await supabase
    .from('loans')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allLoans = (loans as LoanWithBook[]) ?? []
  const active = allLoans.filter(l => l.status !== 'dikembalikan')
  const history = allLoans.filter(l => l.status === 'dikembalikan')

  const stats = {
    total: allLoans.length,
    dipinjam: allLoans.filter(l => l.status === 'dipinjam').length,
    terlambat: allLoans.filter(l => l.status === 'terlambat').length,
    dikembalikan: allLoans.filter(l => l.status === 'dikembalikan').length,
    totalDenda: allLoans.reduce((s, l) => s + l.denda, 0),
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Clock size={20} color="#1D2A8A" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Riwayat Peminjaman</h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Semua aktivitas peminjaman buku Anda</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
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

      {allLoans.length === 0 ? (
        <EmptyState type="loans" />
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
