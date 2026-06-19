import { getUser } from '@/lib/auth'
import { PetugasShell } from '@/components/layout/petugas-shell'
import { redirect } from 'next/navigation'

export default async function PetugasLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUser()
  if (!profile) redirect('/api/auth/clear-session')

  if (profile.role !== 'petugas') redirect('/')

  return <PetugasShell profile={profile}>{children}</PetugasShell>
}
