---
type: doc
title: "Product Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS"
status: current
area: platform
created: 2026-10-09
owner: product@vlinkpay.com
master_doc: clonewatches-saas-2_master_261009_v1.0.0.md
approved_on: 2026-10-09
approved_by: "@user"
---

# Product Document: 991-Catalog Crawler, Google Sheets Real-time SSoT & Admin CMS

## 1. User Personas & Journey

### Persona 1: Chủ shop bán đồng hồ (Shop Owner / Admin)
- **Mục tiêu**: Toàn quyền kiểm soát danh mục sản phẩm, chủ động sửa giá 2 variants (bản Swiss Movement và bản VS/Clean 1:1), cập nhật tồn kho, thêm mẫu mới.
- **Nỗi đau**: Không biết lập trình, sợ thao tác với database phức tạp, muốn dùng Google Drive/Excel thân thuộc trên điện thoại hoặc giao diện web đơn giản.
- **Hành trình**:
  1. Nhận bàn giao file Google Sheet trên Google Drive cá nhân.
  2. Dán link/ID Sheet vào mục Cài đặt trên `/admin`.
  3. Mở app Google Sheets trên điện thoại đổi giá chiếc Daytona từ `$780` thành `$820` $\rightarrow$ Website tự nhảy giá mới.
  4. Hoặc đăng nhập `/admin` trên máy tính bằng mã PIN, dùng giao diện visual để chỉnh sửa thông số và kéo-thả ảnh.

### Persona 2: Khách mua hàng quốc tế (Horology Buyer)
- **Mục tiêu**: Xem thông tin chi tiết, hình ảnh sắc nét, chọn lựa giữa 2 phiên bản máy (Swiss vs VSF/Clean), kiểm tra thông số kỹ thuật chuẩn và mua hàng.
- **Hành trình**:
  1. Lướt xem danh mục theo hãng (Rolex, Omega, Patek Philippe, Audemars Piguet,...).
  2. Bấm vào sản phẩm $\rightarrow$ Xem modal/page chi tiết: chuyển đổi qua lại giữa 2 Variant để so sánh giá.
  3. Thêm vào giỏ và thanh toán với giá real-time chính xác nhất.

---

## 2. Product Requirements & Acceptance Criteria

### PR-01: Full Catalog Crawler & Normalization
- **AC-01.1**: Quét sạch toàn bộ 991 sản phẩm từ `https://www.vsfwatch.cc`.
- **AC-01.2**: Trích xuất chuẩn xác 100%: Tên, Thương hiệu, Bộ sưu tập, SPU, 2 Variants kèm giá, Mảng ảnh CDN, Bảng Specs, Mô tả HTML.
- **AC-01.3**: Xuất file master data `clonewatches_master_catalog.csv` và `crawled_watches.json` định dạng chuẩn quốc tế.

### PR-02: Google Sheets Data Model & Synchronizer
- **AC-02.1**: Bảng tính gồm đầy đủ các cột: `ID`, `Brand`, `Collection`, `Name`, `Variant 1 Name`, `Variant 1 Price`, `Variant 2 Name`, `Variant 2 Price`, `Primary Image`, `Gallery Images`, `Movement`, `Case Diameter`, `Material`, `Water Resistance`, `Description`, `Status`, `Stock`.
- **AC-02.2**: Frontend đọc Google Sheet qua Google GViz API không cần API key.
- **AC-02.3**: Cơ chế SWR (Stale-While-Revalidate) hiển thị tức thì < 50ms từ bộ nhớ cache và âm thầm cập nhật thay đổi từ Google Sheet.
- **AC-02.4**: Fallback Snapshot: nếu mất mạng hoặc Google Sheets bị nghẽn, web vẫn hoạt động trơn tru với dữ liệu đã lưu.

### PR-03: Multi-variant UI on Storefront
- **AC-03.1**: Trên `ProductCard` và `ProductQuickViewModal`, hiển thị bộ chọn 2 biến thể (Pill selector):
  - *Option 1*: Swiss Movement (Giá hiển thị tương ứng)
  - *Option 2*: VS / Clean 1:1 Super Clone (Giá hiển thị tương ứng)
- **AC-03.2**: Khi chuyển variant, giá tiền và trạng thái giỏ hàng tự động cập nhật ngay lập tức.
- **AC-03.3**: Hiển thị bảng Technical Specs rõ ràng (Đường kính, Máy, Chất liệu, Kính, Kháng nước).

### PR-04: Admin CMS Dashboard (`/admin`)
- **AC-04.1**: Đường dẫn truy cập `/admin`, bảo mật bằng mã PIN (mặc định: `888888` hoặc do chủ shop đổi).
- **AC-04.2**: Bảng sản phẩm hiển thị ảnh thumbnail, tên, hãng, giá 2 variants, nút gạt Bật/Ẩn, và tính năng nhấp đúp sửa giá trực tiếp (Inline Edit).
- **AC-04.3**: Modal chỉnh sửa chi tiết sản phẩm: form sửa giá 2 variants, thông số kỹ thuật (Specs Builder), kéo thả quản lý ảnh.
- **AC-04.4**: Trang Cài đặt Google Sheet Sync: dán `Sheet ID`, có nút "Kiểm tra kết nối" và "Đồng bộ ngay".
- **AC-04.5**: Nút "Xuất Excel/CSV" và "Nhập file Excel/CSV" để chủ shop chỉnh sửa hàng loạt ngoại tuyến.
