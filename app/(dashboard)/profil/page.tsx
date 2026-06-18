import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Hash, Phone, Clock, ShieldAlert } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase.from('profiles').select('*').eq('id', user.id).single()) as any
  if (!profile) return null

  const isPetugas = profile.role === 'petugas'

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: 24 }}>Profil Saya</h1>

      <div className="schoolib-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #1D2A8A, #3B5BDB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '1.5rem', fontWeight: 700,
          }}>
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>{profile.full_name}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge ${isPetugas ? 'badge-purple' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>
                {profile.role}
              </span>
              {!isPetugas && (
                <span className={`badge ${profile.status === 'aktif' ? 'badge-green' : 'badge-red'}`}>
                  {profile.status === 'aktif' ? '✓ Aktif' : '⊘ Diblokir'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Hash, label: 'NIM/NIS', value: profile.nim || '-' },
            { icon: Phone, label: 'No. HP', value: profile.phone || '-' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color="#64748B" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPetugas && (
        <div style={{
          background: profile.total_denda > 0 ? '#FEF2F2' : '#F8FAFC',
          border: '1px solid', borderColor: profile.total_denda > 0 ? '#FECACA' : '#E2E8F0',
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldAlert size={18} color={profile.total_denda > 0 ? '#EF4444' : '#64748B'} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: profile.total_denda > 0 ? '#991B1B' : '#1E293B' }}>Status Keuangan & Denda</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: profile.total_denda > 0 ? '#7F1D1D' : '#64748B', marginBottom: 16 }}>
            {profile.total_denda > 0
              ? 'Anda memiliki denda yang belum dibayar. Peminjaman baru tidak dapat dilakukan sampai denda dilunasi.'
              : 'Anda tidak memiliki tunggakan denda keterlambatan.'}
          </p>
          <div style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Denda</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: profile.total_denda > 0 ? '#EF4444' : '#10B981' }}>
              {formatRupiah(profile.total_denda)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
