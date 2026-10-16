---
type: doc
title: "Tasks: CloneWatches SaaS Platform & Full Sales Flow"
status: current
area: platform
created: 2026-10-08
owner: dev@vlinkpay.com
---

# Tasks: CloneWatches SaaS Platform & Full Sales Flow

## Metadata
- **Master Doc**: `Docs/00-master/clonewatches-saas-1_master_261008_v1.0.0.md`
- **Product Doc**: `Docs/01-product/clonewatches-saas-1_product_261008_v1.0.0.md`
- **Engineering Doc**: `Docs/02-engineering/clonewatches-saas-1_engineering_261008_v1.0.0.md`
- **QA Doc**: `Docs/03-qa/clonewatches-saas-1_qa_261008_v1.0.0.md`
- **Created**: 2026-10-08 17:21
- **Last Updated**: 2026-10-08 17:21
- **Current Version**: v1.0.0

---

## Phase 1: Setup
- [x] Task 1.1: Khởi tạo Git repository & cấu trúc tài liệu chuẩn theo quy trình 9 bước - **Assignee**: @Antigravity-PM - **Est**: 1h - **Issue**: Local
- [x] Task 1.2: Khởi tạo dự án React 18 + Vite + Tailwind CSS + Lucide Icons + Font Poppins - **Assignee**: @Antigravity-FE - **Est**: 2h - **Issue**: Local
- [x] Task 1.3: Cấu hình Design Tokens luxury (Obsidian, Gold, Emerald, Crimson) và CSS Custom Properties - **Assignee**: @Antigravity-Designer - **Est**: 1h - **Issue**: Local

## Phase 2: Implementation
- [x] Task 2.1: Xây dựng Mock Database và StoreContext (Products, Cart, Currency, Order State) - **Assignee**: @Antigravity-BE - **Est**: 3h - **Issue**: Local
- [x] Task 2.2: Xây dựng Announcement Bar & Navbar với bộ chọn tiền tệ, menu thương hiệu và tìm kiếm tức thì - **Assignee**: @Antigravity-FE - **Est**: 2h - **Issue**: Local
- [x] Task 2.3: Xây dựng Hero Section và 4 khối trụ cột uy tín (1:1 Clone, Swiss Movement, QC Timegrapher, Luxury Box) - **Assignee**: @Antigravity-FE - **Est**: 2h - **Issue**: Local
- [x] Task 2.4: Xây dựng Bộ sưu tập Brand Tabs & Product Grid với hiệu ứng Dual-hover (mặt trước & lưng máy) - **Assignee**: @Antigravity-FE - **Est**: 4h - **Issue**: Local
- [x] Task 2.5: Xây dựng Quick View Modal & Chi tiết thông số máy Swiss Calibre 3235/4131/3285 - **Assignee**: @Antigravity-FE - **Est**: 3h - **Issue**: Local
- [x] Task 2.6: Xây dựng Slide-over Cart Drawer tương tác (Free Shipping Meter, Coupon Code `SUPERCLONE10`, Order Notes) - **Assignee**: @Antigravity-FE - **Est**: 3h - **Issue**: Local
- [x] Task 2.7: Xây dựng One-Page Checkout hoàn chỉnh (Địa chỉ quốc tế, Kiểm tra Postal code, Cổng Crypto giảm 5%, Thẻ tín dụng, Wise) - **Assignee**: @Antigravity-FE - **Est**: 4h - **Issue**: Local
- [x] Task 2.8: Xây dựng Màn hình Đặt hàng thành công & Cổng tra cứu tiến trình đơn hàng (Live Order Tracking Portal) - **Assignee**: @Antigravity-FE - **Est**: 2h - **Issue**: Local
- [x] Task 2.9: Xây dựng Khối cảnh báo chống giả mạo Anti-Scam Verification & Footer chính sách toàn diện - **Assignee**: @Antigravity-FE - **Est**: 2h - **Issue**: Local

## Phase 3: Testing & QA
- [x] Task 3.1: Kiểm thử logic giỏ hàng, mã giảm giá và tính toán chiết khấu Crypto - **Assignee**: @Antigravity-QA - **Est**: 2h - **Issue**: Local
- [x] Task 3.2: Kiểm thử luồng Full Funnel E2E (Duyệt hàng → Quickview → Cart → Checkout → Track Order) - **Assignee**: @Antigravity-QA - **Est**: 2h - **Issue**: Local
- [x] Task 3.3: Kiểm thử Responsive đa thiết bị (320px, 375px, 414px, 768px, 1440px) chống tràn layout - **Assignee**: @Antigravity-QA - **Est**: 2h - **Issue**: Local

## Phase 4: Deployment & Verification
- [x] Task 4.1: Chạy `npm run build` xác nhận không có lỗi biên dịch - **Assignee**: @Antigravity-Lead - **Est**: 1h - **Issue**: Local
- [x] Task 4.2: Nghiệm thu Visual Gate & đối chiếu độ chính xác với trang mẫu `https://www.vsfwatch.cc/` - **Assignee**: @Antigravity-Lead - **Est**: 1h - **Issue**: Local

---

## Dependencies & Blockers
- **Dependencies**: Trang mẫu tham chiếu `https://www.vsfwatch.cc/` đã được khách hàng duyệt làm chuẩn mực thiết kế.
- **Blockers**: Không có.

---

## Changelog
| Version | Date | Time | Author | Changes |
|---------|------|------|--------|---------|
| v1.0.0 | 2026-10-08 | 17:21 | @Antigravity-PM | Khởi tạo bảng phân rã Task chi tiết cho CloneWatches SaaS Platform |
| v1.0.0 | 2026-10-08 | 17:31 | @Antigravity-Lead | Hoàn thành toàn bộ Phase 1 (Setup), Phase 2 (Implementation), Phase 3 (Testing), Phase 4 (Build Verification) |
