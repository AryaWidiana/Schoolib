'use client'

import { useEffect } from 'react'
import { TrendingDown, RefreshCw } from 'lucide-react'

export default function PopulerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Populer Error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <TrendingDown size={56} color="#FCD34D" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
        Gagal Memuat Buku Populer
      </h2>
      <p style={{ color: '#64748B', maxWidth: 400, marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Terjadi gangguan saat mengambil data buku populer. Silakan coba muat ulang halaman ini.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: '#F59E0B', color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
        }}
      >
        <RefreshCw size={16} /> Coba Lagi
      </button>
    </div>
  )
}
