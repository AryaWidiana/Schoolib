import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { redirect } from 'next/navigation'
import type { LoanWithBook } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) redirect('/login')

  // If petugas, redirect to petugas dashboard
  if (user.role === 'petugas') redirect('/petugas/dashboard')

  // Get active loans for right sidebar
  const activeLoans = await prisma.loan.findMany({
    where: {
      user_id: user.id,
      status: { in: ['dipinjam', 'terlambat'] }
    },
    include: { book: true },
    orderBy: { tanggal_jatuh_tempo: 'asc' }
  })

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar profile={user} />
      <main className="dashboard-main" style={{ padding: '24px' }}>
        {children}
      </main>
      <RightSidebar profile={user} activeLoans={(activeLoans as unknown as LoanWithBook[]) ?? []} />
    </div>
  )
}
