'use client'

import { useState, useMemo, useEffect } from 'react'
import { BookGrid } from '@/components/books/book-grid'
import type { Book } from '@/types'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'

interface SearchableBookGridProps {
  books: Book[]
  favoritedIds?: string[]
  initialQuery?: string
  placeholder?: string
  emptyLabel?: string
  showSearch?: boolean
}

export function SearchableBookGrid({
  books,
  favoritedIds = [],
  initialQuery = '',
  placeholder = 'Cari judul, pengarang, ISBN, atau kategori...',
  showSearch = true,
}: SearchableBookGridProps) {
  // Hanya simpan debouncedQuery di sini.
  // Mengetik secara real-time TIDAK akan memicu state ini sebelum user diam 300ms.
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // Client-side filtering — O(n) in memory, dieksekusi hanya saat debouncedQuery berubah
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return books
    return books.filter(book =>
      book.judul?.toLowerCase().includes(q) ||
      book.pengarang?.toLowerCase().includes(q) ||
      book.isbn?.toLowerCase().includes(q) ||
      book.kategori?.toLowerCase().includes(q)
    )
  }, [debouncedQuery, books])

  return (
    <div>
      {showSearch && (
        <div style={{ marginBottom: 20 }}>
          <DebouncedSearchInput
            initialValue={initialQuery}
            placeholder={placeholder}
            onSearch={setDebouncedQuery}
            debounceTime={300} // Cukup responsif tapi aman dari re-render brutal
          />

          {debouncedQuery.trim() && (
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748B' }}>
              Ditemukan <strong style={{ color: '#1E293B' }}>{filtered.length}</strong> buku
              untuk &quot;<strong style={{ color: '#1D2A8A' }}>{debouncedQuery.trim()}</strong>&quot;
            </p>
          )}
        </div>
      )}

      <BookGrid
        books={filtered}
        favoritedIds={favoritedIds}
        emptyType={query.trim() ? 'search' : 'books'}
      />
    </div>
  )
}
