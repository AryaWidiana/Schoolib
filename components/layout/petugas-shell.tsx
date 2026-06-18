'use client'

import { usePathname } from 'next/navigation'
import { PetugasSidebar } from '@/components/layout/petugas-sidebar'
import { Topbar } from '@/components/layout/topbar'
import type { Profile } from '@/types'

interface PetugasShellProps {
  children: React.ReactNode
  profile: Profile | null
}

export function PetugasShell({ children, profile }: PetugasShellProps) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <PetugasSidebar pathname={pathname} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar profile={profile} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
