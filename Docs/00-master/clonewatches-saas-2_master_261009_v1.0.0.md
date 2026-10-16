---
type: doc
title: "Master Document: CloneWatches 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS"
status: current
area: platform
created: 2026-10-09
owner: dev@vlinkpay.com
plan_status: active
approved_on: 2026-10-09
approved_by: "@user"
---

# Master Document: CloneWatches 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS

## Metadata
- **Feature ID**: clonewatches-saas-2
- **Branch Name**: feature/clonewatches-saas-2_catalog-crawler-sheet-admin
- **File Naming Convention**: clonewatches-saas-2_master_261009_v1.0.0.md
- **Created Date**: 2026-10-09 09:15
- **Last Updated**: 2026-10-09 09:15
- **Current Version**: v1.0.0
- **Author**: @Antigravity-PM-Lead
- **Status**: Approved
- **Approved By**: @user (2026-10-09)

---

## 1. Feature Overview

### Problem Statement
Sau khi hoàn thiện giao diện mặt trước (Storefront) bám sát Figma Design ([Watch-Web Node 22-253](https://www.figma.com/design/THIiUDHrnt90hYVVwRjwNR/Watch-Web?node-id=22-253&t=PULqxkfq8c4qOD89-4)), hệ thống cần được nạp toàn bộ kho dữ liệu thực tế từ trang mẫu `https://www.vsfwatch.cc` (991 sản phẩm với đầy đủ ảnh, tên, 2 variants giá, specs thông số, mô tả). 
Đồng thời, theo yêu cầu nghiệp vụ bàn giao (Handoff) cho khách hàng không rành kỹ thuật:
1. **Không sử dụng database server cồng kềnh**: Loại bỏ chi phí duy trì backend, tránh rủi ro quản trị server.
2. **Google Sheets làm cơ sở dữ liệu duy nhất (Single Source of Truth - SSoT)**: Khách hàng toàn quyền sở hữu file Google Sheet trên tài khoản Google Drive của họ.
3. **Cơ chế Real-time Check mượt mà**: Website Frontend kết nối trực tiếp với Google Sheets để tự động phát hiện và đồng bộ thay đổi giá/kho trong thời gian thực mà không cần F5.
4. **Phân hệ Admin CMS trực quan (`/admin`)**: Cung cấp giao diện quản trị sang trọng, dễ dùng cho khách hàng chỉnh sửa sản phẩm, đổi giá 2 variants, xuất/nhập Excel và đồng bộ 2 chiều với Google Sheets.

### Goals & Objectives
1. **Full Catalog Crawler Engine**: Script tự động cào sạch và chuẩn hóa 991 sản phẩm từ `https://www.vsfwatch.cc` (Title, SPU, 2 Variants: Swiss Movement vs VS/Clean 1:1, hình ảnh CDN, thông số specs chi tiết, mô tả HTML).
2. **Master Google Sheet Template**: Xuất dữ liệu cào được ra file bảng tính chuẩn hóa (CSV/Excel) để khách tạo Google Sheet trên Google Drive bằng 1 click.
3. **Frontend Real-time Google Sheets Engine**:
   - Sử dụng Google GViz JSON endpoint đọc dữ liệu không cần API key.
   - Cơ chế Stale-While-Revalidate (SWR) tải tức thì 0.05s kèm background auto-sync.
   - Real-time Gatekeeper tại các điểm chạm quan trọng: Quick View, Cart Drawer, Checkout để đảm bảo giá và trạng thái kho luôn chuẩn xác 100%.
   - Fallback Snapshot: Đảm bảo website hoạt động ổn định 24/7 ngay cả khi kết nối Google Sheet gặp sự cố.
4. **Admin CMS Dashboard (`/admin`)**:
   - Giao diện quản trị phong cách cao cấp, bảo mật bằng mã PIN.
   - Bảng quản lý 991 sản phẩm với tìm kiếm, lọc theo brand, công tắc Bật/Ẩn, chỉnh sửa nhanh giá trực tiếp (Inline Edit).
   - Form chỉnh sửa chi tiết: 2 variants, thư viện ảnh kéo-thả, specs key-value builder, rich text editor.
   - Cài đặt Google Sheet Sync: Nhập Sheet ID để kết nối trang web với bảng tính của khách.
   - Tính năng Xuất file Excel / Nhập từ file Excel tiện lợi.

---

## 2. Scope

### In-Scope
- Xây dựng Node.js fast-crawler bóc tách 991 sản phẩm từ `https://www.vsfwatch.cc`.
- Tạo dataset `crawled_watches.json` và file xuất bảng tính `clonewatches_master_catalog.xlsx` / `.csv`.
- Xây dựng Data Service & Hook `useGoogleSheetsSync` cho Frontend React.
- Cập nhật StoreContext để quản lý trạng thái động (kết nối Sheet + Fallback snapshot).
- Cập nhật `ProductCard` và `ProductQuickViewModal` hiển thị lựa chọn 2 Variants và tính năng cập nhật giá động.
- Xây dựng trang `/admin` gồm:
  - Màn hình đăng nhập Admin PIN code.
  - Dashboard tổng quan (Tổng SP, số thương hiệu, trạng thái đồng bộ).
  - Bảng quản lý sản phẩm (Search, Brand Filter, Inline Price Edit, Toggle Show/Hide).
  - Modal chỉnh sửa chi tiết sản phẩm (2 Variants, Specs Builder, Image Gallery).
  - Màn hình Settings kết nối Google Sheet ID và kiểm tra Real-time.
  - Chức năng Export CSV / Import CSV.

### Out-of-Scope
- Backend SQL/Postgres server độc lập (theo chỉ đạo kiến trúc FE-only dùng Google Sheets).
- Thanh toán gateway thật qua ngân hàng (vẫn giữ mock crypto/card/wise checkout của SaaS).

---

## 3. Timeline & Phases

- **Phase 0: Architecture & Documentation** (Master -> Product -> Engineering -> QA -> Tasks) - Hoàn thành.
- **Phase 1: Catalog Crawl & Google Sheet Template Export** - Thực thi cào 991 sản phẩm và xuất file chuẩn hóa.
- **Phase 2: Frontend Real-time Engine & Multi-variant UI** - Hook đồng bộ Google Sheets, SWR cache, selector 2 variants.
- **Phase 3: Admin CMS Portal (`/admin`)** - Quản trị sản phẩm, chỉnh sửa 2 variants, kết nối Sheet, import/export.
- **Phase 4: QA & Verification** - Kiểm thử tích hợp, test real-time update, build PASS 100%.
