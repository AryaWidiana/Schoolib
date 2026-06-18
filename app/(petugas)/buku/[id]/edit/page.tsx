import { getBookById } from '@/actions/books'
import { BookForm } from '../../form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditBukuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getBookById(id)
  if (!book) notFound()

  return (
    <div>
      <Link href="/petugas/buku" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 20, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Edit Buku</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Perbarui informasi buku</p>
      </div>
      <div className="schoolib-card" style={{ padding: 24 }}>
        <BookForm initialData={book} />
      </div>
    </div>
  )
}
