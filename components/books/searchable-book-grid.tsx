'use client'

import { useState, useMemo, useEffect } from 'react'
import { BookGrid } from '@/components/books/book-grid'
import type { Book } from '@/types'
import { Search, X } from 'lucide-react'

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
  const [query, setQuery] = useState(initialQuery)

  // Sync with URL query param changes (e.g. from topbar search)
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Client-side filtering — O(n) in memory, truly instant
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return books
    return books.filter(book =>
      book.judul?.toLowerCase().includes(q) ||
      book.pengarang?.toLowerCase().includes(q) ||
      book.isbn?.toLowerCase().includes(q) ||
      book.kategori?.toLowerCase().includes(q)
    )
  }, [query, books])

  return (
    <div>
      {showSearch && (
        <div style={{ marginBottom: 20 }}>
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            {query && (
              <button
                onClick={() => setQuery('')}
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

          {query.trim() && (
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748B' }}>
              Ditemukan <strong style={{ color: '#1E293B' }}>{filtered.length}</strong> buku
              untuk &quot;<strong style={{ color: '#1D2A8A' }}>{query.trim()}</strong>&quot;
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
