'use client'

import { useEffect } from 'react'
import { Tablet, RefreshCw } from 'lucide-react'

export default function EbookError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Ebook Error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <Tablet size={56} color="#C4B5FD" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
        Gagal Memuat E-Book
      </h2>
      <p style={{ color: '#64748B', maxWidth: 400, marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Maaf, daftar e-book gagal ditarik dari sistem. Silakan coba muat ulang halaman ini.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: '#7C3AED', color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
        }}
      >
        <RefreshCw size={16} /> Coba Lagi
      </button>
    </div>
  )
}
