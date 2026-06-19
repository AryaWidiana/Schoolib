import Link from 'next/link'
import { BookOpen, Users, BarChart2, LogOut, Home, BookMarked, ArrowLeftRight, AlertCircle, GraduationCap } from 'lucide-react'
import { logout } from '@/actions/auth'

const navItems = [
  { href: '/petugas/dashboard',     label: 'Dashboard',       icon: Home },
  { href: '/petugas/buku',          label: 'Kelola Buku',     icon: BookOpen },
  { href: '/petugas/peminjaman',    label: 'Peminjaman',      icon: BookMarked },
  { href: '/petugas/pengembalian',  label: 'Pengembalian',    icon: ArrowLeftRight },
  { href: '/petugas/denda',         label: 'Kelola Denda',    icon: AlertCircle },
  { href: '/petugas/anggota',       label: 'Data Anggota',    icon: Users },
]

export function PetugasSidebar({ pathname }: { pathname: string }) {
  return (
    <aside style={{
      width: 250, background: 'white', borderRight: '1px solid #E2E8F0',
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #1D2A8A 0%, #3B5BDB 100%)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1D2A8A' }}>SchooLib</div>
            <div style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 700 }}>Panel Petugas</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 10px' }}>
          Manajemen
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/petugas/dashboard' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
                  color: isActive ? '#1D2A8A' : '#64748B',
                  background: isActive ? '#DBEAFE' : 'transparent',
                  transition: 'all 0.15s ease',
                }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div style={{ margin: '16px 8px', height: 1, background: '#F1F5F9' }} />
        <Link href="/qa-testing" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
          fontWeight: 500, fontSize: '0.875rem', color: '#7C3AED',
          background: pathname === '/qa-testing' ? '#F3E8FF' : 'transparent',
        }}>
          <BarChart2 size={18} strokeWidth={2} />
          QA Testing
        </Link>
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid #F1F5F9' }}>
        <form action={logout}>
          <button type="submit" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            fontWeight: 500, fontSize: '0.875rem', color: '#EF4444',
            background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit',
          }}>
            <LogOut size={18} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
