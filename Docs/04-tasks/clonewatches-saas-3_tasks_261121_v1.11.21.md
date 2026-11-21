---
type: doc
title: "Tasks Document: Catalog V4 Migration — Supabase Postgres + Cloudflare R2 Media Storage"
status: current
area: platform
created: 2026-11-21
owner: lead@vlinkpay.com
master_doc: clonewatches-saas-3_master_261121_v1.11.21.md
product_doc: clonewatches-saas-3_product_261121_v1.11.21.md
engineering_doc: clonewatches-saas-3_engineering_261121_v1.11.21.md
qa_doc: clonewatches-saas-3_qa_261121_v1.11.21.md
approved_on: 2026-11-21
approved_by: "@user"
---

# Tasks Document: Catalog V4 Migration — Supabase Postgres + Cloudflare R2 Media Storage

## Metadata
- **Feature ID**: clonewatches-saas-3
- **Branch Name** (đề xuất): feature/clonewatches-saas-3_supabase-r2-catalog-v4
- **File Naming Convention**: clonewatches-saas-3_tasks_261121_v1.11.21.md
- **Created Date**: 2026-11-21 15:44
- **Last Updated**: 2026-11-21 15:44
- **Current Version**: v1.11.21
- **Author**: @Antigravity-PM-Lead
- **Status**: Approved
- **Approved By**: @user (2026-11-21)

---

## 1. Task Breakdown & Implementation Checklist

### Phase 0: Documentation Sequence (Master → Product → Engineering → QA → Tasks)
- [x] **T0.1**: Tạo và duyệt `00-master/clonewatches-saas-3_master_261121_v1.11.21.md`.
- [x] **T0.2**: Tạo và duyệt `01-product/clonewatches-saas-3_product_261121_v1.11.21.md`.
- [x] **T0.3**: Tạo `02-engineering/clonewatches-saas-3_engineering_261121_v1.11.21.md`.
- [x] **T0.4**: Tạo `03-qa/clonewatches-saas-3_qa_261121_v1.11.21.md`.
- [x] **T0.5**: Tạo `04-tasks/clonewatches-saas-3_tasks_261121_v1.11.21.md` và liên kết chéo toàn bộ 5 docs.

### Phase 1: Supabase Schema, RLS & Environment Configuration
- [x] **T1.1**: Tạo file migration SQL `supabase/migrations/20261121000001_init_catalog_v4.sql` (các bảng `products`, `product_images`, `product_videos`, `product_aliases`, `nickname_evidence`, `orders`, `order_items`, `settings`, `import_batches` + constraint `products_publish_gate_chk` + RLS).
- [x] **T1.2**: Thi hành DDL lên project Supabase `nuhgccxcwlrsbbcxpskn` qua pooler `aws-1-ap-southeast-1.pooler.supabase.com` và chạy `node scripts/supabase-seed-v4.mjs` nạp toàn bộ 773 Product V4 + 870 SP Legacy + 6.870 ảnh + 39 video + 20 aliases + 128 bằng chứng nickname.
- [x] **T1.3**: Bổ sung biến `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_R2_PUBLIC_URL` vào `.env.local` và tạo `.env.example` (không chứa secret).

### Phase 2: Cloudflare R2 Media Upload Pipeline (6.948 Files)
- [x] **T2.1**: Viết script `scripts/r2-upload-v4.mjs` (đọc `asset_manifest.json`, kiểm tra SHA-256 cục bộ, upload song song 16–24 workers lên bucket `watch-saas-media`, hỗ trợ resume/idempotent).
- [x] **T2.2**: Chạy `scripts/r2-upload-v4.mjs` đẩy toàn bộ 6.870 ảnh gallery + 39 video MP4 + 39 poster WebP lên R2 (**6.948/6.948 file, 1.222,75 MB, 0 lỗi**).
- [x] **T2.3**: Kiểm tra truy cập bucket `watch-saas-media` (6.948 objects xác nhận qua `ListObjectsV2`; thêm banner hướng dẫn trong Admin nếu `R2_PUBLIC_URL` đang để S3 API host thay vì `pub-*.r2.dev`).

### Phase 3: Supabase V4 Seed & Auto-Matching Engine (CMS cũ ↔ V4)
- [x] **T3.1**: Viết script `scripts/supabase-seed-v4.mjs` nạp 773 Product V4, 6.870 ảnh, 39 video, 20 aliases, bằng chứng nickname.
- [x] **T3.2**: Chạy thuật toán Auto-Matching nối giá (`variant1_price`, `variant2_price`), mô tả HTML, datasheet từ 991 sản phẩm CMS cũ sang Product V4 (**757/773 khớp tự động**: 193 khớp trực tiếp + 564 khớp theo bộ sưu tập/thương hiệu đồng giá; **16 Product** để `price_status = 'missing'` gồm 15 Product trống brand và 1 Product Tudor).
- [x] **T3.3**: Chuyển **870** sản phẩm CMS cũ ngoài gói V4 (Panerai, Breitling, Cartier, v.v.) vào trạng thái `legacy = true`, `publication_status = 'unpublished'` (`BR-11`), ghi báo cáo vào `Docs/02-engineering/v4_auto_match_report.json` và snapshot `src/data/v4_catalog_snapshot.json`.

### Phase 4: Frontend Service, Storefront & Admin CMS Upgrade
- [x] **T4.1**: Tạo `src/services/supabaseService.js` (helper `resolveMediaUrl`, đọc/ghi Supabase REST, kiểm tra điều kiện xuất bản `BR-06`).
- [x] **T4.2**: Cập nhật `src/context/StoreContext.jsx` kết nối Supabase + R2 CDN, loại bỏ Google Sheets sync (`D3/D4`).
- [x] **T4.3**: Nâng cấp `src/components/admin/AdminDashboard.jsx` (bộ lọc Xuất bản / Trạng thái giá / Legacy, duyệt giá 1-click & hàng loạt, bật/tắt xuất bản có kiểm tra `BR-06`, màn Báo cáo V4).
- [x] **T4.4**: Nâng cấp `src/components/ProductCard.jsx`, `src/components/ProductQuickViewModal.jsx`, `src/components/product/ProductDetailPage.jsx` (hiển thị ảnh R2, badge `nickname` kèm miễn trừ `BR-08`, trình phát video MP4 + poster `BR-04`).
- [x] **T4.5**: Cập nhật semantic tokens trong `src/index.css`.

### Phase 5: Verification & QA Sign-off
- [x] **T5.1**: Viết và chạy `scripts/verify-v4-migration.mjs` kiểm chứng toàn vẹn dữ liệu V4 & R2.
- [x] **T5.2**: Chạy `npm run build` (PASS, 0 lỗi) và kiểm thử giao diện Playwright headless (Desktop `1440x900` + Mobile `375x812`, `overflow = 0`, `pageErrors = 0`).
- [x] **T5.3**: Cập nhật kết quả thực tế vào QA Doc, Tasks Doc và `_PROGRESS.md`.

---

## 2. Related Documents
- **Master Doc**: `00-master/clonewatches-saas-3_master_261121_v1.11.21.md`
- **Product Doc**: `01-product/clonewatches-saas-3_product_261121_v1.11.21.md`
- **Engineering Doc**: `02-engineering/clonewatches-saas-3_engineering_261121_v1.11.21.md`
- **QA Doc**: `03-qa/clonewatches-saas-3_qa_261121_v1.11.21.md`

---

## 3. Changelog

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.11.21 | 2026-11-21 | 15:44 | @Antigravity-PM-Lead | Khởi tạo Tasks Doc chia 5 Phase triển khai & kiểm thử | @user | Approved |
