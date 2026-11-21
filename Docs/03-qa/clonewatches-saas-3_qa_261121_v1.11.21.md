---
type: doc
title: "QA Document: Catalog V4 Migration — Supabase Postgres + Cloudflare R2 Media Storage"
status: current
area: platform
created: 2026-11-21
owner: qa@vlinkpay.com
master_doc: clonewatches-saas-3_master_261121_v1.11.21.md
product_doc: clonewatches-saas-3_product_261121_v1.11.21.md
engineering_doc: clonewatches-saas-3_engineering_261121_v1.11.21.md
approved_on: 2026-11-21
approved_by: "@user"
---

# QA Document: Catalog V4 Migration — Supabase Postgres + Cloudflare R2 Media Storage

## Metadata
- **Feature ID**: clonewatches-saas-3
- **Branch Name** (đề xuất): feature/clonewatches-saas-3_supabase-r2-catalog-v4
- **File Naming Convention**: clonewatches-saas-3_qa_261121_v1.11.21.md
- **Created Date**: 2026-11-21 15:42
- **Last Updated**: 2026-11-21 15:42
- **Current Version**: v1.11.21
- **Author**: @Antigravity-QA-Tester
- **Status**: Approved
- **Approved By**: @user (2026-11-21)

---

## 1. Test Strategy

### 1.1 Scope & Testing Levels
- **Layer 1 — R2 Media & Database Integrity**: Đối soát số lượng bản ghi thực tế trên Supabase và Cloudflare R2 với `data/catalog.json`, `data/images.csv`, `data/videos.csv`, `data/asset_manifest.json` (773 Product V4, 6.870 ảnh, 39 video, 6.948 file R2 khớp SHA-256).
- **Layer 2 — Business Rules & RLS Security**: Kiểm tra ràng buộc xuất bản (`BR-05`, `BR-06`, `BR-07`), thuật toán tự khớp giá (`BR-10`, `BR-16..18`), ẩn sản phẩm CMS cũ ngoài V4 (`BR-11`), và phân quyền RLS giữa `anon` và Admin.
- **Layer 3 — Storefront & Admin UI E2E Flow**: Kiểm thử hiển thị ảnh từ R2 CDN, thứ tự gallery (`BR-03`), video + poster (`BR-04`), hiển thị nickname + chú thích miễn trừ (`BR-08`), luồng Admin duyệt giá / bật xuất bản, và responsive trên mobile 375px.

### 1.2 Test Environment
- **Supabase Project**: `https://nuhgccxcwlrsbbcxpskn.supabase.co`
- **Cloudflare R2 Bucket**: `watch-saas-media` (phục vụ qua `R2_PUBLIC_URL`)
- **Frontend Build**: Vite 6 + React 18, kiểm thử headless browser ở viewport Desktop (`1440x900`), Tablet (`768x1024`), Mobile (`375x812`).

---

## 2. Test Cases

### TC-01: Toàn vẹn dữ liệu V4 trong Supabase Postgres
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path / Data integrity |
| **Precondition** | Đã chạy migration SQL và script `scripts/supabase-seed-v4.mjs` |

**Steps**:
1. Truy vấn số dòng trong `products` có `legacy = false`.
2. Truy vấn tổng số dòng trong `product_images`, `product_videos`, `product_aliases`.
3. Kiểm tra số Product có `nickname IS NOT NULL AND nickname <> ''`.

**Expected Result**:
- ✅ Có đúng **773** Product V4 (`legacy = false`).
- ✅ Có đúng **6.870** dòng trong `product_images` và **39** dòng trong `product_videos`.
- ✅ Có đúng **128** Product V4 có `nickname`.
- ✅ Không có Product V4 nào có `image_count < 4`.

---

### TC-02: Toàn vẹn 6.948 file Media trên Cloudflare R2 & truy cập CDN
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path / Media delivery |
| **Precondition** | Đã chạy `scripts/r2-upload-v4.mjs` |

**Steps**:
1. Kiểm tra kết quả đối soát `asset_manifest.json` (6.948 file: 6.870 ảnh gallery + 39 video MP4 + 39 poster WebP).
2. Gửi HTTP `HEAD` / `GET` tới `R2_PUBLIC_URL` cho ảnh mẫu (`assets/P000001/P000001-front-01.webp`) và video mẫu (`assets/P000009/P000009-video-000579.mp4`).

**Expected Result**:
- ✅ 6.948 / 6.948 file tồn tại trên bucket `watch-saas-media` với kích thước và SHA-256 khớp manifest.
- ✅ URL công khai trả về HTTP `200 OK` với `Content-Type: image/webp` hoặc `video/mp4`.

---

