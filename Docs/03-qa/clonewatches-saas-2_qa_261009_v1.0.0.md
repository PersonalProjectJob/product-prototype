---
type: doc
title: "QA Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS"
status: current
area: platform
created: 2026-10-09
owner: qa@vlinkpay.com
master_doc: clonewatches-saas-2_master_261009_v1.0.0.md
product_doc: clonewatches-saas-2_product_261009_v1.0.0.md
engineering_doc: clonewatches-saas-2_engineering_261009_v1.0.0.md
approved_on: 2026-10-09
approved_by: "@user"
---

# QA Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS

## 1. Test Strategy & Scope
- **Mục tiêu**: Kiểm thử tính toàn vẹn của dữ liệu cào từ `vsfwatch.cc`, tính ổn định của cơ chế Real-time Google Sheets, khả năng chuyển đổi 2 variants trên giao diện và tính thân thiện của trang quản trị `/admin`.
- **Phạm vi kiểm thử**:
  - Layer 1: Data Integrity (Kiểm tra dữ liệu cào 991 sản phẩm, giá 2 variants, link ảnh CDN, specs).
  - Layer 2: Google Sheets Sync Engine (Kiểm tra đọc GViz JSON feed, xử lý lỗi mạng, Fallback snapshot).
  - Layer 3: Storefront Multi-variant Flow (Kiểm tra chọn variant, đổi giá, thêm vào giỏ, Checkout).
  - Layer 4: Admin CMS Dashboard (Kiểm tra xác thực PIN, inline edit giá, sửa chi tiết, export/import CSV).
  - Layer 5: Build & Performance Verification (`npm run build` 0 lỗi, bundle size, HMR dev server).

---

## 2. Test Cases Specification

| Test ID | Hạng mục kiểm thử | Các bước thực hiện | Kết quả mong đợi | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Crawler Execution | Chạy `node scripts/crawl-catalog.mjs` quét danh sách URL | Cào thành công sản phẩm, không crash, xuất file `crawled_watches.json` và `.csv` | PASS |
| **TC-02** | 2-Variant Extraction | Kiểm tra bản ghi ngẫu nhiên (Rolex Submariner, Daytona) | Trích xuất đủ 2 biến thể: Swiss Movement và VS/Clean 1:1 kèm giá số nguyên | PASS |
| **TC-03** | Google Sheets Parser | Truyền mock response GViz vào parser service | Trích xuất thành công mảng sản phẩm sạch, tự động làm sạch ký tự lạ | PASS |
| **TC-04** | Fallback Mechanism | Ngắt kết nối mạng hoặc truyền sai Sheet ID | Website tự động sử dụng Fallback snapshot, không crash, không trắng trang | PASS |
| **TC-05** | Variant Switching UI | Bấm chọn giữa Variant 1 và Variant 2 trên thẻ SP hoặc Modal | Giá tiền hiển thị tự động nhảy tương ứng với variant được chọn | PASS |
| **TC-06** | Cart & Checkout Sync | Chọn Variant 2 và thêm vào giỏ hàng | Giỏ hàng và One-Page Checkout hiển thị đúng tên variant và giá tiền của variant đó | PASS |
| **TC-07** | Admin Authentication | Truy cập trang Admin và nhập mã PIN `888888` | Mở khóa thành công bảng quản trị; nhập sai mã PIN báo lỗi rõ ràng | PASS |
| **TC-08** | Admin Inline Edit | Nhấp đúp vào ô giá trên bảng `/admin` và nhập giá mới | Giá cập nhật tức thì trên bảng và phản ánh ra giao diện mặt trước | PASS |
| **TC-09** | CSV Export / Import | Bấm nút "Xuất CSV" $\rightarrow$ chỉnh sửa $\rightarrow$ bấm "Nhập CSV" | File CSV tải về đầy đủ cột; nạp lại cập nhật thành công dữ liệu | PASS |
| **TC-10** | Production Build | Chạy `npm run build` | Đóng gói thành công với 0 lỗi, 0 cảnh báo nghiêm trọng | PASS |
