'use client'

import { useState, useMemo } from 'react'
import { BookGrid } from '@/components/books/book-grid'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Book } from '@/types'

interface BerandaClientProps {
  rekomendasi: Book[]
  populer: Book[]
  terbaru: Book[]
  favoritedIds: string[]
  initialQuery?: string
}

export function BerandaClient({ rekomendasi, populer, terbaru, favoritedIds, initialQuery = '' }: BerandaClientProps) {
  const [query, setQuery] = useState(initialQuery)

  const { isSearching, searchResults, totalFound } = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { isSearching: false, searchResults: [], totalFound: 0 }

    // Combine all books and deduplicate by ID
    const allBooksMap = new Map<string, Book>()
    ;[...rekomendasi, ...populer, ...terbaru].forEach(b => {
      allBooksMap.set(b.id, b)
    })

    const results: Book[] = []
    let total = 0
    for (const book of allBooksMap.values()) {
      const match =
        book.judul?.toLowerCase().includes(q) ||
        book.pengarang?.toLowerCase().includes(q) ||
        book.isbn?.toLowerCase().includes(q) ||
        book.kategori?.toLowerCase().includes(q)

      if (match) {
        total++
        if (results.length < 30) { // Limit results to 30 for performance
          results.push(book)
        }
      }
    }

    return { isSearching: true, searchResults: results, totalFound: total }
  }, [query, rekomendasi, populer, terbaru])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Search Input Area */}
      <section className="animate-fade-in-up stagger-1">
        <div style={{ marginBottom: isSearching ? 24 : 16 }}>
          {!isSearching && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Rekomendasi untuk Kamu</h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Buku pilihan yang tersedia sekarang</p>
              </div>
              <Link href="/koleksi" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
          )}
          
          <DebouncedSearchInput
            initialValue={initialQuery}
            placeholder="Cari judul, pengarang, atau ISBN di Beranda..."
            onSearch={setQuery}
            debounceTime={300}
          />
          
          {isSearching && (
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748B' }}>
              {totalFound > 30 ? (
                <>Menampilkan <strong style={{ color: '#1E293B' }}>{searchResults.length}</strong> dari <strong style={{ color: '#1E293B' }}>{totalFound}</strong> buku untuk &quot;<strong style={{ color: '#1D2A8A' }}>{query.trim()}</strong>&quot;</>
              ) : (
                <>Ditemukan <strong style={{ color: '#1E293B' }}>{totalFound}</strong> buku untuk &quot;<strong style={{ color: '#1D2A8A' }}>{query.trim()}</strong>&quot;</>
              )}
            </p>
          )}
        </div>

        {isSearching ? (
          <BookGrid
            books={searchResults}
            favoritedIds={favoritedIds}
            emptyType="search"
          />
        ) : (
          <BookGrid
            books={rekomendasi}
            favoritedIds={favoritedIds}
            emptyType="books"
          />
        )}
      </section>

      {/* Hide below sections if searching */}
      {!isSearching && (
        <>
          {/* Populer */}
          <section className="animate-fade-in-up stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                  <TrendingUp size={18} style={{ display: 'inline', marginRight: 6, color: '#F59E0B' }} />
                  Buku Populer
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Paling banyak dipinjam anggota</p>
              </div>
              <Link href="/populer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={populer} favoritedIds={favoritedIds} />
          </section>

          {/* Terbaru */}
          <section className="animate-fade-in-up stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Buku Terbaru</h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Koleksi yang baru ditambahkan</p>
              </div>
              <Link href="/koleksi" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1D2A8A', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={terbaru} favoritedIds={favoritedIds} />
          </section>
        </>
      )}
    </div>
  )
}
