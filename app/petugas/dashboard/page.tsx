import { getDashboardStats } from '@/actions/denda'
import { BookOpen, Users, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'

export default async function PetugasDashboard() {
  const start = performance.now()
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total Buku', value: stats.totalBooks, icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF', href: '/petugas/buku' },
    { label: 'Total Anggota', value: stats.totalMembers, icon: Users, color: '#8B5CF6', bg: '#F5F3FF', href: '/petugas/anggota' },
    { label: 'Pinjaman Aktif', value: stats.activeLoans, icon: Clock, color: '#0EA5E9', bg: '#F0F9FF', href: '/petugas/peminjaman' },
    { label: 'Terlambat', value: stats.overdueLoans, icon: AlertCircle, color: '#EF4444', bg: '#FEF2F2', href: '/petugas/pengembalian' },
  ]

  console.log(`[Performance] Waktu Render Dashboard Petugas: ${(performance.now() - start).toFixed(2)}ms`)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Dashboard Petugas</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Ringkasan sistem perpustakaan hari ini</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
            <div className="schoolib-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={24} color={c.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>{c.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div className="schoolib-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#1D2A8A" /> Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/petugas/buku/tambah" className="schoolib-btn-primary" style={{ textDecoration: 'none' }}>+ Tambah Buku</Link>
            <Link href="/petugas/pengembalian" className="schoolib-btn-secondary" style={{ textDecoration: 'none' }}>Proses Pengembalian</Link>
          </div>
        </div>

        <div className="schoolib-card" style={{ padding: 24, background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)', color: 'white' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Total Denda Belum Dibayar</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>{formatRupiah(stats.totalFines)}</div>
          <Link href="/petugas/denda" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            Kelola Denda →
          </Link>
        </div>
      </div>
    </div>
  )
}
