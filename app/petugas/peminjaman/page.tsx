import { prisma } from '@/lib/prisma'
import { BookMarked } from 'lucide-react'
import { PeminjamanClient } from './peminjaman-client'
import type { LoanWithBookAndProfile } from '@/types'

// 2. Query terbatas per kategori — tidak pernah ambil seluruh tabel sekaligus
const AKTIF_LIMIT = 200   // Pinjaman aktif biasanya kecil jumlahnya
const RIWAYAT_LIMIT = 50  // Riwayat bisa sangat besar, batasi 50 terbaru

const loanSelect = {
  id: true,
  user_id: true,
  book_id: true,
  tanggal_pinjam: true,
  tanggal_jatuh_tempo: true,
  tanggal_kembali: true,
  status: true,
  hari_telat: true,
  denda: true,
  sudah_diperpanjang: true,
  created_at: true,
  book: { select: { id: true, judul: true, isbn: true } },
  profile: { select: { id: true, full_name: true, nim: true } },
} as const

export default async function PeminjamanPage() {
  // 2. Fetch paralel: aktif dan riwayat diambil BERSAMAAN, bukan berurutan
  let aktifLoans: LoanWithBookAndProfile[] = []
  let riwayatLoans: LoanWithBookAndProfile[] = []

  try {
    const [fetchedAktif, fetchedRiwayat] = await Promise.all([
      // Tab "Aktif": semua pinjaman yang belum dikembalikan
      prisma.loan.findMany({
        where: { status: { in: ['dipinjam', 'terlambat'] } },
        orderBy: { created_at: 'desc' },
        take: AKTIF_LIMIT,
        select: loanSelect,
      }),
      // Tab "Riwayat": hanya 50 terbaru untuk mencegah DOM bloat
      prisma.loan.findMany({
        where: { status: 'dikembalikan' },
        orderBy: { tanggal_kembali: 'desc' },
        take: RIWAYAT_LIMIT,
        select: loanSelect,
      }),
    ])

    aktifLoans = fetchedAktif as unknown as LoanWithBookAndProfile[]
    riwayatLoans = fetchedRiwayat as unknown as LoanWithBookAndProfile[]
  } catch {
    aktifLoans = []
    riwayatLoans = []
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BookMarked size={20} color="#1D2A8A" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B' }}>Data Peminjaman</h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            {aktifLoans.length} pinjaman aktif · {riwayatLoans.length} riwayat terbaru
          </p>
        </div>
      </div>

      {/* PeminjamanClient: semua tab switching terjadi di sisi klien (nol server round-trip) */}
      <PeminjamanClient
        aktifLoans={aktifLoans}
        riwayatLoans={riwayatLoans}
      />
    </div>
  )
}
