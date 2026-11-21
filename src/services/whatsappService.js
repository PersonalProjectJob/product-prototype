/**
 * WhatsApp Sales Dispatch Service
 * Thanh Phuong Luxury Watch / CloneWatches SaaS
 *
 * Handles formatting order details, customer contact information,
 * customizable message templates (Admin + Storefront inline edit),
 * QR code contact fallback, and dispatching orders to WhatsApp owner.
 */

export const WHATSAPP_CONTACT_NAME = 'Thanh Phuong Luxury Watch';
export const DEFAULT_WHATSAPP_QR_URL = 'https://wa.me/qr/3DEQ3BJ6O2P5P1';
export const WHATSAPP_QR_CODE_IMAGE = '/figma-assets/whatsapp-qr-code.png';
export const WHATSAPP_QR_CARD_IMAGE = '/figma-assets/whatsapp-qr-card.png';
export const DEFAULT_WHATSAPP_NUMBER = '84977889986';
export const DEFAULT_WHATSAPP_DISPLAY_PHONE = '+84 97 788 99 86';

export const WHATSAPP_TEMPLATE_STORAGE_KEY = 'cw_whatsapp_template_config_v1';

export const WHATSAPP_TEMPLATE_VARIABLES = [
  { token: '{{product_id}}', label: 'Mã Product ID (VD: P000028)' },
  { token: '{{brand}}', label: 'Thương hiệu (VD: ROLEX)' },
  { token: '{{title}}', label: 'Tên mẫu đồng hồ' },
  { token: '{{nickname}}', label: 'Nickname (VD: Bruce Wayne)' },
  { token: '{{collection}}', label: 'Bộ sưu tập / Dòng' },
  { token: '{{ref}}', label: 'Mã Ref / SPU' },
  { token: '{{factory}}', label: 'Nhà máy (Factory)' },
  { token: '{{variant}}', label: 'Phiên bản máy đang chọn' },
  { token: '{{dial}}', label: 'Màu mặt số (Dial)' },
  { token: '{{case_size}}', label: 'Kích thước vỏ (Case)' },
  { token: '{{material}}', label: 'Chất liệu vỏ' },
  { token: '{{bracelet}}', label: 'Dây đeo (Bracelet/Strap)' },
  { token: '{{movement}}', label: 'Bộ máy (Calibre)' },
  { token: '{{water_resistance}}', label: 'Độ chống nước' },
  { token: '{{quantity}}', label: 'Số lượng' },
  { token: '{{price_label}}', label: 'Nhãn giá (Liên hệ)' },
  { token: '{{image_url}}', label: 'Link ảnh sản phẩm (R2 CDN)' },
  { token: '{{product_url}}', label: 'Link trang sản phẩm' },
  { token: '{{timestamp}}', label: 'Thời gian gửi' }
];

export const DEFAULT_RAW_PRODUCT_TEMPLATE = [
  '👑 *YÊU CẦU BÁO GIÁ & ĐẶT HÀNG — THANH PHUONG LUXURY WATCH* 👑',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '⏱ *Thời gian:* {{timestamp}}',
  '',
  '⌚ *THÔNG TIN CHI TIẾT ĐỒNG HỒ:*',
  '• *Mã Product ID:* *{{product_id}}*',
  '• *Mẫu đồng hồ:* *{{brand}} — {{title}}*',
  '• *Nickname:* {{nickname}}',
  '• *Bộ sưu tập / Dòng:* {{collection}}',
  '• *Mã Ref / SPU:* {{ref}}',
  '• *Nhà máy:* {{factory}}',
  '• *Phiên bản máy yêu cầu:* *{{variant}}*',
  '• *Màu mặt số (Dial):* {{dial}}',
  '• *Kích thước vỏ (Case):* {{case_size}}',
  '• *Chất liệu vỏ:* {{material}}',
  '• *Dây đeo (Bracelet/Strap):* {{bracelet}}',
  '• *Bộ máy (Calibre):* {{movement}}',
  '• *Chống nước:* {{water_resistance}}',
  '• *Số lượng:* {{quantity}}',
  '• *Giá:* *{{price_label}}*',
  '• *Hình ảnh:* {{image_url}}',
  '• *Link sản phẩm:* {{product_url}}',
  '',
  '🛡 *DỊCH VỤ YÊU CẦU:*',
  '✓ Báo giá chi tiết & kiểm tra tình trạng sẵn kho',
  '✓ Nhận video kiểm định 4K QC & đo sai số Timegrapher (+/- 2s/ngày)',
  '✓ Miễn phí vận chuyển nhanh DHL/FedEx Express & Bảo hành máy cơ 5 năm',
  '',
  '💬 _"Xin chào Thanh Phuong Luxury Watch, tôi quan tâm mẫu đồng hồ [{{product_id}}] {{brand}} {{title}}. Vui lòng báo giá chi tiết và gửi video 4K QC giúp tôi!"_'
].join('\n');

