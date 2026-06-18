'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Home, TrendingUp, Tablet, Heart, Clock,
  GraduationCap, Library, Settings, LogOut
} from 'lucide-react'
import { logout } from '@/actions/auth'

const navItems = [
  { href: '/',         label: 'Beranda',  icon: Home },
  { href: '/koleksi',  label: 'Koleksi',  icon: Library },
  { href: '/populer',  label: 'Populer',  icon: TrendingUp },
  { href: '/ebook',    label: 'E-Book',   icon: Tablet },
  { href: '/favorit',  label: 'Favorit',  icon: Heart },
  { href: '/riwayat',  label: 'Riwayat',  icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="dashboard-sidebar" style={{
      background: 'white',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #1D2A8A 0%, #3B5BDB 100%)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1D2A8A', lineHeight: 1.2 }}>SchooLib</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>Online Library</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 10px' }}>
          Menu Utama
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    color: isActive ? '#1D2A8A' : '#64748B',
                    background: isActive ? '#DBEAFE' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F8FAFC'
                      e.currentTarget.style.color = '#1D2A8A'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#64748B'
                    }
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                  {isActive && (
                    <div style={{
                      marginLeft: 'auto',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: '#1D2A8A',
                    }} />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Divider */}
        <div style={{ margin: '16px 8px', height: 1, background: '#F1F5F9' }} />
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 10px' }}>
          Akun
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <li>
            <Link href="/profil" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
              fontWeight: 500, fontSize: '0.9rem', color: '#64748B', transition: 'all 0.15s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1D2A8A' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
            >
              <Settings size={18} strokeWidth={2} />
              Profil
            </Link>
          </li>
          <li>
            <form action={logout}>
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                fontWeight: 500, fontSize: '0.9rem', color: '#EF4444',
                background: 'transparent', border: 'none', cursor: 'pointer',
                width: '100%', transition: 'all 0.15s ease', fontFamily: 'inherit',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut size={18} strokeWidth={2} />
                Keluar
              </button>
            </form>
          </li>
        </ul>
      </nav>

      {/* Bottom library illustration */}
      <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{
          background: 'linear-gradient(135deg, #DBEAFE 0%, #EEF2FF 100%)',
          borderRadius: 12, padding: '14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <BookOpen size={20} color="#1D2A8A" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D2A8A' }}>Baca kapan saja</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Akses 20+ koleksi buku</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
