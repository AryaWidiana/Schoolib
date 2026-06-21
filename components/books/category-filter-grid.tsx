'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import type { Book } from '@/types'
import { SearchableBookGrid } from '@/components/books/searchable-book-grid'

interface CategoryFilterGridProps {
  books: Book[]
  categories: string[]
  favoritedIds: string[]
  initialKategori?: string
  initialQuery?: string
}

export function CategoryFilterGrid({
  books,
  categories,
  favoritedIds,
  initialKategori = '',
  initialQuery = '',
}: CategoryFilterGridProps) {
  // 1. State kategori lokal — tidak perlu round-trip ke server
  const [activeKategori, setActiveKategori] = useState(initialKategori)

  // 2. useTransition: tandai pergantian kategori sebagai tugas berprioritas rendah
  // React akan tetap merespons interaksi user (scroll, klik lain) selama filter berjalan
  const [isPending, startTransition] = useTransition()

  // 3. Client-side filtering via useMemo — data sudah ada di memori, nol network request
  // useMemo hanya menghitung ulang jika activeKategori atau books berubah
  const filteredBooks = useMemo(() => {
    if (!activeKategori) return books
    return books.filter(b => b.kategori === activeKategori)
  }, [activeKategori, books])

  // 4. Handler dengan useCallback agar referensi fungsi stabil (tidak re-create tiap render)
  const handleKategoriClick = useCallback((kategori: string) => {
    // Bungkus setState di dalam startTransition
    // Ini memberitahu React: "perubahan ini bukan urgen, jaga UI tetap responsif"
    startTransition(() => {
      setActiveKategori(kategori)
    })
  }, [])

  return (
    <>
      {/* Filter Pill Buttons — client-side, tidak ada navigasi server */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => handleKategoriClick('')}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: !activeKategori ? '#1D2A8A' : '#F1F5F9',
            color: !activeKategori ? 'white' : '#64748B',
            // Sedikit redup saat pending untuk memberi sinyal visual tanpa freeze
            opacity: isPending ? 0.7 : 1,
          }}
        >
          Semua
        </button>

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleKategoriClick(cat)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeKategori === cat ? '#1D2A8A' : '#F1F5F9',
              color: activeKategori === cat ? 'white' : '#64748B',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid buku — difilter di klien tanpa loading ke server */}
      <SearchableBookGrid
        books={filteredBooks}
        favoritedIds={favoritedIds}
        initialQuery={initialQuery}
        placeholder="Cari judul, pengarang, atau ISBN..."
      />
    </>
  )
}
