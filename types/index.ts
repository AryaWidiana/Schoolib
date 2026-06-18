// ============================================================
// SchooLib — TypeScript Types
// ============================================================

export type UserRole = 'anggota' | 'petugas'
export type UserStatus = 'aktif' | 'diblokir'
export type LoanStatus = 'dipinjam' | 'terlambat' | 'dikembalikan'

// ============================================================
// Database Row Types
// ============================================================

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  status: UserStatus
  total_denda: number
  avatar_url: string | null
  nim: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  judul: string
  pengarang: string
  isbn: string
  penerbit: string | null
  tahun_terbit: number | null
  kategori: string | null
  deskripsi: string | null
  cover_url: string | null
  jumlah_eksemplar: number
  stok_tersedia: number
  is_ebook: boolean
  ebook_url: string | null
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  user_id: string
  book_id: string
  tanggal_pinjam: string
  tanggal_jatuh_tempo: string
  tanggal_kembali: string | null
  status: LoanStatus
  sudah_diperpanjang: boolean
  hari_telat: number
  denda: number
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  book_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
  created_at: string
}

// ============================================================
// Joined / Extended Types
// ============================================================

export interface LoanWithBook extends Loan {
  books: Book
}

export interface LoanWithProfile extends Loan {
  profiles: Profile
}

export interface LoanWithBookAndProfile extends Loan {
  books: Book
  profiles: Profile
}

export interface FavoriteWithBook extends Favorite {
  books: Book
}

// ============================================================
// Form Types
// ============================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  full_name: string
  nim?: string
  phone?: string
}

export interface BookFormData {
  judul: string
  pengarang: string
  isbn: string
  penerbit?: string
  tahun_terbit?: number
  kategori?: string
  deskripsi?: string
  jumlah_eksemplar: number
  stok_tersedia: number
  is_ebook: boolean
  ebook_url?: string
}

export interface LoanFormData {
  user_id: string
  book_id: string
}

export interface ReturnFormData {
  loan_id: string
  tanggal_kembali: string
}

// ============================================================
// Server Action Response Types
// ============================================================

export interface ActionResult<T = undefined> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// ============================================================
// Statistics Types (for petugas dashboard)
// ============================================================

export interface DashboardStats {
  totalBooks: number
  totalMembers: number
  activeLoans: number
  overdueLoans: number
  totalFines: number
  returnedToday: number
}

export interface LoanStats {
  dipinjam: number
  terlambat: number
  dikembalikan: number
}

// ============================================================
// Search / Filter Types
// ============================================================

export interface BookSearchParams {
  query?: string
  kategori?: string
  is_ebook?: boolean
  page?: number
  limit?: number
}

export interface LoanFilterParams {
  status?: LoanStatus
  user_id?: string
  page?: number
  limit?: number
}

// ============================================================
// Supabase Database type helper
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      books: {
        Row: Book
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Book, 'id' | 'created_at'>>
      }
      loans: {
        Row: Loan
        Insert: Omit<Loan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Loan, 'id' | 'created_at'>>
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'id' | 'created_at'>
        Update: Partial<Omit<Favorite, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
      loan_status: LoanStatus
    }
    Functions: {
      process_book_return: {
        Args: { p_loan_id: string; p_tanggal_kembali?: string }
        Returns: { success: boolean; hari_telat: number; denda: number; loan_id: string }
      }
      extend_loan: {
        Args: { p_loan_id: string }
        Returns: { success: boolean; loan_id: string }
      }
      update_overdue_loans: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
