import { Calendar, Newspaper, AlertCircle, Clock, BookOpen } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { Profile, LoanWithBook } from '@/types'

interface RightSidebarProps {
  profile: Profile | null
  activeLoans: LoanWithBook[]
}

function CalendarWidget() {
  const now = new Date()
  const month = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const today = now.getDate()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="schoolib-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Calendar size={16} color="#1D2A8A" />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{month}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {days.map(d => (
          <div key={d} style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', padding: '2px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} style={{
            fontSize: '0.75rem',
            fontWeight: day === today ? 700 : 400,
            color: day === today ? 'white' : day ? '#1E293B' : 'transparent',
            background: day === today ? 'linear-gradient(135deg, #1D2A8A, #3B5BDB)' : 'transparent',
            borderRadius: 6,
            padding: '4px 2px',
            aspectRatio: '1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {day ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export function RightSidebar({ profile, activeLoans }: RightSidebarProps) {
  const overdueLoans = activeLoans.filter(l => l.status === 'terlambat')
  const upcomingLoans = activeLoans.filter(l => l.status === 'dipinjam').slice(0, 3)

  return (
    <aside className="dashboard-right" style={{
      background: '#F8FAFC',
      borderLeft: '1px solid #E2E8F0',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* User Info Card */}
      {profile && (
        <div className="schoolib-card" style={{ padding: 16, background: 'linear-gradient(135deg, #1D2A8A 0%, #3B5BDB 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1rem',
            }}>
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{profile.full_name}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,255,255,0.2)', borderRadius: 99,
                padding: '2px 8px', fontSize: '0.7rem', color: 'white', fontWeight: 600,
              }}>
                {profile.status === 'aktif' ? '✓ Aktif' : '⊘ Diblokir'}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 600, marginBottom: 2 }}>PINJAMAN AKTIF</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>{activeLoans.length}</div>
            </div>
            <div style={{ background: profile.total_denda > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 600, marginBottom: 2 }}>DENDA</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>
                {profile.total_denda > 0 ? formatRupiah(profile.total_denda) : 'Rp 0'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <CalendarWidget />

      {/* Overdue Alert */}
      {overdueLoans.length > 0 && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertCircle size={15} color="#EF4444" />
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#991B1B' }}>
              {overdueLoans.length} Buku Terlambat!
            </span>
          </div>
          {overdueLoans.map(loan => (
            <div key={loan.id} style={{ fontSize: '0.75rem', color: '#7F1D1D', marginBottom: 4, display: 'flex', gap: 6 }}>
              <BookOpen size={12} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{loan.book?.judul}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming due dates */}
      {upcomingLoans.length > 0 && (
        <div className="schoolib-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Clock size={15} color="#1D2A8A" />
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B' }}>Jatuh Tempo</span>
          </div>
          {upcomingLoans.map(loan => (
            <div key={loan.id} style={{ marginBottom: 8, padding: '8px 10px', background: '#F8FAFC', borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>
                {loan.book?.judul?.length > 28 ? loan.book.judul.slice(0, 28) + '…' : loan.book?.judul}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                {formatDate(loan.tanggal_jatuh_tempo)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News widget */}
      <div className="schoolib-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Newspaper size={15} color="#1D2A8A" />
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B' }}>Info Perpustakaan</span>
        </div>
        {[
          { icon: '📅', text: 'Jam buka: Senin–Jumat 08.00–16.00' },
          { icon: '📖', text: 'Maks. 3 buku per anggota aktif' },
          { icon: '⏰', text: 'Durasi pinjam 7 hari, perpanjang 1×' },
          { icon: '💰', text: 'Denda keterlambatan Rp 1.000/hari' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: '0.75rem', color: '#64748B', alignItems: 'flex-start' }}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
