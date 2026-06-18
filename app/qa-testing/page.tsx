import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function QATestingPage() {
  const requirements = [
    { fr: 'FR-P-1', desc: 'Auth & Authorization (Role: Anggota, Petugas)', status: 'implemented' },
    { fr: 'FR-P-2', desc: 'Manajemen Buku (CRUD oleh Petugas)', status: 'implemented' },
    { fr: 'FR-P-3', desc: 'Pencarian Katalog (Judul, Pengarang, ISBN)', status: 'implemented' },
    { fr: 'FR-P-4', desc: 'Peminjaman (Max 3, no denda, akun aktif, stok > 0)', status: 'implemented' },
    { fr: 'FR-P-5', desc: 'Pengembalian & Denda (Telat * 1000, Stok +1)', status: 'implemented' },
    { fr: 'FR-P-6', desc: 'Perpanjangan (+7 Hari, Max 1x, tidak boleh telat)', status: 'implemented' },
    { fr: 'FR-P-7', desc: 'State Transition Buku (Tersedia ↔ Dipinjam → Terlambat ↔ Tersedia)', status: 'implemented' },
    { fr: 'FR-P-7', desc: 'State Transition Anggota (Aktif ↔ Diblokir jika denda > 0)', status: 'implemented' },
    { fr: 'FR-P-8', desc: 'Riwayat (Dashboard Stats & History views)', status: 'implemented' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 24, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1D2A8A', marginBottom: 8 }}>QA Testing Support</h1>
          <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.5 }}>
            Halaman ini disediakan khusus untuk tim QA melakukan verifikasi fungsionalitas dan business rules aplikasi SchooLib.
          </p>
        </div>

        {/* Credentials */}
        <div className="schoolib-card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)', color: 'white' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Test Credentials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, marginBottom: 8 }}>ROLE: PETUGAS</div>
              <div style={{ fontWeight: 600 }}>petugas@schoolib.ac.id</div>
              <div style={{ fontFamily: 'monospace', opacity: 0.9 }}>Petugas123!</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, marginBottom: 8 }}>ROLE: ANGGOTA</div>
              <div style={{ fontWeight: 600 }}>budi@schoolib.ac.id</div>
              <div style={{ fontFamily: 'monospace', opacity: 0.9 }}>Anggota123!</div>
            </div>
          </div>
        </div>

        {/* FR Checklist */}
        <div className="schoolib-card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Business Rules Implementation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requirements.map((req, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6', background: '#DBEAFE', padding: '2px 8px', borderRadius: 6 }}>{req.fr}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>{req.desc}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Terimplementasi dan siap diuji.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Machine */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="schoolib-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>State BUKU</h2>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              Tersedia → Dipinjam<br/>
              Dipinjam → Terlambat (otomatis by trigger/rpc)<br/>
              Dipinjam → Tersedia<br/>
              Terlambat → Tersedia
            </div>
            <div style={{ marginTop: 12, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', gap: 8 }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Semua rule ini ditangani via Supabase SQL Triggers dan RPC Functions.</div>
            </div>
          </div>
          <div className="schoolib-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>State ANGGOTA</h2>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              Aktif → Diblokir (otomatis jika denda &gt; 0)<br/>
              Diblokir → Aktif (hanya jika denda === 0)
            </div>
            <div style={{ marginTop: 12, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', gap: 8 }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Trigger database akan memblokir otomatis jika denda &gt; 0 saat pengembalian terlambat.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
