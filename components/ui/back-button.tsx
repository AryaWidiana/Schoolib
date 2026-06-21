'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  label?: string
}

export function BackButton({ label = 'Kembali' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 6, 
        color: '#64748B', 
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none', 
        fontSize: '0.85rem', 
        marginBottom: 20, 
        fontWeight: 500,
        padding: 0,
        fontFamily: 'inherit'
      }}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  )
}
