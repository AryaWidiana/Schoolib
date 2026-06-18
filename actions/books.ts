'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookSchema } from '@/lib/validations/book'
import type { ActionResult, Book, BookSearchParams } from '@/types'

export async function getBooks(params: BookSearchParams = {}): Promise<Book[]> {
  const supabase = await createClient()
  const { query, kategori, is_ebook, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  let q = supabase.from('books').select('*').order('created_at', { ascending: false })

  if (query) {
    q = q.or(`judul.ilike.%${query}%,pengarang.ilike.%${query}%,isbn.ilike.%${query}%`)
  }
  if (kategori) q = q.eq('kategori', kategori)
  if (is_ebook !== undefined) q = q.eq('is_ebook', is_ebook)

  q = q.range(offset, offset + limit - 1)
  const { data, error } = await q

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function createBook(formData: FormData): Promise<ActionResult<Book>> {
  const supabase = await createClient()

  // Check petugas role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any
  if (profile?.role !== 'petugas') return { success: false, message: 'Akses ditolak. Hanya petugas.' }

  const raw = {
    judul: formData.get('judul') as string,
    pengarang: formData.get('pengarang') as string,
    isbn: formData.get('isbn') as string,
    penerbit: formData.get('penerbit') as string || undefined,
    tahun_terbit: formData.get('tahun_terbit') ? Number(formData.get('tahun_terbit')) : undefined,
    kategori: formData.get('kategori') as string || undefined,
    deskripsi: formData.get('deskripsi') as string || undefined,
    jumlah_eksemplar: Number(formData.get('jumlah_eksemplar')),
    stok_tersedia: Number(formData.get('stok_tersedia')),
    is_ebook: formData.get('is_ebook') === 'true',
    ebook_url: formData.get('ebook_url') as string || undefined,
  }

  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  // Check unique ISBN
  const { data: existing } = await supabase.from('books').select('id').eq('isbn', parsed.data.isbn).single()
  if (existing) return { success: false, message: 'ISBN sudah terdaftar dalam sistem.' }

  const { data, error } = await (supabase.from('books') as any).insert(parsed.data).select().single()
  if (error) return { success: false, message: error.message }

  revalidatePath('/petugas/buku')
  revalidatePath('/koleksi')
  return { success: true, message: 'Buku berhasil ditambahkan.', data }
}

export async function updateBook(id: string, formData: FormData): Promise<ActionResult<Book>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any
  if (profile?.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const raw = {
    judul: formData.get('judul') as string,
    pengarang: formData.get('pengarang') as string,
    isbn: formData.get('isbn') as string,
    penerbit: formData.get('penerbit') as string || undefined,
    tahun_terbit: formData.get('tahun_terbit') ? Number(formData.get('tahun_terbit')) : undefined,
    kategori: formData.get('kategori') as string || undefined,
    deskripsi: formData.get('deskripsi') as string || undefined,
    jumlah_eksemplar: Number(formData.get('jumlah_eksemplar')),
    stok_tersedia: Number(formData.get('stok_tersedia')),
    is_ebook: formData.get('is_ebook') === 'true',
    ebook_url: formData.get('ebook_url') as string || undefined,
  }

  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

  // Check ISBN uniqueness (excluding current book)
  const { data: existing } = await supabase.from('books').select('id').eq('isbn', parsed.data.isbn).neq('id', id).single()
  if (existing) return { success: false, message: 'ISBN sudah digunakan buku lain.' }

  const { data, error } = await (supabase.from('books') as any).update(parsed.data).eq('id', id).select().single()
  if (error) return { success: false, message: error.message }

  revalidatePath('/petugas/buku')
  revalidatePath(`/buku/${id}`)
  revalidatePath('/koleksi')
  return { success: true, message: 'Buku berhasil diperbarui.', data }
}

export async function deleteBook(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any
  if (profile?.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  // Check if book has active loans
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('id')
    .eq('book_id', id)
    .in('status', ['dipinjam', 'terlambat'])
    .limit(1)

  if (activeLoans && activeLoans.length > 0) {
    return { success: false, message: 'Tidak dapat menghapus buku yang sedang dipinjam.' }
  }

  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  revalidatePath('/petugas/buku')
  revalidatePath('/koleksi')
  return { success: true, message: 'Buku berhasil dihapus.' }
}

export async function toggleFavorite(bookId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const { data: existing } = (await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()) as any

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    revalidatePath('/favorit')
    return { success: true, message: 'Dihapus dari favorit.' }
  } else {
    await (supabase.from('favorites') as any).insert({ user_id: user.id, book_id: bookId })
    revalidatePath('/favorit')
    return { success: true, message: 'Ditambahkan ke favorit.' }
  }
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('books').select('kategori').not('kategori', 'is', null)
  const cats = [...new Set((data ?? []).map((b: any) => b.kategori as string))]
  return cats.sort()
}
