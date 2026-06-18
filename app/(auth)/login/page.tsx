'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(fd)
      if (result && !result.success) {
        toast.error(result.message)
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 50%, #F0F9FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,42,138,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,232,247,0.5) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #1D2A8A 0%, #3B5BDB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(29,42,138,0.3)',
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1D2A8A', marginBottom: 4 }}>SchooLib</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>School Online Library — Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '32px',
          boxShadow: '0 8px 40px rgba(29,42,138,0.12)',
          border: '1px solid rgba(191,232,247,0.5)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label className="schoolib-label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  id="email" name="email" type="email" required
                  placeholder="email@schoolib.ac.id"
                  className="schoolib-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="schoolib-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  required placeholder="••••••••"
                  className="schoolib-input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0,
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Demo accounts info */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1', marginBottom: 6 }}>Akun Demo:</div>
              <div style={{ fontSize: '0.72rem', color: '#0369A1', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>👤 <strong>Petugas:</strong> petugas@schoolib.ac.id / Petugas123!</div>
                <div>📚 <strong>Anggota:</strong> budi@schoolib.ac.id / Anggota123!</div>
              </div>
            </div>

            <button type="submit" disabled={pending} className="schoolib-btn-primary" style={{ padding: '13px', fontSize: '0.95rem' }}>
              {pending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: '#64748B' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#1D2A8A', fontWeight: 700, textDecoration: 'none' }}>
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
