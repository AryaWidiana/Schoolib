import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { FavoritClient } from './favorit-client'
import type { Book } from '@/types'

// force-dynamic: setelah API route memanggil revalidatePath('/favorit'),
// Next.js akan membuang cache RSC halaman ini. Dengan force-dynamic, kunjungan
// berikutnya ke /favorit SELALU meminta payload terbaru dari server — tidak
// pernah menyajikan HTML yang sudah kadaluarsa dari Router Cache.
export const dynamic = 'force-dynamic'

interface FavoritProps {
  searchParams: Promise<{ q?: string }>
}

export default async function FavoritPage({ searchParams }: FavoritProps) {
  const { q } = await searchParams
  const user = await getUser()
  if (!user) redirect('/login')

  let allBooks: Book[] = []

  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: user.id },
      include: {
        book: {
          select: {
            id: true,
            judul: true,
            pengarang: true,
            kategori: true,
            cover_url: true,
            is_ebook: true,
            stok_tersedia: true,
            jumlah_eksemplar: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
    allBooks = (favorites as unknown as { book: Book }[]).map(f => f.book).filter(Boolean)
  } catch {
    allBooks = []
  }

  // Filter di server berdasarkan query pencarian
  const filteredBooks = q && q.trim()
    ? allBooks.filter(book =>
        book.judul.toLowerCase().includes(q.toLowerCase()) ||
        book.pengarang.toLowerCase().includes(q.toLowerCase()) ||
        (book.kategori ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : allBooks

  return (
    <FavoritClient
      initialBooks={filteredBooks}
      totalCount={allBooks.length}
      searchQuery={q}
    />
  )
}
