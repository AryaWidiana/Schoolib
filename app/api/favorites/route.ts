import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/session'

// Lean favorite toggle endpoint.
//
// Why an API Route instead of a Server Action?
// - Server Actions go through Next.js serialization machinery AND block React's
//   transition system even when not awaited by the caller.
// - This plain fetch() call is fully fire-and-forget: the browser sends the
//   request and moves on with zero UI thread involvement.
//
// Why no getUser() here?
// - getUser() does: decrypt(JWT) → prisma.profile.findUnique()
//   That is 2 sequential async steps (crypto + DB) before we even touch favorites.
// - We only need the userId, which is already embedded in the JWT cookie.
//   We decrypt in-process (nanoseconds, pure CPU) and skip the DB profile lookup
//   entirely. This cuts the server-side latency roughly in half.

export async function POST(req: NextRequest) {
  try {
    // 1. Verify session from cookie — pure in-memory JWT decrypt, zero DB calls
    const cookie = req.cookies.get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi.' }, { status: 401 })
    }

    const { bookId } = await req.json()
    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json({ success: false, message: 'bookId tidak valid.' }, { status: 400 })
    }

    const userId = session.userId

    // 2. Single-query: use Prisma's upsert pattern backed by the @@unique([user_id, book_id])
    //    constraint to avoid a separate findUnique() round-trip.
    //    We first try to delete. If the record doesn't exist, Prisma returns null safely
    //    via deleteMany (no throw), and we know we need to insert.
    const deleted = await prisma.favorite.deleteMany({
      where: { user_id: userId, book_id: bookId },
    })

    if (deleted.count === 0) {
      // Was not favorited → insert
      await prisma.favorite.create({
        data: { user_id: userId, book_id: bookId },
        select: { id: true }, // return minimum payload
      })
      return NextResponse.json({ success: true, action: 'added', message: 'Ditambahkan ke favorit.' })
    }

    // Was favorited → already deleted above
    return NextResponse.json({ success: true, action: 'removed', message: 'Dihapus dari favorit.' })
  } catch (error: unknown) {
    let errorMessage = 'Terjadi kesalahan server.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    console.error('[POST /api/favorites] Error:', errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
