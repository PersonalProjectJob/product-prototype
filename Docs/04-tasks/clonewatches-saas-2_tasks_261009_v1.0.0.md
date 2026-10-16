---
type: doc
title: "Tasks Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS"
status: current
area: platform
created: 2026-10-09
owner: lead@vlinkpay.com
master_doc: clonewatches-saas-2_master_261009_v1.0.0.md
product_doc: clonewatches-saas-2_product_261009_v1.0.0.md
engineering_doc: clonewatches-saas-2_engineering_261009_v1.0.0.md
qa_doc: clonewatches-saas-2_qa_261009_v1.0.0.md
approved_on: 2026-10-09
approved_by: "@user"
---

# Tasks Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS

## 1. Task Breakdown & Implementation Checklist

### Task 1: Crawler Engine Implementation & Full Catalog Extraction
- [x] T1.1: Quét danh mục thương hiệu và thu thập 991 URL sản phẩm từ `https://www.vsfwatch.cc`.
- [ ] T1.2: Viết script Node.js concurrency crawler `scripts/crawl-catalog.mjs` bóc tách model sản phẩm sạch từ Base64 `_BBDBZAD_`.
- [ ] T1.3: Chuẩn hóa dữ liệu 2 variants (Swiss Movement vs VS/Clean 1:1), giá tiền, CDN images, specs, description.
- [ ] T1.4: Xuất file master data `src/data/crawled_watches.json` và file bảng tính `public/clonewatches_master_catalog.csv`.

### Task 2: Google Sheets Real-time Data Service & Sync Hook
- [ ] T2.1: Xây dựng service `src/services/googleSheetsService.js` xử lý đọc endpoint GViz JSON và parse thành cấu trúc bảng.
- [ ] T2.2: Tích hợp cơ chế SWR (Stale-While-Revalidate) và Fallback Snapshot trong `src/context/StoreContext.jsx`.
- [ ] T2.3: Thêm state quản lý Google Sheet ID, nút Trigger Sync và chỉ báo trạng thái kết nối.

### Task 3: Storefront Multi-variant Selector & Dynamic Price UI
- [ ] T3.1: Nâng cấp `src/components/ProductCard.jsx` hiển thị bộ chọn nhanh 2 biến thể (Swiss vs VSF/Clean) kèm cập nhật giá tức thì.
- [ ] T3.2: Nâng cấp `src/components/ProductQuickViewModal.jsx` với bộ chọn 2 biến thể chi tiết, bảng specs và mô tả đầy đủ.
- [ ] T3.3: Cập nhật `src/components/CartDrawer.jsx` và `src/components/OnePageCheckout.jsx` ghi nhận chính xác biến thể đã chọn.

### Task 4: Admin CMS Dashboard (`/admin`) Implementation
- [ ] T4.1: Xây dựng component `src/components/admin/AdminDashboard.jsx` với màn hình đăng nhập PIN (`888888`).
- [ ] T4.2: Xây dựng bảng quản lý sản phẩm với tìm kiếm, lọc thương hiệu, phân trang và tính năng sửa giá nhanh (Inline Edit).
- [ ] T4.3: Xây dựng modal chỉnh sửa chi tiết sản phẩm (sửa 2 variants, kéo thả ảnh, specs builder, mô tả).
- [ ] T4.4: Xây dựng tab Settings: cấu hình Google Sheet ID và kiểm tra Real-time sync.
- [ ] T4.5: Xây dựng chức năng Export CSV và Import CSV.
- [ ] T4.6: Tích hợp route toggle hoặc hash route `#/admin` trên thanh điều hướng và giao diện chính.

### Task 5: QA Testing, Build Verification & Documentation Handoff
- [ ] T5.1: Kiểm thử toàn bộ 10 test case trong QA Document.
- [ ] T5.2: Chạy `npm run build` xác nhận đóng gói 0 lỗi.
- [ ] T5.3: Cập nhật nhật ký tiến độ `_PROGRESS.md`.
- [ ] T5.4: Soạn thảo tài liệu bàn giao ngắn gọn (Client Handoff Guide) cho khách hàng.
