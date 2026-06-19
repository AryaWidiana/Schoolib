import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'SchooLib — School Online Library',
  description: 'Sistem Perpustakaan Digital Sekolah & Kampus — Kelola peminjaman, koleksi buku, dan riwayat dengan mudah.',
  keywords: 'perpustakaan digital, sekolah, kampus, peminjaman buku, koleksi buku',
  icons: {
    icon: '/icon.webp',
  },
  openGraph: {
    title: 'SchooLib — School Online Library',
    description: 'Sistem Perpustakaan Digital Sekolah & Kampus',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
          }}
        />
      </body>
    </html>
  )
}
