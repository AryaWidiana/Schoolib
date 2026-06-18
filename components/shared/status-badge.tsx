import type { LoanStatus, UserStatus } from '@/types'

interface StatusBadgeProps {
  status: LoanStatus | UserStatus | string
}

const statusMap: Record<string, { label: string; className: string; dot: string }> = {
  dipinjam:    { label: 'Dipinjam',     className: 'badge badge-blue',   dot: '#3B82F6' },
  terlambat:   { label: 'Terlambat',    className: 'badge badge-red',    dot: '#EF4444' },
  dikembalikan:{ label: 'Dikembalikan', className: 'badge badge-green',  dot: '#22C55E' },
  aktif:       { label: 'Aktif',        className: 'badge badge-green',  dot: '#22C55E' },
  diblokir:    { label: 'Diblokir',     className: 'badge badge-red',    dot: '#EF4444' },
  tersedia:    { label: 'Tersedia',     className: 'badge badge-green',  dot: '#22C55E' },
  terbatas:    { label: 'Terbatas',     className: 'badge badge-yellow', dot: '#EAB308' },
  habis:       { label: 'Habis',        className: 'badge badge-red',    dot: '#EF4444' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, className: 'badge badge-gray', dot: '#94A3B8' }
  return (
    <span className={config.className}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, display: 'inline-block' }} />
      {config.label}
    </span>
  )
}
