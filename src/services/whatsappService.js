/**
 * WhatsApp Sales Dispatch Service
 * Ben Thanh Luxury / CloneWatches SaaS
 * 
 * Handles formatting order details, customer contact information,
 * and dispatching 1-click orders to WhatsApp sales reps.
 */

export const DEFAULT_WHATSAPP_NUMBER = '84900000000'; // Default store sale phone (E.164 format without +)

/**
 * Get configured sales WhatsApp number
 */
export function getStoreWhatsAppNumber() {
  try {
    const saved = localStorage.getItem('cw_whatsapp_number');
    if (saved && saved.trim()) {
      return saved.replace(/[^0-9]/g, '');
    }
  } catch (e) {
    console.warn('Could not read WhatsApp number from storage:', e);
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Set custom sales WhatsApp number (e.g. from Admin settings)
 */
export function setStoreWhatsAppNumber(phoneNumber) {
  const clean = String(phoneNumber).replace(/[^0-9]/g, '');
  if (clean) {
    localStorage.setItem('cw_whatsapp_number', clean);
  }
}

/**
 * Format full multi-item order message for WhatsApp
 */
export function buildWhatsAppOrderMessage({
  orderId,
  customer = {},
  items = [],
  totalFormatted = '',
  totalUSD = 0,
  notes = '',
  coupon = null,
  paymentMethod = 'WhatsApp VIP Concierge',
  shippingFee = 0
}) {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const lines = [
    `👑 *NEW VIP ORDER DISPATCH — BEN THANH LUXURY* 👑`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* #${orderId || 'CW-' + Math.floor(100000 + Math.random() * 900000)}`,
    `⏱ *Order Time:* ${timestamp}`,
    ``,
    `👤 *CUSTOMER PROFILE:*`,
    `• *Full Name:* ${customer.fullName || 'VIP Client'}`,
    `• *Phone / WhatsApp:* ${customer.phone || 'Not provided'}`,
    `• *Email:* ${customer.email || 'Not provided'}`,
    `• *Delivery Address:* ${customer.address || ''}${customer.city ? ', ' + customer.city : ''}${customer.state ? ', ' + customer.state : ''}${customer.country ? ', ' + customer.country : ''}${customer.postalCode ? ' (' + customer.postalCode + ')' : ''}`,
    customer.notes || notes ? `• *Special Note:* ${customer.notes || notes}` : null,
    ``,
    `🛍 *ORDER ITEMS (${items.length} item${items.length > 1 ? 's' : ''}):*`
  ].filter(line => line !== null);

  items.forEach((item, index) => {
    const p = item.product || item;
    const name = p.name || 'Master Clone Watch';
    const ref = p.modelCode || p.spu || 'N/A';
    const factory = p.factory || 'VS / Clean Factory';
    const variantName = item.variantName || 'VS / Clean 1:1 Super Clone';
    const qty = item.quantity || 1;
    const unitPrice = item.priceUSD || p.variant2Price || p.priceUSD || 1199;
    const subtotal = unitPrice * qty;

    lines.push(`───────────────`);
    lines.push(`${index + 1}️⃣ *${p.brand ? p.brand.toUpperCase() + ' ' : ''}${name}*`);
    lines.push(`   • *Ref:* ${ref} | *Factory:* ${factory}`);
    lines.push(`   • *Calibre Tier:* ${variantName}`);
    lines.push(`   • *Qty:* ${qty} × $${unitPrice.toLocaleString()} USD`);
    lines.push(`   • *Item Total:* $${subtotal.toLocaleString()} USD`);
  });

  lines.push(`───────────────`);
  lines.push(``);
  lines.push(`💰 *PRICING & SETTLEMENT:*`);
  if (coupon) {
    lines.push(`• *VIP Promo:* ${coupon.code} (-${coupon.discountPercent}%)`);
  }
  lines.push(`• *Shipping:* ${shippingFee === 0 ? 'FREE DHL Express Priority' : '$35 USD'}`);
  lines.push(`• *Payment Preference:* ${paymentMethod}`);
  lines.push(`👉 *TOTAL DUE:* *${totalFormatted || '$' + totalUSD.toLocaleString() + ' USD'}*`);
  lines.push(``);
  lines.push(`🛡 *GUARANTEED CLIENT BENEFITS:*`);
  lines.push(`✓ 4K QC inspection video & Timegrapher test report before dispatch`);
  lines.push(`✓ 100% Customs seizure insurance & free reshipment warranty`);
  lines.push(`✓ 5-Year movement mechanical warranty`);
  lines.push(``);
  lines.push(`💬 _"Hello Sale team, I have placed this order on the website. Please confirm stock availability and send me the 4K Timegrapher QC video link. Thank you!"_`);

  return lines.join('\n');
}

/**
 * Format quick single-product WhatsApp order message
 */
export function buildWhatsAppQuickProductMessage({
  watch,
  variantName = 'VS / Clean 1:1 Super Clone',
  variantPrice = 1199,
  quantity = 1,
  customer = {},
  notes = ''
}) {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const total = variantPrice * quantity;
  const brand = watch.brand ? watch.brand.toUpperCase() : 'ROLEX';
  const name = watch.name || 'Master Clone Watch';
  const ref = watch.modelCode || watch.spu || 'N/A';
  const factory = watch.factory || 'VS / Clean Factory';

  const lines = [
    `👑 *DIRECT PRODUCT INQUIRY & ORDER — BEN THANH LUXURY* 👑`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⏱ *Inquiry Time:* ${timestamp}`,
    ``,
    `⌚ *WATCH SPECIFICATIONS:*`,
    `• *Model:* *${brand} ${name}*`,
    `• *Reference / SPU:* ${ref}`,
    `• *Factory:* ${factory}`,
    `• *Selected Calibre Tier:* *${variantName}*`,
    `• *Quantity:* ${quantity}`,
    `• *Unit Price:* $${variantPrice.toLocaleString()} USD`,
    `👉 *ESTIMATED TOTAL:* *$${total.toLocaleString()} USD*`,
    ``
  ];

  if (customer.fullName || customer.phone || customer.address) {
    lines.push(`👤 *DELIVERY CONTACT:*`);
    if (customer.fullName) lines.push(`• *Name:* ${customer.fullName}`);
    if (customer.phone) lines.push(`• *Phone / WhatsApp:* ${customer.phone}`);
    if (customer.address) lines.push(`• *Shipping Address:* ${customer.address}`);
    if (notes || customer.notes) lines.push(`• *Customer Note:* ${notes || customer.notes}`);
    lines.push(``);
  }

  lines.push(`🛡 *REQUESTED SERVICES:*`);
  lines.push(`✓ Request live 4K QC video & Timegrapher rate check (+/- 2s/day)`);
  lines.push(`✓ Free DHL/FedEx Express Priority Air Shipping`);
  lines.push(`✓ 5-Year Calibre Mechanical Warranty`);
  lines.push(``);
  lines.push(`💬 _"Hello Sale, I am interested in this exact timepiece. Please check stock and advise on payment & QC video delivery!"_`);

  return lines.join('\n');
}

/**
 * Generate full WhatsApp URL
 */
export function generateWhatsAppUrl(message, customPhone = null) {
  const phone = (customPhone || getStoreWhatsAppNumber()).replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedText}`;
}

/**
 * 1-Click Dispatch: Opens WhatsApp chat in a new browser tab/window
 */
export function openWhatsAppChat(message, customPhone = null) {
  const url = generateWhatsAppUrl(message, customPhone);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
