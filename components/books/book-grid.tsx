import { BookCard } from './book-card'
import { EmptyState } from '@/components/shared/empty-state'
import type { Book } from '@/types'

interface BookGridProps {
  books: Book[]
  favoritedIds?: string[]
  emptyType?: 'books' | 'search' | 'favorites'
}

export function BookGrid({ books, favoritedIds = [], emptyType = 'books' }: BookGridProps) {
  if (books.length === 0) return <EmptyState type={emptyType} />

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
      gap: 16,
    }}>
      {books.map((book, i) => (
        <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
          <BookCard book={book} isFavorited={favoritedIds.includes(book.id)} />
        </div>
      ))}
    </div>
  )
}
