/**
 * WhatsApp Sales Dispatch Service
 * Thanh Phuong Luxury Watch / CloneWatches SaaS
 *
 * Handles formatting order details, customer contact information,
 * QR code contact fallback, and dispatching orders to WhatsApp owner.
 */

export const WHATSAPP_CONTACT_NAME = 'Thanh Phuong Luxury Watch';
export const DEFAULT_WHATSAPP_QR_URL = 'https://wa.me/qr/3DEQ3BJ6O2P5P1';
export const WHATSAPP_QR_CODE_IMAGE = '/figma-assets/whatsapp-qr-code.png';
export const WHATSAPP_QR_CARD_IMAGE = '/figma-assets/whatsapp-qr-card.png';
export const DEFAULT_WHATSAPP_NUMBER = ''; // Uses QR link by default until a phone number is set

/**
 * Get configured sales WhatsApp number (empty string means use QR code link)
 */
export function getStoreWhatsAppNumber() {
  try {
    const saved = localStorage.getItem('cw_whatsapp_number');
    if (saved && saved.trim()) {
      const clean = saved.replace(/[^0-9]/g, '');
      // Ignore legacy placeholder dummy number so QR link is used by default
      if (clean && clean !== '84900000000') {
        return clean;
      }
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Set custom sales WhatsApp number (e.g. from Admin settings)
 */
export function setStoreWhatsAppNumber(phoneNumber) {
  try {
    const clean = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (clean && clean !== '84900000000') {
      localStorage.setItem('cw_whatsapp_number', clean);
    } else {
      localStorage.removeItem('cw_whatsapp_number');
    }
  } catch {
    // Ignore storage write errors in restricted environments
  }
}

/**
 * Format delivery address from optional customer fields
 */
export function formatCustomerAddress(customer = {}) {
  const hasSpecificLocation = Boolean(
    customer.address?.trim() ||
    customer.city?.trim() ||
    customer.state?.trim() ||
    customer.postalCode?.trim()
  );

  if (!hasSpecificLocation) {
    return '';
  }

  const parts = [
    customer.address?.trim(),
    customer.city?.trim(),
    customer.state?.trim(),
    customer.country?.trim()
  ].filter(Boolean);

  const base = parts.join(', ');
  return customer.postalCode?.trim()
    ? `${base ? base + ' ' : ''}(${customer.postalCode.trim()})`
    : base;
}

/**
 * Format full multi-item order message for WhatsApp (Vietnamese layout, no payment method)
 */
export function buildWhatsAppOrderMessage({
  orderId,
  customer = {},
  items = [],
  totalFormatted = '',
  totalUSD = 0,
  notes = '',
  coupon = null,
  shippingFee = 0
}) {
  const timestamp = new Date().toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const deliveryAddress = formatCustomerAddress(customer);
  const customerNote = (customer.notes || notes || '').trim();
  const customerEmail = (customer.email || '').trim();

  const lines = [
    `👑 *ĐƠN ĐẶT HÀNG MỚI — THANH PHUONG LUXURY WATCH* 👑`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Mã đơn hàng:* #${orderId || 'CW-' + Math.floor(100000 + Math.random() * 900000)}`,
    `⏱ *Thời gian đặt:* ${timestamp}`,
    ``,
    `👤 *THÔNG TIN KHÁCH HÀNG:*`,
    `• *Họ và tên:* ${customer.fullName?.trim() || 'Khách hàng VIP'}`,
    `• *SĐT / WhatsApp:* ${customer.phone?.trim() || 'Chưa cung cấp'}`,
    customerEmail ? `• *Email:* ${customerEmail}` : null,
    deliveryAddress ? `• *Địa chỉ giao hàng:* ${deliveryAddress}` : null,
    customerNote ? `• *Ghi chú:* ${customerNote}` : null,
    ``,
    `🛍 *THÔNG TIN SẢN PHẨM (${items.length} sản phẩm):*`
  ].filter((line) => line !== null);

  items.forEach((item, index) => {
    const p = item.product || item;
    const name = p.name || 'Master Clone Watch';
    const ref = p.modelCode || p.spu || 'N/A';
    const factory = p.factory || 'VS / Clean Factory';
    const variantName = item.variantName || 'VS / Clean 1:1 Super Clone';
    const qty = item.quantity || 1;
    const unitPrice = Number(item.priceUSD || p.variant2Price || p.priceUSD || 1199);
    const subtotal = unitPrice * qty;

    lines.push(`───────────────`);
    lines.push(`${index + 1}️⃣ *${p.brand ? p.brand.toUpperCase() + ' — ' : ''}${name}*`);
    lines.push(`   • *Mã Ref / SPU:* ${ref} | *Nhà máy:* ${factory}`);
    lines.push(`   • *Phiên bản máy:* ${variantName}`);
    lines.push(`   • *Số lượng:* ${qty} × $${unitPrice.toLocaleString()} USD`);
    lines.push(`   • *Thành tiền:* $${subtotal.toLocaleString()} USD`);
  });

  lines.push(`───────────────`);
  lines.push(``);
  lines.push(`💰 *CHI TIẾT ĐƠN HÀNG:*`);
  if (coupon) {
    lines.push(`• *Mã ưu đãi VIP:* ${coupon.code} (-${coupon.discountPercent}%)`);
  }
  lines.push(`• *Vận chuyển:* ${shippingFee === 0 ? 'Miễn phí (DHL Express Priority)' : '$' + shippingFee + ' USD'}`);
  lines.push(`👉 *TỔNG CỘNG:* *${totalFormatted || '$' + Number(totalUSD || 0).toLocaleString() + ' USD'}*`);
  lines.push(``);
  lines.push(`🛡 *QUYỀN LỢI KHÁCH HÀNG:*`);
  lines.push(`✓ Gửi video kiểm định 4K QC & phiếu đo máy Timegrapher trước khi giao`);
  lines.push(`✓ Bảo hiểm thông quan 100% & cam kết giao lại miễn phí`);
  lines.push(`✓ Bảo hành máy cơ 5 năm`);
  lines.push(``);
  lines.push(`💬 _"Xin chào Thanh Phuong Luxury Watch, tôi vừa đặt đơn hàng này trên website. Vui lòng liên hệ với tôi để xác nhận tình trạng sẵn hàng và gửi video 4K QC. Xin cảm ơn!"_`);

  return lines.join('\n');
}

/**
 * Format quick single-product WhatsApp order message (Vietnamese layout)
 */
export function buildWhatsAppQuickProductMessage({
  watch = {},
  variantName = 'VS / Clean 1:1 Super Clone',
  variantPrice = 1199,
  quantity = 1,
  customer = {},
  notes = ''
}) {
  const timestamp = new Date().toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const unitPrice = Number(variantPrice || watch?.variant2Price || watch?.priceUSD || 1199);
  const total = unitPrice * quantity;
  const brand = watch?.brand ? watch.brand.toUpperCase() : 'ROLEX';
  const name = watch?.name || 'Master Clone Watch';
  const ref = watch?.modelCode || watch?.spu || 'N/A';
  const factory = watch?.factory || 'VS / Clean Factory';
  const deliveryAddress = formatCustomerAddress(customer);
  const customerNote = (notes || customer.notes || '').trim();

  const lines = [
    `👑 *ĐƠN ĐẶT HÀNG NHANH — THANH PHUONG LUXURY WATCH* 👑`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⏱ *Thời gian:* ${timestamp}`,
    ``,
    `⌚ *THÔNG TIN SẢN PHẨM:*`,
    `• *Mẫu đồng hồ:* *${brand} — ${name}*`,
    `• *Mã Ref / SPU:* ${ref}`,
    `• *Nhà máy:* ${factory}`,
    `• *Phiên bản máy:* *${variantName}*`,
    `• *Số lượng:* ${quantity}`,
    `• *Đơn giá:* $${unitPrice.toLocaleString()} USD`,
    `👉 *TỔNG TẠM TÍNH:* *$${total.toLocaleString()} USD*`,
    ``
  ];

  if (customer.fullName || customer.phone || customer.email || deliveryAddress || customerNote) {
    lines.push(`👤 *THÔNG TIN KHÁCH HÀNG:*`);
    if (customer.fullName) lines.push(`• *Họ và tên:* ${customer.fullName}`);
    if (customer.phone) lines.push(`• *SĐT / WhatsApp:* ${customer.phone}`);
    if (customer.email) lines.push(`• *Email:* ${customer.email}`);
    if (deliveryAddress) lines.push(`• *Địa chỉ giao hàng:* ${deliveryAddress}`);
    if (customerNote) lines.push(`• *Ghi chú:* ${customerNote}`);
    lines.push(``);
  }

  lines.push(`🛡 *DỊCH VỤ YÊU CẦU:*`);
  lines.push(`✓ Nhận video kiểm định 4K QC & đo sai số Timegrapher (+/- 2s/ngày)`);
  lines.push(`✓ Miễn phí vận chuyển nhanh DHL/FedEx Express`);
  lines.push(`✓ Bảo hành máy cơ 5 năm`);
  lines.push(``);
  lines.push(`💬 _"Xin chào Thanh Phuong Luxury Watch, tôi muốn đặt mẫu đồng hồ này. Vui lòng liên hệ tư vấn và gửi video 4K QC giúp tôi!"_`);

  return lines.join('\n');
}

/**
 * Generate full WhatsApp URL (supports both phone number and QR code link fallback)
 */
export function generateWhatsAppUrl(message = '', customPhone = null) {
  const rawPhone = (customPhone !== null ? customPhone : getStoreWhatsAppNumber()) || '';
  const phone = String(rawPhone).replace(/[^0-9]/g, '');
  const encodedText = message ? encodeURIComponent(message) : '';

  if (phone && phone !== '84900000000') {
    return encodedText
      ? `https://wa.me/${phone}?text=${encodedText}`
      : `https://wa.me/${phone}`;
  }

  return encodedText
    ? `${DEFAULT_WHATSAPP_QR_URL}?text=${encodedText}`
    : DEFAULT_WHATSAPP_QR_URL;
}

/**
 * Copy formatted order message to clipboard so user can paste directly after scanning QR
 */
export async function copyOrderMessageToClipboard(message) {
  if (!message || typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * 1-Click Dispatch: Copies message to clipboard & opens WhatsApp in a new browser tab/window
 */
export function openWhatsAppChat(message, customPhone = null) {
  if (message) {
    copyOrderMessageToClipboard(message);
  }
  const url = generateWhatsAppUrl(message, customPhone);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
