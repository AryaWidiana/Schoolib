import { z } from 'zod'

export const bookSchema = z.object({
  judul: z.string().min(1, 'Judul tidak boleh kosong').max(255),
  pengarang: z.string().min(1, 'Pengarang tidak boleh kosong').max(255),
  isbn: z.string().min(10, 'ISBN minimal 10 karakter').max(20, 'ISBN maksimal 20 karakter'),
  penerbit: z.string().optional(),
  tahun_terbit: z.coerce.number().int().min(1900).max(2100).optional(),
  kategori: z.string().optional(),
  deskripsi: z.string().optional(),
  jumlah_eksemplar: z.coerce.number().int().min(0, 'Jumlah eksemplar tidak boleh negatif'),
  stok_tersedia: z.coerce.number().int().min(0, 'Stok tersedia tidak boleh negatif'),
  is_ebook: z.boolean().default(false),
  ebook_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
}).refine(
  (data) => data.stok_tersedia <= data.jumlah_eksemplar,
  { message: 'Stok tersedia tidak boleh melebihi jumlah eksemplar', path: ['stok_tersedia'] }
)

export type BookSchema = z.infer<typeof bookSchema>
