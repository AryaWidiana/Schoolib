import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { BookOpen, ArrowLeft, Calendar, Tag, Hash, Building, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { BorrowButton } from './borrow-button'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await params properly per Next.js 15 rules
  const { id } = await params
  const user = await getUser()

  let book = null
  let activeLoan = null
  let favorite = null

  // 2. Defensive Programming: try-catch untuk mencegah crash jika ID bukan UUID valid
  try {
    // Jalankan query secara paralel dengan aman
    const [fetchedBook, fetchedLoan, fetchedFavorite] = await Promise.all([
      prisma.book.findUnique({ where: { id } }),
      
      // Jika user null (guest), kembalikan null tanpa melakukan query
      user ? prisma.loan.findFirst({
        where: {
          user_id: user.id,
          book_id: id,
          status: { in: ['dipinjam', 'terlambat'] }
        }
      }) : Promise.resolve(null),
      
      user ? prisma.favorite.findUnique({
        where: {
          user_id_book_id: { user_id: user.id, book_id: id }
        }
      }) : Promise.resolve(null)
    ])

    book = fetchedBook
    activeLoan = fetchedLoan
    favorite = fetchedFavorite
  } catch (error) {
    // Tangkap error Prisma (misal: format UUID tidak valid)
    // dan biarkan jatuh ke pengecekan notFound() di bawah
    book = null
  }

  // 3. Null Checking Ketat: Jika buku tidak ada di database, tampilkan 404
  if (!book) {
    return notFound()
  }

  const alreadyBorrowed = !!activeLoan
  const isFavorited = !!favorite
  const profile = user

  return (
    <div>
      <Link href="/koleksi" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 20, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Kembali ke Koleksi
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Cover */}
        <div>
          <div style={{
            aspectRatio: '2/3', borderRadius: 14,
            background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 20, boxShadow: '0 8px 32px rgba(29,42,138,0.25)',
          }}>
            <BookOpen size={48} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.3 }}>
              {book.judul}
            </div>
          </div>
          {book.is_ebook && book.ebook_url && (
            <a href={book.ebook_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 10, padding: '10px', borderRadius: 10,
              background: '#7C3AED', color: 'white', textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: 700,
            }}>
              <ExternalLink size={14} /> Baca E-Book
            </a>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {book.kategori && <span className="badge badge-blue">{book.kategori}</span>}
            {book.is_ebook && <span className="badge badge-purple">E-Book</span>}
            <span className={`badge ${book.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>
              {book.stok_tersedia > 0 ? `${book.stok_tersedia} tersedia` : 'Habis'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2, marginBottom: 6 }}>{book.judul}</h1>
          <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: 20 }}>oleh {book.pengarang}</p>

          {book.deskripsi && (
            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', marginBottom: 20, lineHeight: 1.6, fontSize: '0.875rem', color: '#475569' }}>
              {book.deskripsi}
            </div>
          )}

          {/* Book details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { icon: Hash, label: 'ISBN', value: book.isbn },
              { icon: Building, label: 'Penerbit', value: book.penerbit || '-' },
              { icon: Calendar, label: 'Tahun Terbit', value: book.tahun_terbit?.toString() || '-' },
              { icon: Tag, label: 'Jumlah Eksemplar', value: book.jumlah_eksemplar.toString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Icon size={12} color="#94A3B8" />
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!book.is_ebook && (
            <BorrowButton
              book={book}
              profile={profile}
              alreadyBorrowed={alreadyBorrowed}
              isFavorited={isFavorited}
            />
          )}
        </div>
      </div>
    </div>
  )
}
