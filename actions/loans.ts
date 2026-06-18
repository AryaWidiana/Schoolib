'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createLoanSchema, returnLoanSchema, extendLoanSchema } from '@/lib/validations/loan'
import { getTodayString } from '@/lib/utils'
import type { ActionResult, Loan, LoanWithBook, LoanWithBookAndProfile, LoanFilterParams } from '@/types'

// ── FR-P-4: Create Loan ──────────────────────────────────────
export async function createLoan(formData: FormData): Promise<ActionResult<Loan>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = {
    book_id: formData.get('book_id') as string,
    user_id: (formData.get('user_id') as string) || user.id,
  }

  const parsed = createLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  const { book_id, user_id } = parsed.data
  const targetUserId = user_id ?? user.id

  // Get member profile
  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()) as any

  if (!profile) return { success: false, message: 'Profil anggota tidak ditemukan.' }

  // FR-P-4 Rule 3: Status anggota diblokir
  if (profile.status === 'diblokir') {
    return { success: false, message: 'Peminjaman ditolak: Akun anggota sedang diblokir karena memiliki denda.' }
  }

  // FR-P-4 Rule 2: Memiliki denda > 0
  if (profile.total_denda > 0) {
    return { success: false, message: `Peminjaman ditolak: Anggota memiliki denda sebesar Rp ${profile.total_denda.toLocaleString('id-ID')}.` }
  }

  // FR-P-4 Rule 1: Maksimal 3 pinjaman aktif
  const { count: activeCount } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetUserId)
    .in('status', ['dipinjam', 'terlambat'])

  if ((activeCount ?? 0) >= 3) {
    return { success: false, message: 'Peminjaman ditolak: Anggota sudah memiliki 3 pinjaman aktif.' }
  }

  // FR-P-4 Rule 4: Stok buku = 0
  const { data: book } = (await supabase.from('books').select('*').eq('id', book_id).single()) as any
  if (!book) return { success: false, message: 'Buku tidak ditemukan.' }
  if (book.stok_tersedia <= 0) {
    return { success: false, message: 'Peminjaman ditolak: Stok buku tidak tersedia.' }
  }

  // Create loan record
  const today = getTodayString()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + 7)
  const dueDateStr = dueDate.toISOString().split('T')[0]

  const { data: loan, error: loanError } = await (supabase.from('loans') as any)
    .insert({
      user_id: targetUserId,
      book_id,
      tanggal_pinjam: today,
      tanggal_jatuh_tempo: dueDateStr,
      status: 'dipinjam',
    })
    .select()
    .single()

  if (loanError) return { success: false, message: loanError.message }

  // Decrease stock
  await (supabase.from('books') as any)
    .update({ stok_tersedia: book.stok_tersedia - 1 })
    .eq('id', book_id)

  // Send notification
  await (supabase.from('notifications') as any).insert({
    user_id: targetUserId,
    title: 'Peminjaman Berhasil',
    message: `Buku "${book.judul}" berhasil dipinjam. Jatuh tempo: ${dueDateStr}.`,
    type: 'success',
  })

  revalidatePath('/riwayat')
  revalidatePath('/petugas/peminjaman')
  revalidatePath('/koleksi')
  return { success: true, message: `Peminjaman berhasil! Jatuh tempo: ${dueDateStr}.`, data: loan }
}

// ── FR-P-5: Return Book ──────────────────────────────────────
export async function returnBook(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = {
    loan_id: formData.get('loan_id') as string,
    tanggal_kembali: (formData.get('tanggal_kembali') as string) || getTodayString(),
  }

  const parsed = returnLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  const { loan_id, tanggal_kembali } = parsed.data

  const { data: result, error } = await (supabase.rpc as any)('process_book_return', {
    p_loan_id: loan_id,
    p_tanggal_kembali: tanggal_kembali,
  })

  if (error) return { success: false, message: error.message }

  const { hari_telat, denda } = result as { hari_telat: number; denda: number }

  let message = 'Pengembalian berhasil!'
  if (denda > 0) {
    message += ` Denda keterlambatan ${hari_telat} hari: Rp ${denda.toLocaleString('id-ID')}.`
  }

  revalidatePath('/riwayat')
  revalidatePath('/petugas/pengembalian')
  revalidatePath('/petugas/peminjaman')
  revalidatePath('/koleksi')
  return { success: true, message }
}

// ── FR-P-6: Extend Loan ──────────────────────────────────────
export async function extendLoan(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const raw = { loan_id: formData.get('loan_id') as string }
  const parsed = extendLoanSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  // Also check from application layer (belt-and-suspenders)
  const { data: loan } = (await supabase.from('loans').select('*').eq('id', parsed.data.loan_id).single()) as any
  if (!loan) return { success: false, message: 'Peminjaman tidak ditemukan.' }
  if (loan.sudah_diperpanjang) return { success: false, message: 'Perpanjangan ditolak: Sudah pernah diperpanjang (maksimal 1 kali).' }
  if (loan.status === 'terlambat') return { success: false, message: 'Perpanjangan ditolak: Peminjaman sudah terlambat.' }
  if (loan.status === 'dikembalikan') return { success: false, message: 'Perpanjangan ditolak: Buku sudah dikembalikan.' }

  const { error } = await (supabase.rpc as any)('extend_loan', { p_loan_id: parsed.data.loan_id })
  if (error) return { success: false, message: error.message }

  revalidatePath('/riwayat')
  revalidatePath('/petugas/peminjaman')
  return { success: true, message: 'Peminjaman berhasil diperpanjang +7 hari.' }
}

// ── Get Loans (Anggota) ──────────────────────────────────────
export async function getMyLoans(): Promise<LoanWithBook[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Update overdue loans first
  await (supabase.rpc as any)('update_overdue_loans')

  const { data, error } = await supabase
    .from('loans')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as LoanWithBook[]) ?? []
}

// ── Get All Loans (Petugas) ──────────────────────────────────
export async function getAllLoans(params: LoanFilterParams = {}): Promise<LoanWithBookAndProfile[]> {
  const supabase = await createClient()
  const { status, user_id, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  // Update overdue
  await (supabase.rpc as any)('update_overdue_loans')

  let q = supabase
    .from('loans')
    .select('*, books(*), profiles(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) q = q.eq('status', status)
  if (user_id) q = q.eq('user_id', user_id)

  const { data, error } = await q
  if (error) return []
  return (data as LoanWithBookAndProfile[]) ?? []
}

// ── Get Loan Stats ───────────────────────────────────────────
export async function getLoanStats() {
  const supabase = await createClient()
  await (supabase.rpc as any)('update_overdue_loans')

  const [dipinjam, terlambat, dikembalikan] = await Promise.all([
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'dipinjam'),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'terlambat'),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'dikembalikan'),
  ])

  return {
    dipinjam: dipinjam.count ?? 0,
    terlambat: terlambat.count ?? 0,
    dikembalikan: dikembalikan.count ?? 0,
  }
}
