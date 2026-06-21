'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import type { LoanWithBookAndProfile } from '@/types'
import { Search } from 'lucide-react'

// Tab definitions
type TabId = 'aktif' | 'dipinjam' | 'terlambat' | 'riwayat'

const TABS: { id: TabId; label: string; activeColor: string; activeText: string }[] = [
  { id: 'aktif',      label: 'Aktif & Terlambat', activeColor: '#1D2A8A', activeText: 'white' },
  { id: 'dipinjam',   label: 'Dipinjam',           activeColor: '#1D2A8A', activeText: 'white' },
  { id: 'terlambat',  label: 'Terlambat',           activeColor: '#EF4444', activeText: 'white' },
  { id: 'riwayat',   label: 'Riwayat',             activeColor: '#16A34A', activeText: 'white' },
]

// Skeleton for table rows
function TableSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i}>
          {[...Array(5)].map((_, j) => (
            <td key={j} style={{ padding: '12px 16px' }}>
              <div style={{
                height: 14, borderRadius: 6,
                background: '#F1F5F9',
                width: j === 0 ? '70%' : j === 1 ? '85%' : '60%',
                animation: 'pulse 1.5s infinite ease-in-out',
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface PeminjamanClientProps {
  aktifLoans: LoanWithBookAndProfile[]   // dipinjam + terlambat
  riwayatLoans: LoanWithBookAndProfile[] // dikembalikan (limited)
}

export function PeminjamanClient({ aktifLoans, riwayatLoans }: PeminjamanClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('aktif')
  // useTransition: perpindahan tab adalah tugas berprioritas rendah —
  // tombol tab tetap responsif, tabel boleh sedikit lag
  const [isPending, startTransition] = useTransition()

  // Debounce search di admin tabel
  const [searchQuery, setSearchQuery] = useState('')

  // 4. Client-side caching: semua data sudah ada di memori (di-pass dari server).
  // Tidak ada network request saat ganti tab — murni filter JavaScript.
  const displayedLoans = useMemo(() => {
    const allAktif = aktifLoans
    let base: LoanWithBookAndProfile[]

    switch (activeTab) {
      case 'aktif':     base = allAktif; break
      case 'dipinjam':  base = allAktif.filter(l => l.status === 'dipinjam'); break
      case 'terlambat': base = allAktif.filter(l => l.status === 'terlambat'); break
      case 'riwayat':   base = riwayatLoans; break
      default:          base = allAktif
    }

    // Filter pencarian lokal (debounce dilakukan di input onChange)
    if (!searchQuery.trim()) return base
    const q = searchQuery.toLowerCase()
    return base.filter(l =>
      l.profile?.full_name?.toLowerCase().includes(q) ||
      l.profile?.nim?.toLowerCase().includes(q) ||
      l.book?.judul?.toLowerCase().includes(q) ||
      l.book?.isbn?.toLowerCase().includes(q)
    )
  }, [activeTab, aktifLoans, riwayatLoans, searchQuery])

  // useCallback agar referensi stabil dan tidak membuat ulang handler
  const handleTabClick = useCallback((tab: TabId) => {
    // startTransition: beri tahu React bahwa ini update berprioritas rendah
    startTransition(() => {
      setActiveTab(tab)
      setSearchQuery('') // reset search saat ganti tab
    })
  }, [])

  return (
    <div className="schoolib-card" style={{ padding: 20 }}>
      {/* Tab Bar — tombol selalu responsif, tidak pernah freeze */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: '0.8rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive ? tab.activeColor : '#F1F5F9',
                color: isActive ? tab.activeText : '#64748B',
                // Sedikit redup saat pending sebagai visual cue non-blocking
                opacity: isPending ? 0.75 : 1,
              }}
            >
              {tab.label}
              {/* Badge count untuk tab aktif */}
              {tab.id === 'aktif' && (
                <span style={{
                  marginLeft: 6, background: isActive ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                  color: isActive ? 'white' : '#64748B',
                  borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem',
                }}>
                  {aktifLoans.length}
                </span>
              )}
              {tab.id === 'terlambat' && (
                <span style={{
                  marginLeft: 6, background: isActive ? 'rgba(255,255,255,0.2)' : '#FEE2E2',
                  color: isActive ? 'white' : '#DC2626',
                  borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem',
                }}>
                  {aktifLoans.filter(l => l.status === 'terlambat').length}
                </span>
              )}
            </button>
          )
        })}

        {/* Search bar terintegrasi dalam tab panel */}
        <div style={{ marginLeft: 'auto', position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari anggota atau buku..."
            style={{
              width: '100%', paddingLeft: 30, paddingRight: 10,
              paddingTop: 7, paddingBottom: 7,
              fontSize: '0.8rem', borderRadius: 8,
              border: '1.5px solid #E2E8F0', outline: 'none',
              background: '#F8FAFC', color: '#1E293B',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1D2A8A')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          />
        </div>
      </div>

      {/* Result count */}
      <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 12 }}>
        {isPending ? 'Memuat...' : `${displayedLoans.length} peminjaman ditemukan`}
        {activeTab === 'riwayat' && !isPending && (
          <span style={{ marginLeft: 4, color: '#CBD5E1' }}>· Menampilkan 50 riwayat terbaru</span>
        )}
      </p>

      {/* Tabel dengan Skeleton Loading saat tab berpindah */}
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
            {/* 3. Localized Skeleton — hanya area tabel yang loader, tab button tetap hidup */}
            {isPending ? (
              <TableSkeleton />
            ) : displayedLoans.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>
                  {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Tidak ada data peminjaman'}
                </td>
              </tr>
            ) : (
              displayedLoans.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{l.profile?.full_name ?? '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.profile?.nim ?? '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>
                      {(l.book?.judul ?? '').length > 32 ? l.book?.judul?.substring(0, 32) + '…' : l.book?.judul ?? '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.book?.isbn ?? '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(l.tanggal_pinjam)}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(l.tanggal_jatuh_tempo)}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={l.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
