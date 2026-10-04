-- ====================================================================
-- SONIQ STORE — MIGRATION SCRIPT (Supabase / PostgreSQL)
-- Огноо: 2026-10-04
-- Заавар: Supabase -> SQL Editor цонхонд энэ кодыг бүхлээр нь хуулж (Paste)
-- "Run" товчийг дарж ажиллуулна. Одоо байгаа өгөгдлийг устгахгүй, зөвхөн
-- дутуу багана болон эрхүүдийг нөхөж нэмнэ.
-- ====================================================================

-- 1. PRODUCTS ХҮСНЭГТИЙН ДУТУУ БАГАНУУДЫГ НӨХӨХ
ALTER TABLE products ADD COLUMN IF NOT EXISTS notice TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS r2_key TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sample_video_url TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS preview_sound_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN DEFAULT FALSE;

-- Products индексүүд
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_bundle ON products (is_bundle);


-- 2. ORDERS ХҮСНЭГТИЙН ДУТУУ БАГАНУУДЫГ НӨХӨХ
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wetransfer_link TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS r2_key TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transfer_reference VARCHAR(100) DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_note TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Orders индексүүд
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);


-- 3. STORE_SETTINGS ХҮСНЭГТИЙН ДУТУУ БАГАНУУДЫГ НӨХӨХ
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[
  {"id": "sfx", "name": "Sound FX"},
  {"id": "luts", "name": "LUTs & Өнгө"},
  {"id": "plugins", "name": "Plugins & Presets"},
  {"id": "templates", "name": "Templates & Fonts"},
  {"id": "program", "name": "Program"}
]'::jsonb;

ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS r2_config JSONB DEFAULT '{
  "accountId": "",
  "accessKeyId": "",
  "secretAccessKey": "",
  "bucketName": "soniq-store",
  "publicDomain": ""
}'::jsonb;

ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS announcement_text TEXT DEFAULT 'Бүх багц 85% хямдралтай · WeTransfer шууд таталт';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS default_bundle_wetransfer TEXT DEFAULT '';

-- Анхдагч тохиргооны мөр байхгүй бол нэмэх
INSERT INTO store_settings (id, admin_passcode)
VALUES ('default', 'Amirda700+')
ON CONFLICT (id) DO NOTHING;


-- 4. ROW LEVEL SECURITY (RLS) БОЛОН ХАНДАХ ЭРХҮҮДИЙГ ТОХИРУУЛАХ
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Products RLS бодлогууд
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read on products') THEN
    CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow service role full access on products') THEN
    CREATE POLICY "Allow service role full access on products" ON products FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow anon full access on products') THEN
    CREATE POLICY "Allow anon full access on products" ON products FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Orders RLS бодлогууд
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow service role full access on orders') THEN
    CREATE POLICY "Allow service role full access on orders" ON orders FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public insert on orders') THEN
    CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public read own order by id') THEN
    CREATE POLICY "Allow public read own order by id" ON orders FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow anon full access on orders') THEN
    CREATE POLICY "Allow anon full access on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Store Settings RLS бодлогууд
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Allow public read on settings') THEN
    CREATE POLICY "Allow public read on settings" ON store_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Allow service role full access on settings') THEN
    CREATE POLICY "Allow service role full access on settings" ON store_settings FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Allow anon full access on settings') THEN
    CREATE POLICY "Allow anon full access on settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Шалгах: Хүснэгтүүдийн багануудын төлөвийг харуулах
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('products', 'orders', 'store_settings')
ORDER BY table_name, ordinal_position;