### TC-03: Thuật toán Auto-Matching Giá & Ẩn Sản phẩm CMS cũ (BR-10, BR-11, BR-16..17)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Business logic |
| **Precondition** | Đã chạy `scripts/supabase-seed-v4.mjs` |

**Steps**:
1. Kiểm tra bảng `import_batches` và phân bố `price_status` của 773 Product V4.
2. Kiểm tra 15 Product V4 trống `brand`.
3. Kiểm tra các sản phẩm CMS cũ thuộc Panerai, Breitling, Cartier.

**Expected Result**:
- ✅ Các Product V4 khớp rõ ràng có `price_status = 'auto_matched'`, `price_source = 'cms_legacy'`, `variant1_price > 0`, `match_confidence > 0`.
- ✅ 15 Product V4 trống `brand` có `price_status = 'missing'` và `publication_status = 'unpublished'`.
- ✅ Toàn bộ sản phẩm CMS cũ ngoài V4 (Panerai, Breitling, Cartier, v.v.) có `legacy = true` và `publication_status = 'unpublished'`.

---

### TC-04: Chốt chặn Xuất bản (Publish Gate — BR-05, BR-06, BR-07)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Edge case / Error handling |
| **Precondition** | Có Product thiếu `brand` (ví dụ `P000039` nếu trống brand) hoặc `price_status = 'missing'` |

**Steps**:
1. Thử cập nhật `publication_status = 'published'` cho một Product có `brand = ''` hoặc `variant1_price IS NULL`.
2. Trên giao diện `/admin`, kiểm tra nút Xuất bản ở dòng Product thiếu giá hoặc thiếu brand.

**Expected Result**:
- ✅ Database từ chối bằng constraint `products_publish_gate_chk` (và UI khóa nút Xuất bản kèm lý do rõ ràng).
- ✅ Khi điền đủ `brand`, `variant1_price > 0`, `price_status IN ('auto_matched', 'confirmed')` và `image_count >= 4`, bật Xuất bản thành công.

---

### TC-05: Phân quyền RLS cho Khách ẩn danh (`anon`)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Security |
| **Precondition** | RLS đã bật trên toàn bộ bảng |

**Steps**:
1. Dùng `SUPABASE_ANON_KEY` gọi `GET /rest/v1/products?select=product_id,publication_status,legacy`.
2. Dùng `SUPABASE_ANON_KEY` gọi `PATCH /rest/v1/products?product_id=eq.P000001` để thử sửa giá.
3. Dùng `SUPABASE_ANON_KEY` gọi `GET /rest/v1/nickname_evidence` và `GET /rest/v1/orders`.

**Expected Result**:
- ✅ `GET /rest/v1/products` với `anon` chỉ trả về đúng các dòng có `publication_status = 'published'` và `legacy = false` (không lộ sản phẩm `unpublished` hay `legacy`).
- ✅ Lệnh `PATCH` bằng `anon` bị chặn (0 dòng bị sửa hoặc lỗi RLS 401/403).
- ✅ `anon` không đọc được `nickname_evidence` và `orders` (trả về mảng rỗng `[]` hoặc 401/403).

---

### TC-06: Hiển thị Gallery, Video + Poster & Nickname trên Storefront (BR-03, BR-04, BR-08)
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Happy path / UI |
| **Precondition** | Có ít nhất 1 Product có nickname và 1 Product có video được bật `published` |

**Steps**:
1. Mở Storefront, xem thẻ sản phẩm và trang chi tiết của Product đã xuất bản.
2. Kiểm tra thứ tự ảnh trong gallery và ảnh đại diện.
3. Kiểm tra hiển thị badge `nickname` và chú thích miễn trừ.
4. Mở Product có video (ví dụ `P000009`), kiểm tra trình phát video và số lượng ảnh gallery.

**Expected Result**:
- ✅ Ảnh tải từ `R2_PUBLIC_URL`, ảnh đầu tiên (`position = 1`) là `hero_image`, không còn ảnh Unsplash placeholder (`BR-12`).
- ✅ Badge `nickname` hiển thị kèm chú thích *"Tên gọi mô tả kiểu dáng, không xác nhận reference hay tính chính hãng"*.
- ✅ Video phát được từ R2 kèm poster; poster không bị đếm trộn vào danh sách ảnh gallery (`BR-04`).

---

### TC-07: Admin CMS — Lọc, Duyệt giá & Xuất bản đồng bộ tới Storefront
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path / E2E flow |
| **Precondition** | Admin đăng nhập vào `/admin` |

**Steps**:
1. Lọc danh sách theo `Trạng thái giá: Tự khớp (auto_matched)`.
2. Sửa hoặc bấm **Duyệt giá** cho một Product, sau đó bật **Xuất bản**.
3. Tải lại trang Storefront và kiểm tra sản phẩm đó.

