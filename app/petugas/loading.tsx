import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '60vh',
      width: '100%'
    }}>
      <Loader2 size={40} color="#1D2A8A" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
      <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.95rem' }}>Memuat halaman petugas...</p>
    </div>
  )
}
