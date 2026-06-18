import { createClient } from '@/lib/supabase/server'
import { PetugasShell } from '@/components/layout/petugas-shell'
import { redirect } from 'next/navigation'

export default async function PetugasLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase.from('profiles').select('*').eq('id', user.id).single()) as any
  if (profile?.role !== 'petugas') redirect('/')

  return <PetugasShell profile={profile}>{children}</PetugasShell>
}
