'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createBook, updateBook } from '@/actions/books'
import type { Book } from '@/types'

export function BookForm({ initialData }: { initialData?: Book }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const [isEbook, setIsEbook] = useState(initialData?.is_ebook || false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = initialData
        ? await updateBook(initialData.id, fd)
        : await createBook(fd)

      if (result.success) {
        toast.success(result.message)
        router.push('/petugas/buku')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="schoolib-label" htmlFor="judul">Judul Buku *</label>
          <input className="schoolib-input" id="judul" name="judul" required defaultValue={initialData?.judul} />
        </div>
        <div>
          <label className="schoolib-label" htmlFor="pengarang">Pengarang *</label>
          <input className="schoolib-input" id="pengarang" name="pengarang" required defaultValue={initialData?.pengarang} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="schoolib-label" htmlFor="isbn">ISBN *</label>
          <input className="schoolib-input" id="isbn" name="isbn" required defaultValue={initialData?.isbn} />
        </div>
        <div>
          <label className="schoolib-label" htmlFor="kategori">Kategori</label>
          <input className="schoolib-input" id="kategori" name="kategori" defaultValue={initialData?.kategori || ''} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="schoolib-label" htmlFor="penerbit">Penerbit</label>
          <input className="schoolib-input" id="penerbit" name="penerbit" defaultValue={initialData?.penerbit || ''} />
        </div>
        <div>
          <label className="schoolib-label" htmlFor="tahun_terbit">Tahun Terbit</label>
          <input className="schoolib-input" id="tahun_terbit" name="tahun_terbit" type="number" defaultValue={initialData?.tahun_terbit || ''} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="schoolib-label" htmlFor="jumlah_eksemplar">Jumlah Eksemplar *</label>
          <input className="schoolib-input" id="jumlah_eksemplar" name="jumlah_eksemplar" type="number" min="0" required defaultValue={initialData?.jumlah_eksemplar ?? 1} />
        </div>
        <div>
          <label className="schoolib-label" htmlFor="stok_tersedia">Stok Tersedia *</label>
          <input className="schoolib-input" id="stok_tersedia" name="stok_tersedia" type="number" min="0" required defaultValue={initialData?.stok_tersedia ?? 1} />
        </div>
      </div>

      <div>
        <label className="schoolib-label" htmlFor="deskripsi">Deskripsi</label>
        <textarea className="schoolib-input" id="deskripsi" name="deskripsi" rows={4} defaultValue={initialData?.deskripsi || ''} />
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#F8FAFC', padding: 16, borderRadius: 10 }}>
        <input type="hidden" name="is_ebook" value={isEbook ? 'true' : 'false'} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          <input type="checkbox" checked={isEbook} onChange={(e) => setIsEbook(e.target.checked)} style={{ width: 16, height: 16 }} />
          Buku ini adalah E-Book
        </label>
        {isEbook && (
          <input className="schoolib-input" id="ebook_url" name="ebook_url" type="url" placeholder="URL E-Book" defaultValue={initialData?.ebook_url || ''} style={{ flex: 1 }} required />
        )}
      </div>

      <button type="submit" disabled={pending} className="schoolib-btn-primary" style={{ padding: 12, marginTop: 10 }}>
        {pending ? <span style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><Loader2 size={18} className="animate-spin" /> Menyimpan...</span> : 'Simpan Buku'}
      </button>
    </form>
  )
}
