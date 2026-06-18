import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { redirect } from 'next/navigation'
import type { LoanWithBook } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase.from('profiles').select('*').eq('id', user.id).single()) as any

  // If petugas, redirect to petugas dashboard
  if (profile?.role === 'petugas') redirect('/petugas/dashboard')

  // Get active loans for right sidebar
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .in('status', ['dipinjam', 'terlambat'])
    .order('tanggal_jatuh_tempo', { ascending: true })

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar profile={profile} />
      <main className="dashboard-main" style={{ padding: '24px' }}>
        {children}
      </main>
      <RightSidebar profile={profile} activeLoans={(activeLoans as LoanWithBook[]) ?? []} />
    </div>
  )
}
