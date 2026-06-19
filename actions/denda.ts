'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import type { ActionResult, Profile } from '@/types'

// Pay / clear fine for a member
export async function payFine(userId: string, amount: number): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  if (user.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const member = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true, total_denda: true }
  })

  if (!member) return { success: false, message: 'Anggota tidak ditemukan.' }

  if (amount > member.total_denda) {
    return { success: false, message: `Jumlah pembayaran melebihi total denda (Rp ${member.total_denda.toLocaleString('id-ID')}).` }
  }

  const newTotal = member.total_denda - amount

  try {
    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: userId },
        data: { 
          total_denda: newTotal,
          status: newTotal === 0 ? 'aktif' : undefined // Auto-aktif if fines cleared
        }
      })

      await tx.notification.create({
        data: {
          user_id: userId,
          title: 'Pembayaran Denda',
          message: `Denda sebesar Rp ${amount.toLocaleString('id-ID')} telah dibayar. Sisa denda: Rp ${newTotal.toLocaleString('id-ID')}.`,
          type: 'success',
        }
      })
    })

    revalidatePath('/petugas/denda')
    revalidatePath('/petugas/anggota')

    return {
      success: true,
      message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} berhasil. Sisa denda: Rp ${newTotal.toLocaleString('id-ID')}.`,
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Get all members with fines (petugas)
export async function getMembersWithFines() {
  const members = await prisma.profile.findMany({
    where: {
      role: 'anggota',
      total_denda: { gt: 0 }
    },
    orderBy: { total_denda: 'desc' }
  })

  return members
}

// Get all members (petugas)
export async function getAllMembers() {
  const members = await prisma.profile.findMany({
    where: { role: 'anggota' },
    orderBy: { full_name: 'asc' }
  })

  return members
}

// Block / unblock member (petugas)
export async function toggleMemberStatus(userId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  if (user.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const member = await prisma.profile.findUnique({
    where: { id: userId },
    select: { status: true, total_denda: true }
  })

  if (!member) return { success: false, message: 'Anggota tidak ditemukan.' }

  // FR-P-7: Diblokir → Aktif hanya jika total_denda = 0
  if (member.status === 'diblokir') {
    if (member.total_denda > 0) {
      return { success: false, message: 'Anggota tidak dapat diaktifkan karena masih memiliki denda.' }
    }
    await prisma.profile.update({ where: { id: userId }, data: { status: 'aktif' } })
    revalidatePath('/petugas/anggota')
    return { success: true, message: 'Status anggota berhasil diaktifkan.' }
  } else {
    await prisma.profile.update({ where: { id: userId }, data: { status: 'diblokir' } })
    revalidatePath('/petugas/anggota')
    return { success: true, message: 'Status anggota berhasil diblokir.' }
  }
}

// Get dashboard stats (petugas)
export async function getDashboardStats() {
  const [totalBooks, totalMembers, activeLoans, overdueLoans, finesAgg] = await Promise.all([
    prisma.book.count(),
    prisma.profile.count({ where: { role: 'anggota' } }),
    prisma.loan.count({ where: { status: 'dipinjam' } }),
    prisma.loan.count({ where: { status: 'terlambat' } }),
    prisma.profile.aggregate({
      where: { role: 'anggota', total_denda: { gt: 0 } },
      _sum: { total_denda: true }
    })
  ])

  const totalFines = finesAgg._sum.total_denda || 0

  return {
    totalBooks,
    totalMembers,
    activeLoans,
    overdueLoans,
    totalFines,
  }
}

// Mark notification as read
export async function markNotificationRead(notifId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notifId },
    data: { is_read: true }
  })
  revalidatePath('/', 'layout')
}