**Expected Result**:
- ✅ Giá chuyển sang `confirmed`, trạng thái chuyển sang `published` trong Supabase.
- ✅ Storefront hiển thị sản phẩm với đúng giá và bộ ảnh R2 vừa xuất bản.

---

### TC-08: Responsive Mobile (375x812) & Fallback khi lỗi mạng
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Responsive / Edge case |
| **Precondition** | Ứng dụng chạy trên viewport `375x812` |

**Steps**:
1. Mở Storefront và `/admin` ở kích thước `375x812`, đo `document.documentElement.scrollWidth - window.innerWidth`.
2. Giả lập mất kết nối tới Supabase REST, tải lại Storefront.

**Expected Result**:
- ✅ Không tràn ngang (`docOverflow = 0`) trên cả Storefront và `/admin`.
- ✅ Khi mất kết nối DB, Storefront fallback an toàn, không trắng trang.

---

## 3. Acceptance Criteria (Definition of Done)

- [x] Tất cả 8 Test Cases (TC-01 đến TC-08) đạt PASS.
- [x] 773 Product V4, 6.870 ảnh, 39 video được nạp đầy đủ vào Supabase; 6.948 file media có mặt trên Cloudflare R2 bucket `watch-saas-media`.
- [x] RLS chặn hoàn toàn quyền ghi của `anon` (`anonWriteMutatedRows: 0`) và ẩn toàn bộ sản phẩm `unpublished` / `legacy` khỏi `anon` (`leakedUnpublishedOrLegacyRows: 0`).
- [x] `npm run build` hoàn tất với 0 lỗi.
- [x] Không có khóa bí mật (`SUPABASE_SERVICE_ROLE_KEY`, `R2_SECRET_ACCESS_KEY`) nào xuất hiện trong code nguồn hoặc bundle `dist/`.
- [x] Toàn bộ 5 tài liệu (Master, Product, Engineering, QA, Tasks) được tạo và liên kết chéo đầy đủ.

---

## 4. Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Production Build** | Pass 100%, 0 errors | `npm run build` |
| **Supabase Catalog Query** | < 300ms | Đo thời gian phản hồi `/rest/v1/products` |
| **R2 Image Response** | HTTP 200, `image/webp`, immutable cache header | `HEAD` request tới `R2_PUBLIC_URL` |
| **Mobile Layout Overflow (375px)** | `0px` horizontal overflow | Playwright headless check |

---

## 5. Security Tests

| Test | Steps | Expected |
|------|-------|----------|
| Secret Leak Check | Quét `src/` và `dist/` tìm `sb_secret_`, `R2_SECRET_ACCESS_KEY` | 0 kết quả |
| Anonymous Write Block | Gọi `POST/PATCH/DELETE /rest/v1/products` với `SUPABASE_ANON_KEY` | Bị từ chối bởi RLS |
| Unpublished Isolation | Gọi `GET /rest/v1/products` với `SUPABASE_ANON_KEY` | Không trả về dòng nào có `publication_status = 'unpublished'` hoặc `legacy = true` |

---

## 6. Test Data Requirements

| Data | Source | Purpose |
|------|--------|---------|
| Gói V4 (773 SP, 6.870 ảnh, 39 video) | `C:\Users\AD\Downloads\WEB_DELIVERY_ALL_ASSIGNED_2026-11-16_NICKNAMES_V4` | Nguồn dữ liệu chính để nạp DB và R2 |
| Dữ liệu CMS cũ (991 SP) | `src/data/crawled_watches.json` | Nguồn ghép giá, mô tả, datasheet và danh sách `legacy` |

---

## 7. Environment Setup

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy upload R2 và seed Supabase (đọc khóa từ .env.local)
node scripts/r2-upload-v4.mjs
node scripts/supabase-seed-v4.mjs

# 3. Chạy script kiểm chứng toàn diện
node scripts/verify-v4-migration.mjs

# 4. Build production
npm run build
```

---

## 8. Related Documents
- **Master Doc**: `00-master/clonewatches-saas-3_master_261121_v1.11.21.md`
- **Product Doc**: `01-product/clonewatches-saas-3_product_261121_v1.11.21.md`
- **Engineering Doc**: `02-engineering/clonewatches-saas-3_engineering_261121_v1.11.21.md`
- **Tasks Doc**: `04-tasks/clonewatches-saas-3_tasks_261121_v1.11.21.md`

---

## 9. Changelog

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.11.21 | 2026-11-21 | 15:42 | @Antigravity-QA-Tester | Khởi tạo QA Doc với 8 Test Cases, DoD, Security & Performance checks | @user | Approved |
