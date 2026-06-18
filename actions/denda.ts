'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/types'

// Pay / clear fine for a member
export async function payFine(userId: string, amount: number): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any
  if (profile?.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const { data: member } = (await supabase.from('profiles').select('total_denda').eq('id', userId).single()) as any
  if (!member) return { success: false, message: 'Anggota tidak ditemukan.' }

  if (amount > member.total_denda) {
    return { success: false, message: `Jumlah pembayaran melebihi total denda (Rp ${member.total_denda.toLocaleString('id-ID')}).` }
  }

  const newTotal = member.total_denda - amount
  const { error } = await (supabase.from('profiles') as any)
    .update({ total_denda: newTotal })
    .eq('id', userId)

  if (error) return { success: false, message: error.message }

  // Add notification to member
  await (supabase.from('notifications') as any).insert({
    user_id: userId,
    title: 'Pembayaran Denda',
    message: `Denda sebesar Rp ${amount.toLocaleString('id-ID')} telah dibayar. Sisa denda: Rp ${newTotal.toLocaleString('id-ID')}.`,
    type: 'success',
  })

  revalidatePath('/petugas/denda')
  revalidatePath('/petugas/anggota')

  return {
    success: true,
    message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} berhasil. Sisa denda: Rp ${newTotal.toLocaleString('id-ID')}.`,
  }
}

// Get all members with fines (petugas)
export async function getMembersWithFines(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'anggota')
    .gt('total_denda', 0)
    .order('total_denda', { ascending: false })

  if (error) return []
  return data ?? []
}

// Get all members (petugas)
export async function getAllMembers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'anggota')
    .order('full_name', { ascending: true })

  if (error) return []
  return data ?? []
}

// Block / unblock member (petugas)
export async function toggleMemberStatus(userId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  const { data: requestor } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any
  if (requestor?.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const { data: member } = (await supabase.from('profiles').select('status, total_denda').eq('id', userId).single()) as any
  if (!member) return { success: false, message: 'Anggota tidak ditemukan.' }

  // FR-P-7: Diblokir → Aktif hanya jika total_denda = 0
  if (member.status === 'diblokir') {
    if (member.total_denda > 0) {
      return { success: false, message: 'Anggota tidak dapat diaktifkan karena masih memiliki denda.' }
    }
    await (supabase.from('profiles') as any).update({ status: 'aktif' }).eq('id', userId)
    revalidatePath('/petugas/anggota')
    return { success: true, message: 'Status anggota berhasil diaktifkan.' }
  } else {
    await (supabase.from('profiles') as any).update({ status: 'diblokir' }).eq('id', userId)
    revalidatePath('/petugas/anggota')
    return { success: true, message: 'Status anggota berhasil diblokir.' }
  }
}

// Get dashboard stats (petugas)
export async function getDashboardStats() {
  const supabase = await createClient()

  const [books, members, activeLoans, overdueLoans, fines] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'anggota'),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'dipinjam'),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'terlambat'),
    supabase.from('profiles').select('total_denda').eq('role', 'anggota'),
  ])

  const totalFines = (fines.data ?? []).reduce((sum, p: any) => sum + p.total_denda, 0)

  return {
    totalBooks: books.count ?? 0,
    totalMembers: members.count ?? 0,
    activeLoans: activeLoans.count ?? 0,
    overdueLoans: overdueLoans.count ?? 0,
    totalFines,
  }
}

// Mark notification as read
export async function markNotificationRead(notifId: string): Promise<void> {
  const supabase = await createClient()
  await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', notifId)
  revalidatePath('/', 'layout')
}
