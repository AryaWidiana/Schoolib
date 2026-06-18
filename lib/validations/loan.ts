import { z } from 'zod'

export const createLoanSchema = z.object({
  book_id: z.string().uuid('ID buku tidak valid'),
  user_id: z.string().uuid('ID anggota tidak valid').optional(),
})

export const returnLoanSchema = z.object({
  loan_id: z.string().uuid('ID peminjaman tidak valid'),
  tanggal_kembali: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
})

export const extendLoanSchema = z.object({
  loan_id: z.string().uuid('ID peminjaman tidak valid'),
})

export const payFineSchema = z.object({
  user_id: z.string().uuid('ID anggota tidak valid'),
  amount: z.coerce.number().int().min(1000, 'Minimal pembayaran Rp 1.000'),
})

export type CreateLoanSchema = z.infer<typeof createLoanSchema>
export type ReturnLoanSchema = z.infer<typeof returnLoanSchema>
export type ExtendLoanSchema = z.infer<typeof extendLoanSchema>
export type PayFineSchema = z.infer<typeof payFineSchema>
