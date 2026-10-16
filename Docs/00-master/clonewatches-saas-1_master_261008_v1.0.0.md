---
type: doc
title: "Master Document: CloneWatches SaaS Platform & Full Sales Flow"
status: current
area: platform
created: 2026-10-08
owner: dev@vlinkpay.com
plan_status: active
approved_on: 2026-10-08
approved_by: "@user"
---

# Master Document: CloneWatches SaaS Platform & Full Sales Flow

## Metadata
- **Feature ID**: clonewatches-saas-1
- **Branch Name**: feature/clonewatches-saas-1_sales-flow
- **File Naming Convention**: clonewatches-saas-1_master_261008_v1.0.0.md
- **Created Date**: 2026-10-08 17:18
- **Last Updated**: 2026-10-08 17:18
- **Current Version**: v1.0.0
- **Author**: @Antigravity-PM
- **Status**: Approved
- **Approved By**: @user (2026-10-08)

---

## 1. Feature Overview

### Problem Statement
Khách hàng kinh doanh đồng hồ cao cấp 1:1 Super Clone (dựa trên mẫu tham chiếu thực tế đã duyệt `https://www.vsfwatch.cc/`) cần một nền tảng Web SaaS hiện đại, sang trọng, hiệu năng cực cao và bảo mật để vận hành toàn bộ phễu bán hàng (Full Sales Flow). Trang web tham chiếu hiện tại sử dụng công nghệ cũ, trải nghiệm giật lag, chưa tối ưu trên mobile và thiếu tính năng tương tác tức thì của chuẩn SaaS 2026.

### Business Context
Thị trường luxury clone đòi hỏi uy tín tuyệt đối, chi tiết máy sắc nét (Swiss Calibre Clone 3235, 4131, 3285), minh bạch quy trình kiểm định chất lượng (QC inspection), chính sách bảo vệ khách hàng (Anti-Scam Notice), và quy trình thanh toán quốc tế đa kênh (Credit Card, Crypto USDT/BTC, Wire Transfer, Wise). Một trải nghiệm mượt mà sẽ tăng tỷ lệ chuyển đổi đơn hàng và giá trị giỏ hàng trung bình (AOV).

### Goals & Objectives
1. **Thiết kế chuẩn Luxury Horology**: Kế thừa và nâng cấp toàn bộ Design DNA từ `https://www.vsfwatch.cc/` (Obsidian `#1D1F21`, Gold `#f3d28a`, Emerald `#0a5c3b`, Crimson `#AE2238`, font Poppins).
2. **Full Sales Funnel liền mạch**:
   - Announcement Bar đa thông điệp & Bộ chọn tiền tệ đa quốc gia (USD, EUR, GBP, AUD, CAD, JPY).
   - Navigation thông minh với Mega-menu thương hiệu (Rolex, Patek Philippe, Audemars Piguet, Omega, Cartier) và Search tức thì.
   - Hero Section quyền lực, thông điệp 1:1 Super Clone tiêu chuẩn Thụy Sĩ.
   - Brand Showcase & Catalog phân loại theo Bộ sưu tập (Daytona, Submariner, GMT-Master II, Nautilus, Royal Oak...).
   - Product Grid với ảnh Dual-hover (mặt trước & máy cơ phía sau), nhãn chiết khấu, bộ lọc bộ máy (Calibre).
   - Quickview Modal & Dedicated Product Detail: Zoom ảnh độ phân giải cao, thông số kỹ thuật bộ máy, cam kết QC video trước khi gửi.
   - Interactive Slide-over Cart Drawer: Thanh tiến trình Free Shipping, bộ tính tổng tức thì, ghi chú đơn hàng (Engraving/Request), mã Coupon.
   - Streamlined One-Page Checkout: Xác thực địa chỉ quốc tế & mã bưu chính, tùy chọn thanh toán linh hoạt, chính sách bảo mật.
   - Order Confirmation & Live Track Order: Tra cứu hành trình đơn hàng minh bạch bằng mã đơn và email.
   - VIP Club Newsletter & Anti-Scam Verification: Giúp khách hàng phân biệt kênh chính thức.
3. **Hiệu năng & Tương tác cao cấp**: Tốc độ phản hồi < 100ms, không phụ thuộc backend cồng kềnh, hoạt động mượt mà cả offline và online, responsive hoàn hảo 320px - 1440px.

---

## 2. Scope

