-- ============================================================
-- SchooLib — School Online Library
-- Database Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('anggota', 'petugas');
CREATE TYPE user_status AS ENUM ('aktif', 'diblokir');
CREATE TYPE loan_status AS ENUM ('dipinjam', 'terlambat', 'dikembalikan');

-- ============================================================
-- TABLE: profiles
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'anggota',
  status        user_status NOT NULL DEFAULT 'aktif',
  total_denda   INTEGER NOT NULL DEFAULT 0 CHECK (total_denda >= 0),
  avatar_url    TEXT,
  nim           TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: books
-- ============================================================

CREATE TABLE books (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul             TEXT NOT NULL,
  pengarang         TEXT NOT NULL,
  isbn              TEXT UNIQUE NOT NULL,
  penerbit          TEXT,
  tahun_terbit      INTEGER,
  kategori          TEXT,
  deskripsi         TEXT,
  cover_url         TEXT,
  jumlah_eksemplar  INTEGER NOT NULL DEFAULT 1 CHECK (jumlah_eksemplar >= 0),
  stok_tersedia     INTEGER NOT NULL DEFAULT 1 CHECK (stok_tersedia >= 0),
  is_ebook          BOOLEAN NOT NULL DEFAULT FALSE,
  ebook_url         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stok_lte_jumlah CHECK (stok_tersedia <= jumlah_eksemplar)
);

-- ============================================================
-- TABLE: loans
-- ============================================================

CREATE TABLE loans (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  book_id               UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  tanggal_pinjam        DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_jatuh_tempo   DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  tanggal_kembali       DATE,
  status                loan_status NOT NULL DEFAULT 'dipinjam',
  sudah_diperpanjang    BOOLEAN NOT NULL DEFAULT FALSE,
  hari_telat            INTEGER NOT NULL DEFAULT 0 CHECK (hari_telat >= 0),
  denda                 INTEGER NOT NULL DEFAULT 0 CHECK (denda >= 0),
  catatan               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: favorites
-- ============================================================

CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id    UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  type       TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_books_judul ON books USING gin(to_tsvector('indonesian', judul));
CREATE INDEX idx_books_pengarang ON books(pengarang);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_kategori ON books(kategori);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_tanggal_jatuh_tempo ON loans(tanggal_jatuh_tempo);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User Baru'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'anggota')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update member status based on denda
CREATE OR REPLACE FUNCTION update_member_status_on_denda()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_denda > 0 THEN
    NEW.status = 'diblokir';
  ELSE
    NEW.status = 'aktif';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_member_status
  BEFORE UPDATE OF total_denda ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_member_status_on_denda();

-- Function to update overdue loans (called by cron or manually)
CREATE OR REPLACE FUNCTION update_overdue_loans()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE loans
  SET status = 'terlambat'
  WHERE status = 'dipinjam'
    AND tanggal_jatuh_tempo < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process book return
CREATE OR REPLACE FUNCTION process_book_return(
  p_loan_id UUID,
  p_tanggal_kembali DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_loan loans%ROWTYPE;
  v_hari_telat INTEGER;
  v_denda INTEGER;
  v_result JSONB;
BEGIN
  -- Get loan record
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Peminjaman tidak ditemukan';
  END IF;
  
  IF v_loan.status = 'dikembalikan' THEN
    RAISE EXCEPTION 'Buku sudah dikembalikan';
  END IF;
  
  -- Calculate late days and fine
  v_hari_telat := GREATEST(0, (p_tanggal_kembali - v_loan.tanggal_jatuh_tempo)::INTEGER);
  v_denda := v_hari_telat * 1000;
  
  -- Update loan record
  UPDATE loans SET
    tanggal_kembali = p_tanggal_kembali,
    status = 'dikembalikan',
    hari_telat = v_hari_telat,
    denda = v_denda
  WHERE id = p_loan_id;
  
  -- Restore book stock
  UPDATE books SET stok_tersedia = stok_tersedia + 1
  WHERE id = v_loan.book_id;
  
  -- Add fine to user's total if any
  IF v_denda > 0 THEN
    UPDATE profiles SET total_denda = total_denda + v_denda
    WHERE id = v_loan.user_id;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'hari_telat', v_hari_telat,
    'denda', v_denda,
    'loan_id', p_loan_id
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extend loan
CREATE OR REPLACE FUNCTION extend_loan(p_loan_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_loan loans%ROWTYPE;
BEGIN
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Peminjaman tidak ditemukan';
  END IF;
  
  IF v_loan.sudah_diperpanjang THEN
    RAISE EXCEPTION 'Peminjaman sudah pernah diperpanjang (maksimal 1 kali)';
  END IF;
  
  IF v_loan.status = 'terlambat' THEN
    RAISE EXCEPTION 'Tidak dapat memperpanjang peminjaman yang sudah terlambat';
  END IF;
  
  IF v_loan.status = 'dikembalikan' THEN
    RAISE EXCEPTION 'Peminjaman sudah dikembalikan';
  END IF;
  
  UPDATE loans SET
    tanggal_jatuh_tempo = tanggal_jatuh_tempo + INTERVAL '7 days',
    sudah_diperpanjang = TRUE
  WHERE id = p_loan_id;
  
  RETURN jsonb_build_object('success', true, 'loan_id', p_loan_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_petugas" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_petugas" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'petugas')
  );

-- BOOKS POLICIES
CREATE POLICY "books_select_all" ON books
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "books_insert_petugas" ON books
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

CREATE POLICY "books_update_petugas" ON books
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

CREATE POLICY "books_delete_petugas" ON books
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

-- LOANS POLICIES
CREATE POLICY "loans_select_own" ON loans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "loans_select_petugas" ON loans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

CREATE POLICY "loans_insert_anggota" ON loans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "loans_insert_petugas" ON loans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

CREATE POLICY "loans_update_petugas" ON loans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'petugas')
  );

-- FAVORITES POLICIES
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());