export const DEFAULT_WHATSAPP_TEMPLATE_CONFIG = {
  headerTitle: '👑 *YÊU CẦU BÁO GIÁ & ĐẶT HÀNG — THANH PHUONG LUXURY WATCH* 👑',
  orderHeaderTitle: '👑 *ĐƠN ĐẶT HÀNG MỚI — THANH PHUONG LUXURY WATCH* 👑',
  priceLabel: 'Liên hệ (Yêu cầu báo giá trực tiếp)',
  includeTimestamp: true,
  includeProductId: true,
  includeNickname: true,
  includeCollection: true,
  includeRef: true,
  includeFactory: true,
  includeVariant: true,
  includeDial: true,
  includeCaseSize: true,
  includeCaseMaterial: true,
  includeBracelet: true,
  includeMovement: true,
  includeWaterResistance: true,
  includeImageUrl: true,
  includeProductUrl: true,
  includeServicesBlock: true,
  servicesTitle: '🛡 *DỊCH VỤ YÊU CẦU:*',
  servicesText: [
    '✓ Báo giá chi tiết & kiểm tra tình trạng sẵn kho',
    '✓ Nhận video kiểm định 4K QC & đo sai số Timegrapher (+/- 2s/ngày)',
    '✓ Miễn phí vận chuyển nhanh DHL/FedEx Express & Bảo hành máy cơ 5 năm'
  ].join('\n'),
  closingMessageTemplate:
    '💬 _"Xin chào Thanh Phuong Luxury Watch, tôi quan tâm mẫu đồng hồ [{{product_id}}] {{brand}} {{title}}. Vui lòng báo giá chi tiết và gửi video 4K QC giúp tôi!"_',
  orderClosingMessageTemplate:
    '💬 _"Xin chào Thanh Phuong Luxury Watch, tôi quan tâm các mẫu đồng hồ trên. Vui lòng báo giá chi tiết và gửi video 4K QC giúp tôi. Xin cảm ơn!"_',
  useCustomRawTemplate: false,
  customRawTemplate: DEFAULT_RAW_PRODUCT_TEMPLATE
};

/**
 * Load saved WhatsApp template configuration from localStorage (merged with defaults)
 */
export function getWhatsAppTemplateConfig() {
  try {
    const raw = localStorage.getItem(WHATSAPP_TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG,
          ...parsed
        };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return { ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG };
}

/**
 * Save custom WhatsApp template configuration to localStorage
 */
export function setWhatsAppTemplateConfig(partialConfig = {}) {
  const merged = {
    ...getWhatsAppTemplateConfig(),
    ...(partialConfig || {})
  };
  try {
    localStorage.setItem(WHATSAPP_TEMPLATE_STORAGE_KEY, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cw-whatsapp-template-updated', { detail: merged }));
    }
  } catch {
    // Ignore storage write errors
  }
  return merged;
}

/**
 * Reset WhatsApp template configuration back to factory defaults
 */
export function resetWhatsAppTemplateConfig() {
  try {
    localStorage.removeItem(WHATSAPP_TEMPLATE_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cw-whatsapp-template-updated', { detail: { ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG } })
      );
    }
  } catch {
    // Ignore storage errors
  }
  return { ...DEFAULT_WHATSAPP_TEMPLATE_CONFIG };
}

/**
 * Replace {{variable}} tokens in a template string
 */
export function interpolateTemplateTokens(templateStr = '', variables = {}) {
  return String(templateStr || '')
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const val = variables[key];
      return val !== undefined && val !== null ? String(val) : '';
    })
    .split('\n')
    .filter((line) => {
      // Drop bullet lines whose placeholder resolved to empty string (e.g. "• *Nickname:* ")
      const trimmed = line.trim();
      if (/^[•\-*]\s*\*[^*]+:\*\s*$/.test(trimmed)) {
        return false;
      }
      return true;
    })
    .join('\n');
}

