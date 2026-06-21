'use client'

import { useState, useMemo } from 'react'
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

// Poin 1: Batas maksimum hasil yang ditampilkan di DOM sekaligus.
// Mencegah React me-render ratusan <BookCard> bersamaan yang menyebabkan visual lag.
const SEARCH_DISPLAY_LIMIT = 20

export function SearchableBookGrid({
  books,
  favoritedIds = [],
  initialQuery = '',
  placeholder = 'Cari judul, pengarang, ISBN, atau kategori...',
  showSearch = true,
}: SearchableBookGridProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // useMemo menghitung dua hal sekaligus:
  // 1. `display` — buku yang benar-benar di-render di DOM (maks 20)
  // 2. `totalFound` — jumlah total yang cocok (untuk info teks pencarian)
  const { display, totalFound } = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()

    if (!q) {
      return { display: books.slice(0, SEARCH_DISPLAY_LIMIT), totalFound: books.length }
    }

    // Loop sekali — kumpulkan semua yang cocok, tapi hanya push ke display sampai batas
    const display: Book[] = []
    let totalFound = 0
    for (const book of books) {
      const match =
        book.judul?.toLowerCase().includes(q) ||
        book.pengarang?.toLowerCase().includes(q) ||
        book.isbn?.toLowerCase().includes(q) ||
        book.kategori?.toLowerCase().includes(q)

      if (match) {
        totalFound++
        if (display.length < SEARCH_DISPLAY_LIMIT) {
          display.push(book)
        }
      }
    }
    return { display, totalFound }
  }, [debouncedQuery, books])

  return (
    <div>
      {showSearch && (
        <div style={{ marginBottom: 20 }}>
          <DebouncedSearchInput
            initialValue={initialQuery}
            placeholder={placeholder}
            onSearch={setDebouncedQuery}
            debounceTime={300}
          />

          {debouncedQuery.trim() && (
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748B' }}>
              {totalFound > SEARCH_DISPLAY_LIMIT ? (
                <>
                  Menampilkan <strong style={{ color: '#1E293B' }}>{display.length}</strong> dari{' '}
                  <strong style={{ color: '#1E293B' }}>{totalFound}</strong> buku untuk{' '}
                  &quot;<strong style={{ color: '#1D2A8A' }}>{debouncedQuery.trim()}</strong>&quot;
                  {' '}— <span style={{ color: '#94A3B8' }}>persempit kata kunci untuk hasil lebih tepat</span>
                </>
              ) : (
                <>
                  Ditemukan <strong style={{ color: '#1E293B' }}>{totalFound}</strong> buku untuk{' '}
                  &quot;<strong style={{ color: '#1D2A8A' }}>{debouncedQuery.trim()}</strong>&quot;
                </>
              )}
            </p>
          )}
        </div>
      )}

      <BookGrid
        books={display}
        favoritedIds={favoritedIds}
        emptyType={debouncedQuery.trim() ? 'search' : 'books'}
      />
    </div>
  )
}
