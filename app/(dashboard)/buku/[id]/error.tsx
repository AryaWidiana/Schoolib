'use client'

import { useEffect } from 'react'
import { BookX, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BookDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Book Detail Error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <BookX size={56} color="#94A3B8" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
        Buku Tidak Dapat Dimuat
      </h2>
      <p style={{ color: '#64748B', maxWidth: 400, marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Gagal memuat detail buku. Buku mungkin telah dihapus, URL tidak valid, atau sedang terjadi gangguan jaringan.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => reset()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: '#F1F5F9', color: '#475569',
            borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
          }}
        >
          <RefreshCw size={16} /> Coba Lagi
        </button>
        <Link href="/koleksi" style={{
          padding: '10px 20px', background: '#1D2A8A', color: 'white',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
        }}>
          Kembali ke Koleksi
        </Link>
      </div>
    </div>
  )
}
