---
type: doc
title: "Engineering Document: CloneWatches SaaS Technical Architecture & Specifications"
status: current
area: platform
created: 2026-10-08
owner: dev@vlinkpay.com
plan_status: accepted
approved_on: 2026-10-08
approved_by: "@user"
---

# Engineering Document: CloneWatches SaaS Technical Architecture & Specifications

## Metadata
- **Feature ID**: clonewatches-saas-1
- **File Naming Convention**: clonewatches-saas-1_engineering_261008_v1.0.0.md
- **Created Date**: 2026-10-08 17:20
- **Last Updated**: 2026-10-08 17:20
- **Current Version**: v1.0.0
- **Author**: @Antigravity-Engineer
- **Status**: Approved
- **Approved By**: @user (2026-10-08)

---

## 1. Architecture Overview

### Technology Stack
- **Core Framework**: React 18 / Vite (Lightning-fast HMR, Zero-config bundling, Optimized tree-shaking).
- **Styling Engine**: Tailwind CSS v3 + CSS Custom Properties (Design Tokens luxury palette).
- **Icons**: `lucide-react` (Crisp, feather-weight SVG icons).
- **State Management**: React Context + Hooks (`StoreContext` for currency, cart, filter state, checkout persistence via `localStorage`).
- **Data Layer**: Mock E-Commerce Engine với đầy đủ thông số kỹ thuật thực tế của các dòng Rolex Super Clone 3235/4131/3285, Patek Philippe 5712, AP Royal Oak.

```
[Storefront UI Layer]
  ├── TopBar (Currency & Announcement)
  ├── Navigation (Brand Mega-menu, Search, Cart Trigger)
  ├── HeroSection (Haute Horlogerie Showcase)
  ├── ValuePropsSection (1:1 Clone Standards)
  ├── CatalogSection (Filter Tabs, Brand Switcher, Product Grid)
  ├── ProductDetailModal & QuickView (High-Res Specs & QC)
  ├── CartDrawer (Slide-over, Free Shipping Calculator, Coupon)
  ├── OnePageCheckout (Multi-currency, Crypto & Card, Validation)
  ├── OrderTrackingModal (Live Timeline simulation)
  └── Footer (Anti-Scam, Warranty, Policies)
        │
        ▼
[State & Business Logic Layer: StoreContext]
  ├── Cart Management (Add, Remove, Update, Clear, Persistence)
  ├── Currency Switcher (USD, EUR, GBP, AUD, CAD, JPY live conversion)
  ├── Coupon Engine (Mã giảm giá, chiết khấu phần trăm, điều kiện áp dụng)
  └── Order State Machine (Pending -> QC -> Packaged -> Dispatched)
```

---

## 2. Frontend Section

### 2.1 Components to Create
1. **`TopAnnouncementBar.jsx`**:
   - Hiển thị thông báo khuyến mãi / chính sách vận chuyển quốc tế.
   - Bộ chọn tiền tệ tích hợp (USD, EUR, GBP, AUD, CAD, JPY).
2. **`Navbar.jsx`**:
   - Logo thương hiệu CloneWatches phong cách Haute Horlogerie.
   - Menu thương hiệu: Rolex, Patek Philippe, Audemars Piguet, Omega, Richard Mille.
   - Thanh tìm kiếm tức thì theo tên mẫu hoặc mã Calibre.
   - Nút mở Giỏ hàng (Cart) với badge hiển thị số lượng sản phẩm.
3. **`HeroSection.jsx`**:
   - Banner cao cấp với hình ảnh đồng hồ flagship, khẩu hiệu 1:1 Swiss Replica.
   - Nút CTA chuyển thẳng đến danh mục sản phẩm và xem tiêu chuẩn kiểm định QC.
4. **`TrustFeatures.jsx`**:
   - 4 khối trụ cột uy tín: 1:1 Visually Indistinguishable, Swiss Calibre Movements, 100% Timegrapher QC Pass, Complimentary Luxury Presentation Box.
5. **`ProductGrid.jsx` & `ProductCard.jsx`**:
   - Thẻ sản phẩm với ảnh chuyển đổi kép khi hover (Dual-hover: Mặt số & Lưng máy).
   - Hiển thị nhãn bộ máy (VD: `Cal. 3235 Super Clone`), giá bán hiển thị theo loại tiền hiện hành, giá gạch và phần trăm giảm giá.
   - Nút "Quick View" và "Add to Cart" với phản hồi tức thì.
6. **`ProductQuickViewModal.jsx`**:
   - Màn hình xem nhanh chi tiết thông số: Kích thước vỏ (40mm/41mm), Thép 904L, Kính Sapphire chống lóa, Dạ quang Chromalight, Bộ máy Clone dao động 28,800 vph.
   - Tùy chọn mặt số, bộ đếm số lượng, thêm vào giỏ hàng hoặc mua ngay (Buy Now).
7. **`CartDrawer.jsx`**:
   - Thanh trượt từ bên phải với animation mượt mà.
   - Danh sách sản phẩm, tăng giảm số lượng, xoá sản phẩm.
   - Thanh đo Free Worldwide Priority Shipping (khi đơn hàng > $500).
   - Ô nhập mã giảm giá (`SUPERCLONE10`), ô ghi chú cho thợ QC.
   - Nút điều hướng sang One-Page Checkout.
