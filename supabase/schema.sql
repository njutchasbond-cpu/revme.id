-- =========================================================================
-- Skema Database Supabase untuk Sistem Kartu NFC "Tap to Review" (First-Tap Claim)
-- =========================================================================

-- 1. Status Kartu ENUM
CREATE TYPE card_status AS ENUM ('unclaimed', 'active', 'inactive');

-- 2. Tabel Utama: cards
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,       -- misal: "A1B2C3" atau "0001"
    status card_status DEFAULT 'unclaimed' NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_phone VARCHAR(50),                      -- No WhatsApp pemilik
    owner_email VARCHAR(255),                     -- Email pemilik jika login google
    business_name VARCHAR(255),
    business_address TEXT,
    google_place_id VARCHAR(255),
    review_url TEXT,                              -- https://search.google.com/local/writereview?placeid=...
    batch_number VARCHAR(50),                     -- Batch produksi, misal: "BATCH-01"
    tap_count INT DEFAULT 0 NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indeks performa untuk Redirect Engine & Querying
CREATE INDEX IF NOT EXISTS idx_cards_short_code ON public.cards(short_code);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_owner_id ON public.cards(owner_id);

-- 3. Tabel Analytics: tap_logs
CREATE TABLE IF NOT EXISTS public.tap_logs (
    id BIGSERIAL PRIMARY KEY,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    device_type VARCHAR(20) DEFAULT 'Unknown',     -- 'iOS', 'Android', 'Desktop'
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tap_logs_card_id ON public.tap_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_tap_logs_created_at ON public.tap_logs(created_at);

-- 4. Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tap_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Publik bisa membaca data kartu yang dibutuhkan untuk redirect & claim
CREATE POLICY "Public can view card status and urls" ON public.cards
    FOR SELECT USING (true);

-- Policy: Publik / Service role bisa mengklaim kartu yang berstatus unclaimed
CREATE POLICY "Public can claim unclaimed card" ON public.cards
    FOR UPDATE USING (status = 'unclaimed')
    WITH CHECK (status = 'active');

-- Policy: Pemilik kartu bisa mengedit kartu miliknya
CREATE POLICY "Owner can update own card" ON public.cards
    FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Log tap bisa di-insert oleh publik (ketika tap terjadi)
CREATE POLICY "Public can insert tap logs" ON public.tap_logs
    FOR INSERT WITH CHECK (true);

