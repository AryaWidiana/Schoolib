import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format currency to Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Format date to Indonesian locale */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Format date to short form */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Get today's date in YYYY-MM-DD format */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/** Add N days to a date string, returns YYYY-MM-DD */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/** Calculate days difference between two dates */
export function daysDiff(from: string, to: string): number {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/** Calculate late days and fine */
export function calculateFine(
  tanggalJatuhTempo: string,
  tanggalKembali: string = getTodayString()
): { hariTelat: number; denda: number } {
  const hariTelat = Math.max(0, daysDiff(tanggalJatuhTempo, tanggalKembali))
  const denda = hariTelat * 1000
  return { hariTelat, denda }
}

/** Check if a loan is overdue */
export function isOverdue(tanggalJatuhTempo: string): boolean {
  return new Date(tanggalJatuhTempo) < new Date(getTodayString())
}

/** Get days remaining until due date */
export function daysUntilDue(tanggalJatuhTempo: string): number {
  return daysDiff(getTodayString(), tanggalJatuhTempo)
}

/** Get loan status label */
export function getLoanStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    dipinjam: 'Dipinjam',
    terlambat: 'Terlambat',
    dikembalikan: 'Dikembalikan',
  }
  return labels[status] ?? status
}

/** Get book availability label */
export function getBookAvailability(stokTersedia: number): string {
  if (stokTersedia === 0) return 'Tidak Tersedia'
  if (stokTersedia <= 2) return 'Terbatas'
  return 'Tersedia'
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Generate cover gradient based on book title */
export function getCoverGradient(seed: string): string {
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-violet-400 to-violet-600',
    'from-cyan-400 to-cyan-600',
    'from-teal-400 to-teal-600',
    'from-sky-400 to-sky-600',
    'from-blue-500 to-indigo-600',
    'from-indigo-500 to-purple-600',
  ]
  const index = seed.charCodeAt(0) % gradients.length
  return gradients[index]
}
