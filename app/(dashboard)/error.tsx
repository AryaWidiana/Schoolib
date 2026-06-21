'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error silently
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '20px' }}>
      <div style={{ background: '#FEF2F2', padding: 20, borderRadius: '50%', marginBottom: 20 }}>
        <AlertCircle size={48} color="#EF4444" />
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
        Kesalahan Tidak Terduga
      </h2>
      <p style={{ color: '#64748B', maxWidth: 400, marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
        Maaf, kami mengalami kendala teknis saat memuat data di halaman ini. Silakan coba lagi dalam beberapa saat.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 24px', background: '#1D2A8A', color: 'white',
          borderRadius: 8, border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s'
        }}
      >
        <RefreshCw size={16} /> Coba Muat Ulang
      </button>
    </div>
  )
}
