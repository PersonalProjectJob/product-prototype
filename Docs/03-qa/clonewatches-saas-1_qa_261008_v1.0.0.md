---
type: doc
title: "QA Document: CloneWatches SaaS Test Plan, Test Cases & Acceptance Criteria"
status: current
area: platform
created: 2026-10-08
owner: dev@vlinkpay.com
plan_status: accepted
approved_on: 2026-10-08
approved_by: "@user"
---

# QA Document: CloneWatches SaaS Test Plan, Test Cases & Acceptance Criteria

## Metadata
- **Feature ID**: clonewatches-saas-1
- **File Naming Convention**: clonewatches-saas-1_qa_261008_v1.0.0.md
- **Created Date**: 2026-10-08 17:21
- **Last Updated**: 2026-10-08 17:21
- **Current Version**: v1.0.0
- **Author**: @Antigravity-QA
- **Status**: Approved
- **Approved By**: @user (2026-10-08)

---

## 1. Test Strategy

### 1.1 Scope
Kiểm thử toàn diện toàn bộ nền tảng CloneWatches SaaS bao gồm:
- **Trải nghiệm thị giác & Thương hiệu**: Đảm bảo chuẩn xác theo trang mẫu đã duyệt (`https://www.vsfwatch.cc/`), palette màu sang trọng, không giật lag.
- **Duyệt & Lọc danh mục (Catalog Discovery)**: Chuyển đổi thương hiệu (Rolex, Patek, AP, Omega), bộ lọc bộ máy Calibre, tìm kiếm thời gian thực.
- **Tương tác Thẻ sản phẩm & Quick View**: Hover ảnh kép (Dual-hover), mở modal xem thông số kỹ thuật, zoom ảnh chi tiết máy.
- **Quản lý Giỏ hàng (Slide-over Cart Drawer)**: Thêm/xóa sản phẩm, cập nhật số lượng, tính toán điều kiện Free Shipping ($500), áp mã giảm giá `SUPERCLONE10`, lưu trữ trạng thái qua `localStorage`.
- **Thanh toán One-Page Checkout**: Điền thông tin giao hàng quốc tế, xác thực form, chọn cổng thanh toán (Crypto -5% discount, Card, Wise), tính toán tổng tiền chính xác theo loại tiền tệ đã chọn.
- **Theo dõi Đơn hàng (Live Order Tracking Portal)**: Tra cứu mã đơn `CW-XXXXXX`, timeline các bước QC & giao vận.
- **Responsive & Đa thiết bị**: Kiểm thử không tràn ngang trên Mobile 320px, 375px, 414px, Tablet 768px và Desktop 1440px.

### 1.2 Testing Levels
- **Unit / Logic Testing**: Kiểm tra thuật toán chuyển đổi tiền tệ, tính tổng giỏ hàng, áp dụng coupon và giảm giá crypto.
- **Component / Integration Testing**: Kiểm tra tương tác giữa Cart Drawer, Quickview Modal và Checkout.
- **End-to-End (E2E) Flow Testing**: Kiểm thử trọn vẹn luồng từ duyệt hàng đến hoàn tất thanh toán và tra cứu đơn hàng.

---

## 2. Test Cases

### TC-01: Bộ chuyển đổi tiền tệ đa quốc gia (Currency Switcher)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path / Data calculation |
| **Precondition** | Người dùng đang ở bất kỳ trang nào trên cửa hàng |

**Steps**:
1. Nhấp vào bộ chọn tiền tệ trên Top Announcement Bar hoặc Navbar.
2. Chọn `EUR` (Tỷ giá 0.92) hoặc `GBP` (Tỷ giá 0.78).
3. Quan sát giá hiển thị trên Thẻ sản phẩm, Modal Quickview và Giỏ hàng.

**Expected Result**:
- Tất cả giá tiền hiển thị đồng bộ chuyển sang ký hiệu tiền tệ đã chọn (€, £) với giá trị được quy đổi chính xác.

---

### TC-02: Bộ lọc danh mục & Tìm kiếm tức thì
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | Danh sách sản phẩm đã được tải |

**Steps**:
1. Nhấp chọn tab thương hiệu "Rolex" hoặc "Patek Philippe".
2. Nhập từ khóa "Submariner" hoặc "Panda" vào thanh tìm kiếm.
3. Kiểm tra số lượng thẻ sản phẩm hiển thị.

**Expected Result**:
- Danh sách sản phẩm lọc tức thì trong < 50ms, hiển thị đúng các mẫu đồng hồ khớp với thương hiệu hoặc từ khóa.

---

### TC-03: Xem nhanh thông số kỹ thuật (Quick View Modal)
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Component interaction |
| **Precondition** | Người dùng rê chuột vào một thẻ đồng hồ |

**Steps**:
1. Nhấp nút "Quick View" trên thẻ sản phẩm.
2. Kiểm tra thông số hiển thị: Vỏ 904L, Kính Sapphire, Bộ máy Swiss Clone Calibre.
3. Thay đổi số lượng và nhấn "Add to Cart".

**Expected Result**:
- Modal mở mượt mà, thông số hiển thị rõ ràng, sản phẩm được thêm vào giỏ hàng và mở Slide-over Cart Drawer.

---

### TC-04: Giỏ hàng Slide-over Cart Drawer & Áp dụng Mã giảm giá
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Business logic & State persistence |
| **Precondition** | Có ít nhất 1 sản phẩm trong giỏ hàng |

