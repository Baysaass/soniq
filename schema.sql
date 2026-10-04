-- ====================================================================
-- SONIQ STORE — DATABASE SCHEMA (PostgreSQL / Supabase)
-- ====================================================================
-- Энэхүү SQL-ийг Supabase -> SQL Editor (эсвэл PostgreSQL / Neon DB) дээр
-- шууд хуулан ажиллуулахад бүх хүснэгт, индексүүд автоматаар үүснэ.
-- ====================================================================

-- 1. PRODUCTS TABLE (Бүтээгдэхүүнүүд)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT DEFAULT '',
  category VARCHAR(50) DEFAULT 'sfx',
  badge VARCHAR(50) DEFAULT 'NEW',
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 1,
  price_mnt INTEGER NOT NULL DEFAULT 29900,
  original_price_mnt INTEGER NOT NULL DEFAULT 89000,
  price_usd NUMERIC(6, 2) NOT NULL DEFAULT 9.99,
  original_price_usd NUMERIC(6, 2) NOT NULL DEFAULT 29.00,
  image TEXT NOT NULL DEFAULT '/images/product-morph-3d.png',
  features JSONB DEFAULT '[]'::jsonb,
  compatibility JSONB DEFAULT '["Premiere Pro", "DaVinci Resolve", "CapCut"]'::jsonb,
  format VARCHAR(100) DEFAULT 'WAV 24-bit / 96kHz Lossless',
  file_size VARCHAR(50) DEFAULT '1.2 GB',
  download_count VARCHAR(50) DEFAULT '0+ таталт',
  default_wetransfer_link TEXT DEFAULT '',
  sample_video_url TEXT DEFAULT '',
  r2_key TEXT DEFAULT '',
  preview_sound_type VARCHAR(50) DEFAULT 'whoosh',
  is_bundle BOOLEAN DEFAULT FALSE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексүүд
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_bundle ON products (is_bundle);

-- 2. ORDERS TABLE (Захиалгууд)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) DEFAULT '',
  customer_notes TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount_mnt INTEGER NOT NULL,
  total_amount_usd NUMERIC(6, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MNT',
  status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'CANCELLED'
  payment_method VARCHAR(50) DEFAULT 'KHAN_BANK',
  transfer_reference VARCHAR(100) DEFAULT '',
  receipt_note TEXT DEFAULT '',
  wetransfer_link TEXT DEFAULT '',
  r2_key TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  admin_notes TEXT DEFAULT ''
);

-- Индексүүд
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);

-- 3. STORE_SETTINGS TABLE (Дэлгүүрийн тохиргоо)
CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  store_name VARCHAR(255) DEFAULT 'SONIQ STORE',
  subdomain VARCHAR(255) DEFAULT 'shop.soniq.click',
  currency_default VARCHAR(10) DEFAULT 'MNT',
  admin_passcode TEXT NOT NULL DEFAULT 'Amirda700+',
  announcement_text TEXT DEFAULT 'Бүх багц 85% хямдралтай · WeTransfer болон R2 шууд таталт',
  bank_info JSONB DEFAULT '{
    "bankName": "Хаан Банк (Khan Bank)",
    "accountNumber": "5608120471",
    "accountHolder": "Өсөхбаяр",
    "qpayShortcode": "QPAY-SONIQ",
    "supportInstagram": "https://www.instagram.com/_baysaa_notfound/",
    "supportTelegram": "https://t.me/baysaa_vfx"
  }'::jsonb,
  default_bundle_wetransfer TEXT DEFAULT '',
  categories JSONB DEFAULT '[
    {"id": "sfx", "name": "Sound FX"},
    {"id": "luts", "name": "LUTs & Өнгө"},
    {"id": "plugins", "name": "Plugins & Presets"},
    {"id": "templates", "name": "Templates & Fonts"},
    {"id": "program", "name": "Program"}
  ]'::jsonb,
  r2_config JSONB DEFAULT '{
    "accountId": "",
    "accessKeyId": "",
    "secretAccessKey": "",
    "bucketName": "soniq-store",
    "publicDomain": ""
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Хэрэв хүснэгт аль хэдийн үүссэн бол categories болон r2_config багануудыг нэмэх
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS categories JSONB;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS r2_config JSONB;

-- Хэрэв products хүснэгт аль хэдийн үүссэн бол дутуу багануудыг нөхөж нэмэх
ALTER TABLE products ADD COLUMN IF NOT EXISTS notice TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS r2_key TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sample_video_url TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS preview_sound_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN DEFAULT FALSE;

-- Анхдагч тохиргооны мөр оруулах (Хэрэв байхгүй бол)
INSERT INTO store_settings (id, admin_passcode)
VALUES ('default', 'Amirda700+')
ON CONFLICT (id) DO NOTHING;

-- RLS (Row Level Security) тохиргоо (Supabase-д зориулсан)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Бүтээгдэхүүн унших, засах, нэмэх эрхүүд (Public read, Full access)
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on products" ON products FOR ALL USING (true);
-- Хэрэв anon key ашиглаж байгаа бол админ үйлдлүүдийг зөвшөөрөх
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow anon full access on products') THEN
    CREATE POLICY "Allow anon full access on products" ON products FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE POLICY "Allow service role full access on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read own order by id" ON orders FOR SELECT USING (true);

CREATE POLICY "Allow service role full access on settings" ON store_settings FOR ALL USING (true);
CREATE POLICY "Allow public read on settings" ON store_settings FOR SELECT USING (true);
