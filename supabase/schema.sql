-- =========================================================================
-- Skema Database Supabase untuk Sistem Kartu Pintar All-in-One Hub
-- =========================================================================

-- 1. Status Kartu dan Mode Operasional
DO $$ BEGIN
    CREATE TYPE card_status AS ENUM ('unclaimed', 'active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE card_mode AS ENUM ('smart_hub', 'direct_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel Utama: cards
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(16) UNIQUE NOT NULL,
    status card_status DEFAULT 'unclaimed' NOT NULL,
    mode card_mode DEFAULT 'smart_hub' NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_phone VARCHAR(50),
    owner_email VARCHAR(255),
    
    -- Profil Bisnis
    business_name VARCHAR(255),
    business_category VARCHAR(100),
    business_address TEXT,
    logo_url TEXT,
    google_place_id VARCHAR(255),
    review_url TEXT,
    
    -- Tautan dan Konfigurasi All-in-One
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    menu_url TEXT,
    services_url TEXT,
    instagram_username VARCHAR(100),
    tiktok_username VARCHAR(100),
    website_url TEXT,
    whatsapp_number VARCHAR(30),
    shopee_url TEXT,
    tokopedia_url TEXT,
    shopeefood_url TEXT,
    gofood_url TEXT,
    theme_preset VARCHAR(50) DEFAULT 'default',
    
    -- Operasional Produksi & Statistik
    batch_number VARCHAR(50),
    tap_count INT DEFAULT 0 NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indeks performa
CREATE INDEX IF NOT EXISTS idx_cards_short_code ON public.cards(short_code);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_owner_id ON public.cards(owner_id);

-- 3. Tabel Analytics: interaction_logs
CREATE TABLE IF NOT EXISTS public.interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    device_type VARCHAR(20) DEFAULT 'Unknown',
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_card_id ON public.interaction_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_type ON public.interaction_logs(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at ON public.interaction_logs(created_at);

-- 4. Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama jika sudah ada agar tidak bentrok
DROP POLICY IF EXISTS "Public can view card data" ON public.cards;
DROP POLICY IF EXISTS "Public can claim unclaimed card" ON public.cards;
DROP POLICY IF EXISTS "Public can insert card on claim" ON public.cards;
DROP POLICY IF EXISTS "Owner can update own card" ON public.cards;
DROP POLICY IF EXISTS "Public can insert interaction logs" ON public.interaction_logs;

-- Pasang policy keamanan baru
CREATE POLICY "Public can view card data" ON public.cards
    FOR SELECT USING (true);

CREATE POLICY "Public can claim unclaimed card" ON public.cards
    FOR UPDATE USING (status = 'unclaimed')
    WITH CHECK (status = 'active');

CREATE POLICY "Public can insert card on claim" ON public.cards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can update own card" ON public.cards
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Public can insert interaction logs" ON public.interaction_logs
    FOR INSERT WITH CHECK (true);

-- Kolom tambahan untuk Marketplace & Delivery
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS shopee_url TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tokopedia_url TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS shopeefood_url TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS gofood_url TEXT;