### In-Scope
- Toàn bộ giao diện Storefront & SaaS Sales Flow theo mẫu duyệt `https://www.vsfwatch.cc/`.
- Danh mục sản phẩm Rolex, Patek Philippe, Audemars Piguet với dữ liệu và hình ảnh chân thực.
- Bộ lọc động theo Brand, Movement, Price Range, Case Size, Material (904L Steel, 18K Gold PVD).
- Giỏ hàng Mini-Cart Drawer tương tác trực tiếp, cập nhật số lượng, áp mã giảm giá `SUPERCLONE10`.
- Luồng Checkout One-Page hoàn chỉnh có tính toán thuế/phí ship, chọn cổng thanh toán (Crypto -5% discount, Card, Wise, Wire).
- Màn hình Tracking đơn hàng mô phỏng thời gian thực.
- Hệ thống thông báo và Modal chi tiết kỹ thuật máy (Movement Calibres).

### Out-of-Scope
- Tích hợp cổng thanh toán thực tế bên thứ ba với merchant account thật (sử dụng mock processor với đầy đủ validation).
- Hệ thống ERP quản lý kho hàng backend phức tạp (sẽ tích hợp ở Phase 2).

---

## 3. Key Personas (Summary)

### Primary Users
- **Luxury Watch Enthusiast / Collector**: Người tìm kiếm đồng hồ chế tác siêu cấp 1:1 chuẩn xác từng chi tiết máy, coi trọng sự bảo mật, chính sách QC và dịch vụ hậu mãi.
- **Store Operator / Admin**: Người quản trị cần một giao diện SaaS trực quan để quản lý danh mục, đơn hàng và tỷ giá tiền tệ.

---

## 4. Success Metrics (KPIs)
- **Tốc độ tải trang & FCP**: < 0.8s trên cả Desktop và Mobile.
- **Mobile Usability**: Đạt 100% tiêu chí responsive của Hallmark (320px, 375px, 414px, 768px).
- **Checkout Friction**: Tối giản còn 1 trang (One-Page Checkout), hoàn tất trong < 60s.
- **Design Fidelity**: Đảm bảo 100% tinh thần và cấu trúc mà khách hàng đã duyệt từ link mẫu.

---

## 5. High-Level Timeline
- **Phase 1 (Hiện tại)**: Hoàn thiện hồ sơ tài liệu tiêu chuẩn (Docs 00-04) và triển khai toàn diện Storefront + Full Sales Flow (Cart, Checkout, Tracking, Catalog).
- **Phase 2**: Kết nối Webhook CRM, live chat concierge, và mở rộng đa ngôn ngữ.

---

## 6. Stakeholders & Responsibilities
- **Project Manager / Lead**: @Antigravity-PM (Điều phối kiến trúc, Master & Tasks Doc)
- **Product Designer**: @Antigravity-Designer (Product Doc, UX Wireframes, Design System Token Audit)
- **Frontend Developer**: @Antigravity-FE (Triển khai UI components, tương tác giỏ hàng, checkout)
- **Backend / Systems**: @Antigravity-BE (Mô hình dữ liệu, mock engine, currency converter)
- **QA Tester**: @Antigravity-QA (QA Doc, Test Cases, kiểm thử đa thiết bị & luồng thanh toán)

---

## 7. Related Documents
- **Product Doc**: `Docs/01-product/clonewatches-saas-1_product_261008_v1.0.0.md`
- **Engineering Doc**: `Docs/02-engineering/clonewatches-saas-1_engineering_261008_v1.0.0.md`
- **QA Doc**: `Docs/03-qa/clonewatches-saas-1_qa_261008_v1.0.0.md`
- **Tasks Doc**: `Docs/04-tasks/clonewatches-saas-1_tasks_261008_v1.0.0.md`

---

## 8. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-10-08 | 17:18 | @Antigravity-PM | Khởi tạo bản thảo Master Document cho CloneWatches SaaS Platform | @user | Approved |

---

## 9. Approval & Sign-off
- [x] **Project Manager / Lead**: @Antigravity-PM - Date: 2026-10-08
- [x] **Client / User Approval**: @user (Turbo Mode Enabled) - Date: 2026-10-08

---

## 10. Notes & Assumptions
- Trang mẫu `https://www.vsfwatch.cc/` đã được khách hàng duyệt làm chuẩn mực thiết kế và cấu trúc luồng.
- Toàn bộ flow bán hàng được xây dựng với trạng thái động đầy đủ (Empty cart, Loading, Validated, Error, Success).
