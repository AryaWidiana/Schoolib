'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { GraduationCap, Mail, Lock, User, Phone, Hash, Eye, EyeOff, Loader2 } from 'lucide-react'
import { register } from '@/actions/auth'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(fd)
      if (result.success) {
        setDone(true)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'url(/assets/login-bg.webp) no-repeat center center', backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="animate-fade-in-up" style={{ background: 'white', borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(29,42,138,0.12)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📬</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1D2A8A', marginBottom: 8 }}>Cek Email Anda!</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 24 }}>Kami telah mengirim link konfirmasi. Silakan verifikasi email sebelum login.</p>
          <Link href="/login" className="schoolib-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}>Kembali ke Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'url(/assets/login-bg.webp) no-repeat center center', backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(29,42,138,0.3)' }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1D2A8A', marginBottom: 4 }}>Daftar Akun</h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Bergabung dengan SchooLib sebagai anggota</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '28px 32px', boxShadow: '0 8px 40px rgba(29,42,138,0.12)', border: '1px solid rgba(191,232,247,0.5)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="schoolib-label" htmlFor="full_name">Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="full_name" name="full_name" type="text" required placeholder="Nama lengkap" className="schoolib-input" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label className="schoolib-label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="email" name="email" type="email" required placeholder="email@schoolib.ac.id" className="schoolib-input" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="schoolib-label" htmlFor="nim">NIM/NIS</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input id="nim" name="nim" type="text" placeholder="Optional" className="schoolib-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>
              <div>
                <label className="schoolib-label" htmlFor="phone">No. HP</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input id="phone" name="phone" type="tel" placeholder="Optional" className="schoolib-input" style={{ paddingLeft: 38 }} />
                </div>
              </div>
            </div>

            <div>
              <label className="schoolib-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="Min. 8 karakter" className="schoolib-input" style={{ paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={pending} className="schoolib-btn-primary" style={{ padding: '12px', fontSize: '0.9rem', marginTop: 4 }}>
              {pending ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Mendaftarkan...</span> : 'Daftar Sekarang'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.875rem', color: '#64748B' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#1D2A8A', fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
