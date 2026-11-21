-- Migration: 20261121000001_init_catalog_v4.sql
-- Feature: clonewatches-saas-3 (Catalog V4 Migration — Supabase Postgres + Cloudflare R2 Media Storage)

-- 1. Bảng products (SSoT cho cả 773 Product V4 và các SP Legacy từ CMS cũ)
CREATE TABLE IF NOT EXISTS public.products (
  product_id          TEXT PRIMARY KEY,                -- 'P000001' (V4) hoặc 'LEGACY-SPU-1003' (CMS cũ không khớp)
  family_id           TEXT,
  brand               TEXT NOT NULL DEFAULT '',
  collection          TEXT NOT NULL DEFAULT '',
  model               TEXT NOT NULL DEFAULT '',
  reference           TEXT NOT NULL DEFAULT '',
  title               TEXT NOT NULL,
  nickname            TEXT,                            -- BR-08: nhãn mô tả kiểu dáng
  dial_color          TEXT,
  case_finish         TEXT,
  bracelet_or_strap   TEXT,
  size_mm             TEXT,
  case_material       TEXT,
  media_readiness     TEXT NOT NULL DEFAULT 'web_ready',
  export_status       TEXT NOT NULL DEFAULT 'export_ready'
                      CHECK (export_status IN ('export_ready', 'held_for_review', 'insufficient_media')),
  publication_status  TEXT NOT NULL DEFAULT 'unpublished'
                      CHECK (publication_status IN ('unpublished', 'published')),
  hero_image          TEXT,                            -- relative path: 'assets/P000001/P000001-front-01.webp'
  image_count         INTEGER NOT NULL DEFAULT 0,
  video_count         INTEGER NOT NULL DEFAULT 0,

  -- Trường thương mại & thông số (kế thừa từ CMS cũ hoặc Admin nhập)
  spu                 TEXT,
  legacy_cms_id       TEXT,
  variant1_name       TEXT NOT NULL DEFAULT 'Swiss Movement',
  variant1_price      NUMERIC(12,2),
  variant2_name       TEXT NOT NULL DEFAULT 'VS / Clean 1:1 Super Clone',
  variant2_price      NUMERIC(12,2),
  price_status        TEXT NOT NULL DEFAULT 'missing'
                      CHECK (price_status IN ('missing', 'auto_matched', 'crawled', 'confirmed')),
  price_source        TEXT
                      CHECK (price_source IS NULL OR price_source IN ('admin', 'cms_legacy', 'crawl')),
  match_confidence    NUMERIC(4,3),                    -- 0.000 .. 1.000
  match_notes         TEXT,
  stock               TEXT NOT NULL DEFAULT 'IN_STOCK'
                      CHECK (stock IN ('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER')),
  movement            TEXT,
  water_resistance    TEXT,
  description_html    TEXT,
  data_sheet          JSONB NOT NULL DEFAULT '{}'::jsonb,
  qc_video_url        TEXT,
  legacy              BOOLEAN NOT NULL DEFAULT FALSE,  -- BR-11: SP CMS cũ ngoài V4 tạm ẩn

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          TEXT
);

-- Ràng buộc BR-06/BR-07 ở tầng DB: không thể chuyển sang 'published' nếu thiếu điều kiện (Chế độ Giá: Liên hệ — không bắt buộc variant1_price)
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_publish_gate_chk;

ALTER TABLE public.products
  ADD CONSTRAINT products_publish_gate_chk CHECK (
    publication_status <> 'published'
    OR (
      legacy = FALSE
      AND export_status = 'export_ready'
      AND image_count >= 4
      AND btrim(brand) <> ''
    )
  );