/**
 * Get configured sales WhatsApp number (defaults to Owner phone +84 97 788 99 86)
 * Automatically normalizes Vietnamese leading '0' (e.g. '0977889986') to '84977889986'
 */
export function normalizeWhatsAppPhone(input) {
  let clean = String(input || '').replace(/[^0-9]/g, '');
  if (!clean || clean === '84900000000') {
    return '';
  }
  if (clean.startsWith('0') && clean.length >= 9 && clean.length <= 11) {
    clean = '84' + clean.slice(1);
  }
  return clean;
}

export function formatWhatsAppDisplayPhone(phoneInput) {
  const clean = normalizeWhatsAppPhone(phoneInput) || DEFAULT_WHATSAPP_NUMBER;
  if (clean.startsWith('84') && clean.length === 11) {
    // e.g. 84977889986 -> +84 97 788 99 86
    return `+84 ${clean.slice(2, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9)}`;
  }
  return `+${clean}`;
}

export function getStoreWhatsAppNumber() {
  try {
    const saved = localStorage.getItem('cw_whatsapp_number');
    if (saved && saved.trim()) {
      const clean = normalizeWhatsAppPhone(saved);
      if (clean) {
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
    const clean = normalizeWhatsAppPhone(phoneNumber);
    if (clean) {
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
  notes = '',
  templateConfig = null
}) {
  const cfg = {
    ...getWhatsAppTemplateConfig(),
    ...(templateConfig || {})
  };

  const timestamp = new Date().toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const deliveryAddress = formatCustomerAddress(customer);
  const customerNote = (customer.notes || notes || '').trim();
  const customerEmail = (customer.email || '').trim();

  const lines = [
    cfg.orderHeaderTitle || DEFAULT_WHATSAPP_TEMPLATE_CONFIG.orderHeaderTitle,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Mã đơn hàng:* #${orderId || 'CW-' + Math.floor(100000 + Math.random() * 900000)}`,
    cfg.includeTimestamp ? `⏱ *Thời gian đặt:* ${timestamp}` : null,
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
    const ds = p.dataSheet || p.data_sheet || {};
    const name = p.name || p.title || 'Master Clone Watch';
    const pid = p.product_id || p.id || 'N/A';
    const ref = ds.modelReference || p.reference || p.modelCode || p.spu || pid;
    const factory = ds.factoryVersion || p.factory || 'VS / Clean Factory';
    const variantName = item.variantName || 'VS / Clean 1:1 Super Clone';
    const qty = item.quantity || 1;
    const pageLink =
      typeof window !== 'undefined' && p.product_id
        ? `${window.location.origin}/index-all-brands/${String(p.product_id).toLowerCase()}`
        : '';

    lines.push(`───────────────`);
    lines.push(`${index + 1}️⃣ *${p.brand ? p.brand.toUpperCase() + ' — ' : ''}${name}*`);
    if (cfg.includeProductId || cfg.includeRef) {
      const idParts = [
        cfg.includeProductId ? `*Product ID:* ${pid}` : null,
        cfg.includeRef ? `*Ref / SPU:* ${ref}` : null
      ].filter(Boolean);
      if (idParts.length > 0) lines.push(`   • ${idParts.join(' | ')}`);
    }
    if (cfg.includeNickname && p.nickname) lines.push(`   • *Nickname:* "${p.nickname}"`);
    if (cfg.includeCollection && (p.collection || p.model)) {
      lines.push(`   • *Bộ sưu tập / Dòng:* ${[p.collection, p.model].filter(Boolean).join(' • ')}`);
    }
    if (cfg.includeDial && (p.dial_color || ds.dial)) {
      lines.push(`   • *Màu mặt số (Dial):* ${p.dial_color || ds.dial}`);
    }
    if (cfg.includeCaseSize && (p.caseSize || p.size_mm || ds.caseDimensions)) {
      lines.push(`   • *Kích thước vỏ (Case):* ${ds.caseDimensions || p.caseSize || p.size_mm}`);
    }
    if (cfg.includeCaseMaterial && (p.material || p.case_material || ds.caseMaterial)) {
      lines.push(`   • *Chất liệu vỏ:* ${ds.caseMaterial || p.case_material || p.material}`);
    }
    if (cfg.includeBracelet && (p.bracelet_or_strap || ds.bracelet)) {
      lines.push(`   • *Dây đeo (Bracelet/Strap):* ${p.bracelet_or_strap || ds.bracelet}`);
    }
    if (cfg.includeMovement && (p.movement || ds.movement)) {
      lines.push(`   • *Bộ máy (Movement):* ${ds.movement || p.movement}`);
    }
    if (cfg.includeFactory || cfg.includeVariant) {
      const fvParts = [
        cfg.includeFactory ? `*Nhà máy:* ${factory}` : null,
        cfg.includeVariant ? `*Phiên bản chọn:* ${variantName}` : null
      ].filter(Boolean);
      if (fvParts.length > 0) lines.push(`   • ${fvParts.join(' | ')}`);
    }
    lines.push(`   • *Số lượng:* ${qty} | *Giá:* ${cfg.priceLabel || 'Liên hệ'}`);
    if (cfg.includeImageUrl && p.primaryImage) lines.push(`   • *Ảnh sản phẩm:* ${p.primaryImage}`);
    if (cfg.includeProductUrl && pageLink) lines.push(`   • *Link sản phẩm:* ${pageLink}`);
  });

  lines.push(`───────────────`);
  lines.push(``);
  lines.push(`💰 *BÁO GIÁ:* *Giá: ${cfg.priceLabel || 'Liên hệ (Nhận báo giá VIP & kiểm tra kho trực tiếp)'}*`);

  if (cfg.includeServicesBlock && cfg.servicesText) {
    lines.push(``);
    lines.push(cfg.servicesTitle || `🛡 *QUYỀN LỢI KHÁCH HÀNG:*`);
    lines.push(cfg.servicesText);
  }

  if (cfg.orderClosingMessageTemplate) {
    lines.push(``);
    lines.push(cfg.orderClosingMessageTemplate);
  }

  return lines.join('\n');
}

/**
 * Format quick single-product WhatsApp inquiry / order message with FULL watch specifications (Contact for Price mode)
 * Respects Admin custom template configuration and variable interpolation.
 */
export function buildWhatsAppQuickProductMessage({
  watch = {},
  variantName = 'VS / Clean 1:1 Super Clone',
  quantity = 1,
  customer = {},
  notes = '',
  templateConfig = null
}) {
  const cfg = {
    ...getWhatsAppTemplateConfig(),
    ...(templateConfig || {})
  };

  const timestamp = new Date().toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const ds = watch?.dataSheet || watch?.data_sheet || {};
  const pid = watch?.product_id || watch?.id || 'N/A';
  const brand = watch?.brand ? watch.brand.toUpperCase() : 'LUXURY WATCH';
  const name = watch?.name || watch?.title || 'Master Clone Watch';
  const nickname = watch?.nickname ? `"${watch.nickname}"` : '';
  const ref = ds.modelReference || watch?.reference || watch?.modelCode || watch?.spu || pid;
  const factory = ds.factoryVersion || watch?.factory || 'VS / Clean Factory';
  const collectionModel = [watch?.collection, watch?.model].filter(Boolean).join(' • ');
  const dialColor = watch?.dial_color || ds.dial || '';
  const caseDim = ds.caseDimensions || watch?.caseSize || watch?.size_mm || '';
  const caseMat = ds.caseMaterial || watch?.case_material || watch?.material || '';
  const bracelet = watch?.bracelet_or_strap || ds.bracelet || '';
  const movement = ds.movement || watch?.movement || '';
  const waterRes = ds.waterResistance || watch?.water_resistance || watch?.waterResistance || '';
  const imageUrl = watch?.primaryImage || (Array.isArray(watch?.images) && watch.images[0]) || '';
  const pageLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/index-all-brands/${String(pid).toLowerCase()}`
      : '';
  const deliveryAddress = formatCustomerAddress(customer);
  const customerNote = (notes || customer.notes || '').trim();
  const priceLabel = cfg.priceLabel || 'Liên hệ (Yêu cầu báo giá trực tiếp)';

  const tokenVariables = {
    product_id: pid,
    brand,
    title: name,
    nickname,
    collection: collectionModel,
    ref,
    factory,
    variant: variantName,
    dial: dialColor,
    case_size: caseDim,
    material: caseMat,
    bracelet,
    movement,
    water_resistance: waterRes,
    quantity,
    price_label: priceLabel,
    image_url: imageUrl,
    product_url: pageLink,
    timestamp
  };

  if (cfg.useCustomRawTemplate && cfg.customRawTemplate && cfg.customRawTemplate.trim()) {
    let rendered = interpolateTemplateTokens(cfg.customRawTemplate, tokenVariables);
    if (customerNote) {
      rendered += `\n\n📝 *Ghi chú thêm:* ${customerNote}`;
    }
    return rendered;
  }

  const lines = [
    interpolateTemplateTokens(cfg.headerTitle || DEFAULT_WHATSAPP_TEMPLATE_CONFIG.headerTitle, tokenVariables),
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    cfg.includeTimestamp ? `⏱ *Thời gian:* ${timestamp}` : null,
    ``,
    `⌚ *THÔNG TIN CHI TIẾT ĐỒNG HỒ:*`,
    cfg.includeProductId ? `• *Mã Product ID:* *${pid}*` : null,
    `• *Mẫu đồng hồ:* *${brand} — ${name}*`,
    cfg.includeNickname && watch?.nickname ? `• *Nickname:* *"${watch.nickname}"*` : null,
    cfg.includeCollection && collectionModel ? `• *Bộ sưu tập / Dòng:* ${collectionModel}` : null,
    cfg.includeRef ? `• *Mã Ref / SPU:* ${ref}` : null,
    cfg.includeFactory ? `• *Nhà máy:* ${factory}` : null,
    cfg.includeVariant ? `• *Phiên bản máy yêu cầu:* *${variantName}*` : null,
    cfg.includeDial && dialColor ? `• *Màu mặt số (Dial):* ${dialColor}` : null,
    cfg.includeCaseSize && caseDim ? `• *Kích thước vỏ (Case):* ${caseDim}` : null,
    cfg.includeCaseMaterial && caseMat ? `• *Chất liệu vỏ:* ${caseMat}` : null,
    cfg.includeBracelet && bracelet ? `• *Dây đeo (Bracelet/Strap):* ${bracelet}` : null,
    cfg.includeMovement && movement ? `• *Bộ máy (Calibre):* ${movement}` : null,
    cfg.includeWaterResistance && waterRes ? `• *Chống nước:* ${waterRes}` : null,
    `• *Số lượng:* ${quantity}`,
    `• *Giá:* *${priceLabel}*`,
    cfg.includeImageUrl && imageUrl ? `• *Hình ảnh:* ${imageUrl}` : null,
    cfg.includeProductUrl && pageLink ? `• *Link sản phẩm:* ${pageLink}` : null,
    ``
  ].filter((line) => line !== null);

  if (customer.fullName || customer.phone || customer.email || deliveryAddress || customerNote) {
    lines.push(`👤 *THÔNG TIN KHÁCH HÀNG / GHI CHÚ:*`);
    if (customer.fullName) lines.push(`• *Họ và tên:* ${customer.fullName}`);
    if (customer.phone) lines.push(`• *SĐT / WhatsApp:* ${customer.phone}`);
    if (customer.email) lines.push(`• *Email:* ${customer.email}`);
    if (deliveryAddress) lines.push(`• *Địa chỉ giao hàng:* ${deliveryAddress}`);
    if (customerNote) lines.push(`• *Ghi chú yêu cầu:* ${customerNote}`);
    lines.push(``);
  }

  if (cfg.includeServicesBlock && cfg.servicesText) {
    lines.push(cfg.servicesTitle || `🛡 *DỊCH VỤ YÊU CẦU:*`);
    lines.push(interpolateTemplateTokens(cfg.servicesText, tokenVariables));
    lines.push(``);
  }

  if (cfg.closingMessageTemplate) {
    lines.push(interpolateTemplateTokens(cfg.closingMessageTemplate, tokenVariables));
  }

  return lines.join('\n');
}

/**
 * Generate full WhatsApp URL:
 * Always targets the store owner's phone number directly (https://wa.me/84977889986?text=...)
 * so mobile WhatsApp opens the chat with +84 97 788 99 86 instead of the "Gửi đến" contact picker.
 */
export function generateWhatsAppUrl(message = '', customPhone = null) {
  const rawPhone = (customPhone !== null ? customPhone : getStoreWhatsAppNumber()) || DEFAULT_WHATSAPP_NUMBER;
  const phone = normalizeWhatsAppPhone(rawPhone) || DEFAULT_WHATSAPP_NUMBER;
  const encodedText = message ? encodeURIComponent(message) : '';

  return encodedText
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://wa.me/${phone}`;
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