**Steps**:
1. Mở Cart Drawer từ góc trên bên phải.
2. Tăng số lượng sản phẩm lên 2.
3. Nhập mã giảm giá `SUPERCLONE10` và nhấn Áp dụng.
4. Kiểm tra thanh tiến trình Free Worldwide Priority Shipping.

**Expected Result**:
- Số lượng và tổng tiền cập nhật ngay lập tức.
- Mã giảm giá giảm 10% trên tổng giá trị phụ (Subtotal).
- Thanh Free Shipping đạt 100% khi tổng đơn >= $500 và hiển thị thông báo "You unlocked Free Priority Express Shipping!".

---

### TC-05: Luồng thanh toán One-Page Checkout & Chiết khấu Crypto
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Full Funnel E2E |
| **Precondition** | Giỏ hàng có sản phẩm, người dùng nhấn "Proceed to Checkout" |

**Steps**:
1. Điều hướng đến màn hình One-Page Checkout.
2. Điền đầy đủ thông tin: Họ tên, Email, Số điện thoại, Quốc gia, Địa chỉ, Mã bưu chính.
3. Chọn phương thức thanh toán "Crypto (USDT / BTC / ETH)".
4. Kiểm tra dòng tóm tắt chiết khấu "Crypto Anonymous Discount (-5%)".
5. Nhấn "Complete Order Securely".

**Expected Result**:
- Form xác thực hợp lệ không báo lỗi.
- Đơn hàng được áp dụng giảm giá thêm 5% cho crypto.
- Hệ thống tạo mã đơn hàng `CW-XXXXXX` và chuyển sang màn hình Đặt hàng thành công (Order Success).

---

### TC-06: Tra cứu đơn hàng thời gian thực (Order Tracking Portal)
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | User Journey |
| **Precondition** | Đơn hàng đã được tạo thành công với mã `CW-XXXXXX` |

**Steps**:
1. Mở cổng tra cứu đơn hàng (Track Order).
2. Nhập mã đơn hàng và email đã đăng ký.
3. Nhấn "Track Order".

**Expected Result**:
- Hệ thống hiển thị chi tiết đơn hàng cùng timeline tiến trình 5 bước minh bạch: Tiếp nhận → Kiểm định QC Timegrapher → Niêm phong → Bàn giao DHL/FedEx → Đang vận chuyển.

---

### TC-07: Kiểm thử Responsive & Chống vỡ Layout (Hallmark Slop-test Gate)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Responsive & Layout Safety |
| **Precondition** | Kiểm thử trên các kích thước 320px, 375px, 414px, 768px, 1440px |

**Steps**:
1. Thu nhỏ màn hình trình duyệt về 320px và 375px.
2. Kiểm tra thanh cuộn ngang của trang (`overflow-x: clip`).
3. Kiểm tra các nút bấm CTA, thẻ sản phẩm và giỏ hàng.

**Expected Result**:
- Không xuất hiện thanh cuộn ngang gây vỡ khung hình.
- Chữ không bị ngắt quãng giữa chừng, nút bấm dễ chạm trên màn hình cảm ứng (min 44px touch target).

---

## 3. Acceptance Criteria (Definition of Done)
1. **Thiết kế chuẩn xác**: Giữ trọn vẹn thẩm mỹ, cấu trúc và tinh thần của trang mẫu `https://www.vsfwatch.cc/`.
2. **Đầy đủ phễu bán hàng**: Toàn bộ luồng từ Catalog → Cart Drawer → One-Page Checkout → Order Tracking hoạt động hoàn chỉnh, không có đường link chết.
3. **Phản hồi tức thì**: Không giật lag khi chuyển đổi bộ sưu tập hoặc tương tác giỏ hàng.
4. **Không lỗi Console**: Không có bất kỳ cảnh báo lỗi JavaScript nào trong DevTools Console.
5. **Dữ liệu đầy đủ**: Dữ liệu sản phẩm thực tế với các dòng máy Rolex, Patek Philippe, Audemars Piguet tiêu chuẩn Thụy Sĩ.

---

## 4. Test Data Requirements
- **Mã giảm giá hợp lệ**: `SUPERCLONE10` (Giảm 10%).
- **Mã giảm giá thử nghiệm lỗi**: `INVALIDCODE` (Báo lỗi không tồn tại).
- **Mã đơn hàng mẫu**: `CW-982415` (Sử dụng để tra cứu trạng thái mẫu).

---

## 5. Environment Setup
- **Chạy ứng dụng dev**: `npm run dev`
- **Build kiểm thử**: `npm run build`
- **Chạy kiểm tra E2E**: Chạy trên trình duyệt headless hoặc browser tiêu chuẩn.

---

## 6. Related Documents
- **Master Doc**: `Docs/00-master/clonewatches-saas-1_master_261008_v1.0.0.md`
- **Product Doc**: `Docs/01-product/clonewatches-saas-1_product_261008_v1.0.0.md`
- **Engineering Doc**: `Docs/02-engineering/clonewatches-saas-1_engineering_261008_v1.0.0.md`
- **Tasks Doc**: `Docs/04-tasks/clonewatches-saas-1_tasks_261008_v1.0.0.md`

---

## 7. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-10-08 | 17:21 | @Antigravity-QA | Khởi tạo QA Document, ma trận Test Cases, tiêu chí nghiệm thu DoD | @Antigravity-Lead | Approved |
