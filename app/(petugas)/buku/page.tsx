import { getBooks } from '@/actions/books'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { DeleteBookButton } from './delete-button'

export default async function KelolaBukuPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const books = await getBooks({ query: q, limit: 100 })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Kelola Buku</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Manajemen katalog buku perpustakaan</p>
        </div>
        <Link href="/petugas/buku/tambah" className="schoolib-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <Plus size={16} /> Tambah Buku
        </Link>
      </div>

      <div className="schoolib-card" style={{ padding: 20 }}>
        <form method="GET" style={{ marginBottom: 20, maxWidth: 400 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              name="q" defaultValue={q}
              placeholder="Cari judul atau ISBN..."
              className="schoolib-input" style={{ paddingLeft: 36 }}
            />
          </div>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Judul & Pengarang</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ISBN / Kategori</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stok</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{b.judul}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.pengarang}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{b.isbn}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.kategori || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${b.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>
                      {b.stok_tersedia} / {b.jumlah_eksemplar}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/petugas/buku/${b.id}/edit`} style={{ padding: 6, background: '#EFF6FF', color: '#3B82F6', borderRadius: 6 }}>
                        <Edit size={16} />
                      </Link>
                      <DeleteBookButton id={b.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Tidak ada buku ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
