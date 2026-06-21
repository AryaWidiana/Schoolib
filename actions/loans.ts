'use server'

import { revalidatePath } from 'next/cache'
import { createLoanSchema, returnLoanSchema, extendLoanSchema } from '@/lib/validations/loan'
import { getTodayString } from '@/lib/utils'
import type { ActionResult, LoanFilterParams } from '@/types'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

async function updateOverdueLoans() {
  const today = new Date(getTodayString())
  await prisma.loan.updateMany({
    where: {
      status: 'dipinjam',
      tanggal_jatuh_tempo: { lt: today }
    },
    data: { status: 'terlambat' }
  })
}

// ── FR-P-4: Create Loan ──────────────────────────────────────
export async function createLoan(formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = {
    book_id: formData.get('book_id') as string,
    user_id: (formData.get('user_id') as string) || user.id,
  }

  const parsed = createLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  const { book_id, user_id } = parsed.data
  const targetUserId = user_id ?? user.id

  try {
    const loan = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { id: targetUserId } })
      if (!profile) throw new Error('Profil anggota tidak ditemukan.')

      // FR-P-4 Rule 3: Status anggota diblokir
      if (profile.status === 'diblokir') {
        throw new Error('Peminjaman ditolak: Akun anggota sedang diblokir karena memiliki denda.')
      }

      // FR-P-4 Rule 2: Memiliki denda > 0
      if (profile.total_denda > 0) {
        throw new Error(`Peminjaman ditolak: Anggota memiliki denda sebesar Rp ${profile.total_denda.toLocaleString('id-ID')}.`)
      }

      // FR-P-4 Rule 1: Maksimal 3 pinjaman aktif
      const activeCount = await tx.loan.count({
        where: {
          user_id: targetUserId,
          status: { in: ['dipinjam', 'terlambat'] }
        }
      })

      if (activeCount >= 3) {
        throw new Error('Peminjaman ditolak: Anggota sudah memiliki 3 pinjaman aktif.')
      }

      // FR-P-4 Rule 4: Stok buku = 0
      const book = await tx.book.findUnique({ where: { id: book_id } })
      if (!book) throw new Error('Buku tidak ditemukan.')
      if (book.stok_tersedia <= 0) {
        throw new Error('Peminjaman ditolak: Stok buku tidak tersedia.')
      }

      const today = new Date(getTodayString())
      const dueDate = new Date(today)
      dueDate.setDate(dueDate.getDate() + 7)

      // Decrease stock
      await tx.book.update({
        where: { id: book_id },
        data: { stok_tersedia: book.stok_tersedia - 1 }
      })

      // Create loan record
      const newLoan = await tx.loan.create({
        data: {
          user_id: targetUserId,
          book_id,
          tanggal_pinjam: today,
          tanggal_jatuh_tempo: dueDate,
          status: 'dipinjam',
        }
      })

      // Send notification
      await tx.notification.create({
        data: {
          user_id: targetUserId,
          title: 'Peminjaman Berhasil',
          message: `Buku "${book.judul}" berhasil dipinjam. Jatuh tempo: ${dueDate.toISOString().split('T')[0]}.`,
          type: 'success',
        }
      })

      return newLoan
    })

    revalidatePath('/riwayat')
    revalidatePath('/petugas/peminjaman')
    revalidatePath('/koleksi')
    return { success: true, message: `Peminjaman berhasil! Jatuh tempo: ${loan.tanggal_jatuh_tempo.toISOString().split('T')[0]}.` }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ── FR-P-5: Return Book ──────────────────────────────────────
