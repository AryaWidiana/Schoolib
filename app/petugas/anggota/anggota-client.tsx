'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Users } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { BlockButton } from './block-button'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteMemberButton } from './delete-member-button'
import type { Profile } from '@/types'

interface AnggotaClientProps {
  members: Profile[]
}

export function AnggotaClient({ members }: AnggotaClientProps) {
  const [query, setQuery] = useState('')
  // Debounce 400ms: filter hanya berjalan jika user berhenti mengetik
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    if (!q) return members
    return members.filter(m =>
      m.full_name?.toLowerCase().includes(q) ||
      m.nim?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q)
    )
  }, [debouncedQuery, members])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Users size={20} color="#8B5CF6" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Data Anggota</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Manajemen pengguna dan status keanggotaan</p>
        </div>

        {/* Search box */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau telepon…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              fontSize: '0.875rem',
              borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              outline: 'none',
              background: '#F8FAFC',
              color: '#1E293B',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          />
        </div>
      </div>

      {/* Result count */}
      {query && (
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 12 }}>
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{members.length}</strong> anggota
        </p>
      )}

      {/* Table */}
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
              {filtered.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>
                      <Highlight text={m.full_name ?? ''} query={debouncedQuery} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      <Highlight text={m.nim || m.phone || '-'} query={debouncedQuery} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(m.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={m.status} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: m.total_denda > 0 ? '#EF4444' : '#64748B' }}>
                    {m.total_denda > 0 ? formatRupiah(m.total_denda) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <BlockButton userId={m.id} isBlocked={m.status === 'diblokir'} hasDenda={m.total_denda > 0} />
                      <DeleteMemberButton userId={m.id} memberName={m.full_name} />
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    {query
                      ? `Tidak ada anggota yang cocok dengan "${query}"`
                      : 'Tidak ada anggota terdaftar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** Highlight matching text in search results */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: '#DDD6FE',
              color: '#5B21B6',
              borderRadius: 3,
              padding: '0 2px',
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
