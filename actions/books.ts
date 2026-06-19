'use server'

import { revalidatePath } from 'next/cache'
import { bookSchema } from '@/lib/validations/book'
import type { ActionResult, BookSearchParams } from '@/types'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function getBooks(params: BookSearchParams = {}) {
  const { query, kategori, is_ebook, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  const where: any = {}
  
  if (query) {
    where.OR = [
      { judul: { contains: query } },
      { pengarang: { contains: query } },
      { isbn: { contains: query } },
    ]
  }

  if (kategori) {
    where.kategori = kategori
  }

  if (is_ebook !== undefined) {
    where.is_ebook = is_ebook
  }

  const books = await prisma.book.findMany({
    where,
    orderBy: { created_at: 'desc' },
    skip: offset,
    take: limit,
  })

  return books
}

export async function getBookById(id: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
    })
    return book
  } catch (error) {
    return null
  }
}

export async function createBook(formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  if (user.role !== 'petugas') return { success: false, message: 'Akses ditolak. Hanya petugas.' }

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

  const existing = await prisma.book.findUnique({ where: { isbn: parsed.data.isbn } })
  if (existing) return { success: false, message: 'ISBN sudah terdaftar dalam sistem.' }

  try {
    const book = await prisma.book.create({
      data: parsed.data,
    })

    revalidatePath('/petugas/buku')
    revalidatePath('/koleksi')
    return { success: true, message: 'Buku berhasil ditambahkan.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateBook(id: string, formData: FormData): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  if (user.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

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

  const existing = await prisma.book.findFirst({
    where: { isbn: parsed.data.isbn, id: { not: id } }
  })
  if (existing) return { success: false, message: 'ISBN sudah digunakan buku lain.' }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: parsed.data,
    })

    revalidatePath('/petugas/buku')
    revalidatePath(`/buku/${id}`)
    revalidatePath('/koleksi')
    return { success: true, message: 'Buku berhasil diperbarui.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteBook(id: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }
  if (user.role !== 'petugas') return { success: false, message: 'Akses ditolak.' }

  const activeLoans = await prisma.loan.findFirst({
    where: {
      book_id: id,
      status: { in: ['dipinjam', 'terlambat'] }
    }
  })

  if (activeLoans) {
    return { success: false, message: 'Tidak dapat menghapus buku yang sedang dipinjam.' }
  }

  try {
    await prisma.book.delete({ where: { id } })
    revalidatePath('/petugas/buku')
    revalidatePath('/koleksi')
    return { success: true, message: 'Buku berhasil dihapus.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function toggleFavorite(bookId: string): Promise<ActionResult> {
  const user = await getUser()
  if (!user) return { success: false, message: 'Tidak terautentikasi.' }

  const existing = await prisma.favorite.findUnique({
    where: {
      user_id_book_id: { user_id: user.id, book_id: bookId }
    }
  })

  try {
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      revalidatePath('/favorit')
      return { success: true, message: 'Dihapus dari favorit.' }
    } else {
      await prisma.favorite.create({
        data: { user_id: user.id, book_id: bookId }
      })
      revalidatePath('/favorit')
      return { success: true, message: 'Ditambahkan ke favorit.' }
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getCategories(): Promise<string[]> {
  const books = await prisma.book.findMany({
    select: { kategori: true },
    where: { kategori: { not: null } }
  })
  
  const cats = [...new Set(books.map(b => b.kategori as string))]
  return cats.sort()
}
