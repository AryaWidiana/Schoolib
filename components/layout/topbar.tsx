'use client'

import { useState } from 'react'
import { Bell, User, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import { logout } from '@/actions/auth'

interface TopbarProps {
  profile: Profile | null
}

export function Topbar({ profile }: TopbarProps) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="dashboard-topbar" style={{
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Notification bell */}
      <Link href="/profil" prefetch style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 10, background: '#F8FAFC',
        border: '1px solid #E2E8F0', textDecoration: 'none', color: '#64748B',
        transition: 'all 0.2s',
      }}>
        <Bell size={18} />
      </Link>

      {/* Profile menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowProfile(!showProfile)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 12,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
          }}>
            {profile ? getInitials(profile.full_name) : <User size={14} />}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap' }}>
              {profile?.full_name ?? 'Loading...'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'capitalize' }}>
              {profile?.role ?? ''}
            </div>
          </div>
          <ChevronDown size={14} color="#94A3B8" />
        </button>

        {showProfile && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'white', border: '1px solid #E2E8F0', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 100,
            padding: 8,
          }}>
            <Link href="/profil" prefetch={true} onClick={() => setShowProfile(false)} style={{
              display: 'block', padding: '9px 12px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.875rem', color: '#1E293B',
              fontWeight: 500,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >👤 Profil Saya</Link>
            <Link href="/riwayat" prefetch={true} onClick={() => setShowProfile(false)} style={{
              display: 'block', padding: '9px 12px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >📚 Riwayat</Link>
            <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
            <form action={logout}>
              <button type="submit" style={{
                display: 'block', width: '100%', padding: '9px 12px', borderRadius: 8,
                textAlign: 'left', fontSize: '0.875rem', color: '#EF4444', fontWeight: 500,
                background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >🚪 Keluar</button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
