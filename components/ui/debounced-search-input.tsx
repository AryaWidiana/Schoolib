'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface DebouncedSearchInputProps {
  initialValue?: string
  placeholder?: string
  onSearch: (debouncedQuery: string) => void
  debounceTime?: number
}

export function DebouncedSearchInput({
  initialValue = '',
  placeholder = 'Cari judul, pengarang, atau ISBN...',
  onSearch,
  debounceTime = 300,
}: DebouncedSearchInputProps) {
  // 1. ISOLASI STATE: State input teks hanya ada di dalam komponen kecil ini.
  // Mengetik tidak akan me-render ulang Parent (daftar buku) sebelum debounce habis.
  const [localQuery, setLocalQuery] = useState(initialValue)
  
  // 2. Terapkan custom hook untuk menahan pembaruan
  const debouncedValue = useDebounce(localQuery, debounceTime)

  // 3. Hanya lempar ke Parent jika debouncedValue berubah
  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  // Sinkronisasi jika nilai awal dari luar (URL) berubah
  useEffect(() => {
    setLocalQuery(initialValue)
  }, [initialValue])

  return (
    <div style={{ position: 'relative', maxWidth: 480 }}>
      <Search
        size={16}
        style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: '#94A3B8',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 40px 10px 40px',
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          background: '#F8FAFC',
          color: '#1E293B',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1D2A8A'
          e.target.style.background = 'white'
          e.target.style.boxShadow = '0 0 0 3px rgba(29,42,138,0.08)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#E2E8F0'
          e.target.style.background = '#F8FAFC'
          e.target.style.boxShadow = 'none'
        }}
      />
      {localQuery && (
        <button
          onClick={() => setLocalQuery('')}
          style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            background: '#F1F5F9', border: 'none', borderRadius: 6,
            width: 22, height: 22, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#64748B',
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