-- 2. Bảng product_images (6.870 dòng từ data/images.csv + asset_manifest.json)
CREATE TABLE IF NOT EXISTS public.product_images (
  image_id      TEXT PRIMARY KEY,                      -- 'I003601'
  product_id    TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  role          TEXT NOT NULL,                         -- front, side, back, attachment, detail, angle, wrist
  position      INTEGER NOT NULL,                      -- 1..N (BR-03)
  src           TEXT NOT NULL,                         -- 'assets/P000001/P000001-front-01.webp'
  width         INTEGER,
  height        INTEGER,
  output_sha256 TEXT,
  output_bytes  INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bảng product_videos (39 dòng từ data/videos.csv — BR-04: poster không tính vào product_images)
CREATE TABLE IF NOT EXISTS public.product_videos (
  video_id      TEXT PRIMARY KEY,                      -- 'V000579'
  product_id    TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  src           TEXT NOT NULL,                         -- 'assets/P000009/P000009-video-000579.mp4'
  poster        TEXT NOT NULL,                         -- 'assets/P000009/P000009-video-000579-poster.webp'
  width         INTEGER,
  height        INTEGER,
  duration      NUMERIC(10,5),
  video_sha256  TEXT,
  poster_sha256 TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bảng product_aliases (20 cặp từ data/product_aliases.json)
CREATE TABLE IF NOT EXISTS public.product_aliases (
  alias_product_id     TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bảng nickname_evidence (BR-09: chỉ Admin đọc, lưu từ review/nickname_evidence.csv & review_v4.csv)
CREATE TABLE IF NOT EXISTS public.nickname_evidence (
  id                  BIGSERIAL PRIMARY KEY,
  product_id          TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  brand               TEXT,
  nickname            TEXT NOT NULL,
  label_basis         TEXT,                            -- 'named_design' | 'visual_style' | NULL
  evidence_image_ids  TEXT,
  visual_evidence     TEXT,
  comparison_url      TEXT,
  review_version      TEXT NOT NULL DEFAULT 'v4',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Bảng orders & order_items
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code      TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  shipping_address TEXT,
  notes           TEXT,
  currency        TEXT NOT NULL DEFAULT 'USD',
  total_amount    NUMERIC(12,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING_WHATSAPP',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL,
  title         TEXT NOT NULL,
  variant_name  TEXT NOT NULL,
  unit_price    NUMERIC(12,2) NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0)
);

-- 7. Bảng settings & import_batches
CREATE TABLE IF NOT EXISTS public.settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.import_batches (
  batch_id            TEXT PRIMARY KEY,
  source_name         TEXT NOT NULL,
  v4_products_count   INTEGER NOT NULL DEFAULT 0,
  images_count        INTEGER NOT NULL DEFAULT 0,
  videos_count        INTEGER NOT NULL DEFAULT 0,
  auto_matched_count  INTEGER NOT NULL DEFAULT 0,
  missing_price_count INTEGER NOT NULL DEFAULT 0,
  legacy_hidden_count INTEGER NOT NULL DEFAULT 0,
  r2_verified_files   INTEGER NOT NULL DEFAULT 0,
  report_json         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_pub_brand ON public.products(publication_status, legacy, brand);
CREATE INDEX IF NOT EXISTS idx_products_price_status ON public.products(price_status);
CREATE INDEX IF NOT EXISTS idx_product_images_prod_pos ON public.product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_product_videos_prod ON public.product_videos(product_id);

-- Row-Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nickname_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- Policies (Idempotent: drop if exists before create)
DROP POLICY IF EXISTS "anon_read_published_products" ON public.products;
CREATE POLICY "anon_read_published_products" ON public.products
  FOR SELECT TO anon
  USING (publication_status = 'published' AND legacy = FALSE);

DROP POLICY IF EXISTS "auth_all_products" ON public.products;
CREATE POLICY "auth_all_products" ON public.products
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_read_published_images" ON public.product_images;
CREATE POLICY "anon_read_published_images" ON public.product_images
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.product_id = product_images.product_id
      AND p.publication_status = 'published' AND p.legacy = FALSE
  ));

DROP POLICY IF EXISTS "auth_all_images" ON public.product_images;
CREATE POLICY "auth_all_images" ON public.product_images
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_read_published_videos" ON public.product_videos;
CREATE POLICY "anon_read_published_videos" ON public.product_videos
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.product_id = product_videos.product_id
      AND p.publication_status = 'published' AND p.legacy = FALSE
  ));

DROP POLICY IF EXISTS "auth_all_videos" ON public.product_videos;
CREATE POLICY "auth_all_videos" ON public.product_videos
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_read_public_settings" ON public.settings;
CREATE POLICY "anon_read_public_settings" ON public.settings
  FOR SELECT TO anon USING (is_public = TRUE);

DROP POLICY IF EXISTS "auth_all_settings" ON public.settings;
CREATE POLICY "auth_all_settings" ON public.settings
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
CREATE POLICY "anon_insert_orders" ON public.orders
  FOR INSERT TO anon WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;
CREATE POLICY "anon_insert_order_items" ON public.order_items
  FOR INSERT TO anon WITH CHECK (TRUE);

DROP POLICY IF EXISTS "auth_all_orders" ON public.orders;
CREATE POLICY "auth_all_orders" ON public.orders
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "auth_all_order_items" ON public.order_items;
CREATE POLICY "auth_all_order_items" ON public.order_items
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "auth_all_evidence" ON public.nickname_evidence;
CREATE POLICY "auth_all_evidence" ON public.nickname_evidence
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "auth_all_batches" ON public.import_batches;
CREATE POLICY "auth_all_batches" ON public.import_batches
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Table & Sequence Privileges for Supabase PostgREST roles (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;
GRANT SELECT ON public.products, public.product_images, public.product_videos, public.settings TO anon;
GRANT INSERT ON public.orders, public.order_items TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_items_id_seq TO anon;