export async function returnBook(formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = {
    loan_id: formData.get('loan_id') as string,
    tanggal_kembali: (formData.get('tanggal_kembali') as string) || getTodayString(),
  }

  const parsed = returnLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  const { loan_id, tanggal_kembali } = parsed.data

  try {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loan_id } })
      if (!loan) throw new Error('Peminjaman tidak ditemukan')
      if (loan.status === 'dikembalikan') throw new Error('Buku sudah dikembalikan')

      const returnDate = new Date(tanggal_kembali)
      const dueDate = new Date(loan.tanggal_jatuh_tempo)
      
      const diffTime = returnDate.getTime() - dueDate.getTime()
      let hari_telat = 0
      
      if (diffTime > 0) {
        hari_telat = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      const denda = hari_telat * 1000

      await tx.loan.update({
        where: { id: loan_id },
        data: {
          tanggal_kembali: returnDate,
          status: 'dikembalikan',
          hari_telat,
          denda
        }
      })

      await tx.book.update({
        where: { id: loan.book_id },
        data: { stok_tersedia: { increment: 1 } }
      })

      if (denda > 0) {
        await tx.profile.update({
          where: { id: loan.user_id },
          data: { total_denda: { increment: denda } }
        })
      }

      return { hari_telat, denda }
    })

    const { hari_telat, denda } = result

    let message = 'Pengembalian berhasil!'
    if (denda > 0) {
      message += ` Denda keterlambatan ${hari_telat} hari: Rp ${denda.toLocaleString('id-ID')}.`
    }

    revalidatePath('/riwayat')
    revalidatePath('/petugas/pengembalian')
    revalidatePath('/petugas/peminjaman')
    revalidatePath('/koleksi')
    return { success: true, message }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ── FR-P-6: Extend Loan ──────────────────────────────────────
export async function extendLoan(formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = { loan_id: formData.get('loan_id') as string }
  const parsed = extendLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  try {
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: parsed.data.loan_id } })
      if (!loan) throw new Error('Peminjaman tidak ditemukan.')
      if (loan.sudah_diperpanjang) throw new Error('Perpanjangan ditolak: Sudah pernah diperpanjang (maksimal 1 kali).')
      if (loan.status === 'terlambat') throw new Error('Perpanjangan ditolak: Peminjaman sudah terlambat.')
      if (loan.status === 'dikembalikan') throw new Error('Perpanjangan ditolak: Buku sudah dikembalikan.')

      const newDueDate = new Date(loan.tanggal_jatuh_tempo)
      newDueDate.setDate(newDueDate.getDate() + 7)

      await tx.loan.update({
        where: { id: parsed.data.loan_id },
        data: {
          tanggal_jatuh_tempo: newDueDate,
          sudah_diperpanjang: true
        }
      })
    })

    revalidatePath('/riwayat')
    revalidatePath('/petugas/peminjaman')
    return { success: true, message: 'Peminjaman berhasil diperpanjang +7 hari.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ── Get Loans (Anggota) ──────────────────────────────────────
export async function getMyLoans() {
  const user = await getUser()
  if (!user) return []

  // REMOVED updateOverdueLoans() from member read path! 
  // It should be handled by a cron job or only when petugas views loans to prevent blocking reads.

  const loans = await prisma.loan.findMany({
    where: { user_id: user.id },
    include: { 
      book: {
        select: {
          id: true,
          judul: true,
          pengarang: true,
          isbn: true,
          cover_url: true,
          is_ebook: true,
        }
      } 
    },
    orderBy: { created_at: 'desc' }
  })

  return loans as unknown as import('@/types').LoanWithBook[]
}

// ── Get All Loans (Petugas) ──────────────────────────────────
export async function getAllLoans(params: LoanFilterParams = {}) {
  const { status, user_id, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  // For petugas, it's okay to run this occasionally, though ideally moved to a cron.
  await updateOverdueLoans()

  const where: any = {}
  if (status) where.status = status
  if (user_id) where.user_id = user_id

  const loans = await prisma.loan.findMany({
    where,
    include: { 
      book: {
        select: { id: true, judul: true, isbn: true }
      }, 
      profile: {
        select: { id: true, full_name: true, nim: true }
      } 
    },
    orderBy: { created_at: 'desc' },
    skip: offset,
    take: limit,
  })

  return loans as unknown as import('@/types').LoanWithBookAndProfile[]
}

// ── Get Loan Stats ───────────────────────────────────────────
export async function getLoanStats() {
  await updateOverdueLoans()

  const [dipinjam, terlambat, dikembalikan] = await Promise.all([
    prisma.loan.count({ where: { status: 'dipinjam' } }),
    prisma.loan.count({ where: { status: 'terlambat' } }),
    prisma.loan.count({ where: { status: 'dikembalikan' } }),
  ])

  return {
    dipinjam,
    terlambat,
    dikembalikan,
  }
}
