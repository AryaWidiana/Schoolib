import { BookOpen, Search, FileX, Heart, Clock } from 'lucide-react'

interface EmptyStateProps {
  type?: 'books' | 'loans' | 'search' | 'favorites' | 'generic'
  message?: string
  description?: string
}

const configs = {
  books:     { icon: BookOpen,  title: 'Belum ada buku',       desc: 'Koleksi buku akan muncul di sini.' },
  loans:     { icon: Clock,     title: 'Belum ada peminjaman', desc: 'Riwayat pinjaman akan muncul di sini.' },
  search:    { icon: Search,    title: 'Tidak ditemukan',      desc: 'Coba kata kunci yang berbeda.' },
  favorites: { icon: Heart,     title: 'Belum ada favorit',   desc: 'Tambahkan buku ke daftar favorit Anda.' },
  generic:   { icon: FileX,     title: 'Tidak ada data',       desc: 'Data akan muncul di sini.' },
}

export function EmptyState({ type = 'generic', message, description }: EmptyStateProps) {
  const cfg = configs[type]
  const Icon = cfg.icon

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #DBEAFE, #EEF2FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Icon size={32} color="#3B5BDB" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        {message ?? cfg.title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#94A3B8', maxWidth: 280 }}>
        {description ?? cfg.desc}
      </p>
    </div>
  )
}
