'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Bell, User, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import { logout } from '@/actions/auth'

interface TopbarProps {
  profile: Profile | null
}

// Pages where search should stay in-place
const SEARCH_IN_PAGE = ['/koleksi', '/ebook', '/populer', '/favorit']

export function Topbar({ profile }: TopbarProps) {
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(currentQ)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input with URL query when navigating
  useEffect(() => {
    setQuery(currentQ)
  }, [currentQ])

  // Prefetch main routes on mount for instant navigation
  useEffect(() => {
    const routes = ['/', '/koleksi', '/populer', '/ebook', '/favorit', '/riwayat', '/profil']
    routes.forEach(route => router.prefetch(route))
  }, [router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    // Navigate to the correct page — search itself happens client-side on that page
    const target = SEARCH_IN_PAGE.includes(pathname) ? pathname : '/koleksi'
    router.push(q ? `${target}?q=${encodeURIComponent(q)}` : target)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <header className="dashboard-topbar" style={{
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Search — navigates to page, actual filtering is client-side */}
      {pathname !== '/profil' && (
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari judul, pengarang, atau ISBN..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: '#F8FAFC',
                color: '#1E293B',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1D2A8A'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(29,42,138,0.08)' }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </form>
      )}

      <div style={{ flex: 1 }} />

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
            <Link href="/profil" prefetch onClick={() => setShowProfile(false)} style={{
              display: 'block', padding: '9px 12px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.875rem', color: '#1E293B',
              fontWeight: 500,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >👤 Profil Saya</Link>
            <Link href="/riwayat" prefetch onClick={() => setShowProfile(false)} style={{
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
