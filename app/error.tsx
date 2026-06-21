'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error caught:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 20, textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#EF4444', marginBottom: 10 }}>Terjadi Kesalahan Server</h2>
      <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 10, border: '1px solid #FCA5A5', maxWidth: 600, width: '100%', marginBottom: 20 }}>
        <p style={{ fontWeight: 'bold', color: '#991B1B', wordBreak: 'break-all' }}>{error.message || 'Unknown error'}</p>
        {error.stack && (
          <pre style={{ textAlign: 'left', fontSize: '0.8rem', color: '#7F1D1D', marginTop: 10, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {error.stack}
          </pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        style={{ padding: '10px 20px', background: '#1D2A8A', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}
      >
        Coba Lagi
      </button>
    </div>
  )
}