8. **`OnePageCheckout.jsx`**:
   - Giao diện thanh toán 1 trang cao cấp:
     - Form thông tin khách hàng & email nhận video QC.
     - Form địa chỉ quốc tế với danh sách quốc gia (US, UK, CA, AU, EU, v.v.) và xác thực mã bưu chính.
     - Lựa chọn cổng thanh toán:
       - **Crypto (USDT TRC20 / BTC / ETH)**: Tự động giảm thêm 5% giá trị đơn hàng, bảo mật ẩn danh tuyệt đối.
       - **Credit Card / Debit Card**: Thanh toán bảo mật SSL qua cổng an toàn.
       - **Wise / Bank Wire Transfer**: Chuyển khoản quốc tế với mã tham chiếu đơn hàng.
     - Tóm tắt đơn hàng chi tiết (Tạm tính, Giảm giá coupon, Giảm giá crypto, Phí ship, Tổng cộng).
9. **`OrderSuccessModal.jsx` & `OrderTrackingModal.jsx`**:
   - Màn hình thông báo đặt hàng thành công kèm mã vận đơn `CW-XXXXXX`.
   - Cổng tra cứu trạng thái đơn hàng (Tracking Portal) với timeline tiến trình 5 giai đoạn:
     1. Đơn hàng đã tiếp nhận.
     2. Đang kiểm định QC & căn chỉnh Timegrapher.
     3. Video QC đã phê duyệt & đóng gói niêm phong.
     4. Đã bàn giao cho đơn vị chuyển phát nhanh DHL/FedEx.
     5. Đang vận chuyển quốc tế an toàn.
10. **`AntiScamModal.jsx` & `Footer.jsx`**:
    - Cảnh báo chống giả mạo kênh liên hệ chính thức.
    - Footer chuyên nghiệp với đầy đủ liên kết chính sách, bảo hành 2 năm và form gia nhập VIP Club.

---

## 3. Backend & Data Layer Section

### 3.1 Data Schema
- **`Product` Entity**:
  ```typescript
  interface Product {
    id: string;
    brand: "Rolex" | "Patek Philippe" | "Audemars Piguet" | "Omega";
    collection: string; // e.g. "Submariner", "Daytona", "Nautilus"
    name: string;
    modelCode: string; // e.g. "M126610LN"
    movement: string; // e.g. "Swiss Clone Calibre 3235 (28,800 vph)"
    caseSize: string; // e.g. "41mm"
    material: string; // e.g. "Oystersteel 904L"
    bezel: string; // e.g. "Cerachrom Ceramic Black"
    dialColor: string; // e.g. "Black", "Tiffany Blue", "Panda White"
    priceUSD: number;
    originalPriceUSD: number;
    images: string[];
    inStock: boolean;
    rating: number;
    reviewsCount: number;
    description: string;
    specs: Record<string, string>;
  }
  ```

- **`CartItem` Entity**:
  ```typescript
  interface CartItem {
    product: Product;
    quantity: number;
    selectedDial?: string;
  }
  ```

- **`Order` Entity**:
  ```typescript
  interface Order {
    orderId: string;
    createdAt: string;
    customer: {
      email: string;
      fullName: string;
      phone: string;
      country: string;
      address: string;
      city: string;
      postalCode: string;
    };
    items: CartItem[];
    paymentMethod: "crypto" | "credit_card" | "wise" | "wire";
    currency: string;
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
    notes?: string;
    status: "received" | "qc_testing" | "packaged" | "in_transit" | "delivered";
    trackingNumber: string;
  }
  ```

### 3.2 Business Logic Rules
1. **Currency Exchange Rates**:
   - Tỷ giá quy đổi cố định nội bộ: `USD: 1.0`, `EUR: 0.92`, `GBP: 0.78`, `AUD: 1.52`, `CAD: 1.36`, `JPY: 152.0`.
   - Làm tròn số nguyên hoặc 2 chữ số thập phân tùy đồng tiền.
2. **Promotion / Coupon Code**:
   - Mã `SUPERCLONE10`: Giảm 10% trên tổng giá trị đơn hàng.
   - Phương thức thanh toán `crypto`: Giảm thêm 5% trực tiếp trên tổng giá trị sau coupon.
3. **Shipping Rules**:
   - Đơn hàng >= $500: Miễn phí vận chuyển Express Priority toàn cầu (tiết kiệm $50).
   - Đơn hàng < $500: Phí vận chuyển tiêu chuẩn $35.

---

## 4. Shared Section

### Security & Privacy Considerations
- **No Sensitive Leakage**: Không lưu trữ số thẻ tín dụng hoặc private key của khách hàng.
- **Client Sanitization**: Toàn bộ dữ liệu nhập vào (tên, email, địa chỉ, ghi chú) đều được sanitize để phòng tránh XSS.
- **SSL / HTTPS Best Practices**: Sử dụng cấu hình web bảo mật hiện đại.

### Performance Benchmarks
- Bundle size tối ưu hóa: Code splitting qua React lazy import hoặc đóng gói Vite tối giản.
- Tải ảnh responsive với định dạng nén tối ưu và lazy loading.
- Tốc độ tương tác (Interaction to Next Paint - INP): < 50ms.

---

## 5. Related Documents
- **Master Doc**: `Docs/00-master/clonewatches-saas-1_master_261008_v1.0.0.md`
- **Product Doc**: `Docs/01-product/clonewatches-saas-1_product_261008_v1.0.0.md`
- **QA Doc**: `Docs/03-qa/clonewatches-saas-1_qa_261008_v1.0.0.md`
- **Tasks Doc**: `Docs/04-tasks/clonewatches-saas-1_tasks_261008_v1.0.0.md`

---

## 6. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-10-08 | 17:20 | @Antigravity-Engineer | Khởi tạo Engineering Doc: Kiến trúc FE/BE, Component matrix, Data Schema & Logic | @Antigravity-Lead | Approved |
