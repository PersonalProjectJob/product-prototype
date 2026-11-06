import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  WHATSAPP_CONTACT_NAME,
  WHATSAPP_QR_CODE_IMAGE,
  WHATSAPP_QR_CARD_IMAGE,
  formatWhatsAppDisplayPhone,
  buildWhatsAppOrderMessage,
  generateWhatsAppUrl,
  copyOrderMessageToClipboard
} from '../services/whatsappService';
import WhatsAppIcon from './common/WhatsAppIcon';

export default function OnePageCheckout() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartCount,
    cartSubtotalUSD,
    freeShippingUnlocked,
    appliedCoupon,
    currency,
    formatPrice,
    placeOrder,
    whatsappNumber,
    sendOrderToWhatsApp
  } = useStore();
  const displayWhatsappPhone = formatWhatsAppDisplayPhone(whatsappNumber);

  // Form State (No paymentMethod — only Customer Info & Product Info)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: 'Vietnam',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompletedData, setOrderCompletedData] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Pricing math
  const discountAmountUSD = appliedCoupon
    ? (cartSubtotalUSD * appliedCoupon.discountPercent) / 100
    : 0;

  const afterCouponUSD = cartSubtotalUSD - discountAmountUSD;
  const shippingFeeUSD = freeShippingUnlocked ? 0 : 35;
  const finalTotalUSD = Math.max(0, afterCouponUSD + shippingFeeUSD);

  // Live preview of the WhatsApp message that will be pushed to Owner
  const liveOrderPreviewMessage = useMemo(() => {
    const activeItems = orderCompletedData?.items || cart;
    const activeCustomer = orderCompletedData?.customer || formData;
    const activeTotalUSD = orderCompletedData ? orderCompletedData.totalUSD : finalTotalUSD;
    const activeOrderId = orderCompletedData?.orderId || 'CW-PREVIEW';

    return buildWhatsAppOrderMessage({
      orderId: activeOrderId,
      customer: activeCustomer,
      items: activeItems,
      totalUSD: activeTotalUSD,
      totalFormatted: formatPrice(activeTotalUSD),
      coupon: appliedCoupon,
      shippingFee: shippingFeeUSD,
      notes: activeCustomer.notes || ''
    });
  }, [formData, cart, finalTotalUSD, appliedCoupon, shippingFeeUSD, orderCompletedData, formatPrice]);

  if (!isCheckoutOpen) return null;

  const countries = [
    'Vietnam',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Switzerland',
    'Netherlands',
    'Italy',
    'Spain',
    'Japan',
    'Singapore',
    'United Arab Emirates'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Vui lòng nhập họ và tên / Full Name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Vui lòng nhập SĐT / WhatsApp để Owner liên hệ';
    }
    if (formData.email.trim() && !formData.email.includes('@')) {
      errs.email = 'Email không đúng định dạng';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCopyMessage = async (textToCopy = liveOrderPreviewMessage) => {
    const ok = await copyOrderMessageToClipboard(textToCopy);
    if (ok) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleCloseModal = () => {
    setOrderCompletedData(null);
    setIsCheckoutOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const itemsSnapshot = [...cart];
    setIsSubmitting(true);

    setTimeout(() => {
      const order = placeOrder({
        customer: formData,
        items: itemsSnapshot,
        currency,
        totalUSD: finalTotalUSD,
        notes: formData.notes
      });

      setOrderCompletedData(order);
      setIsSubmitting(false);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);

      sendOrderToWhatsApp({
        orderId: order.orderId,
        customer: formData,
        items: itemsSnapshot,
        totalUSD: finalTotalUSD,
        totalFormatted: formatPrice(finalTotalUSD),
        coupon: appliedCoupon,
        shippingFee: shippingFeeUSD,
        notes: formData.notes
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative bg-white w-full max-w-5xl shadow-2xl border border-obsidian-800/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-obsidian-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Đặt Hàng Trực Tiếp Qua WhatsApp &bull; {WHATSAPP_CONTACT_NAME}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Close checkout"
            className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompletedData ? (
          // ===================== ORDER SUCCESS & WHATSAPP DISPATCH SCREEN =====================
          <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-[#008A38] uppercase tracking-widest block">
                Đã Tạo Đơn &amp; Đẩy Thông Tin Sang WhatsApp
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold uppercase text-obsidian-950">
                Cảm ơn {orderCompletedData.customer.fullName}!
              </h3>
              <p className="text-xs sm:text-sm text-obsidian-800/70 max-w-xl mx-auto">
                Mã đơn hàng của bạn là <strong className="font-mono text-obsidian-950">#{orderCompletedData.orderId}</strong>. Thông tin khách hàng và danh sách sản phẩm đã được sao chép sẵn và chuyển tới WhatsApp của <strong className="text-obsidian-950">{WHATSAPP_CONTACT_NAME}</strong> để Owner liên hệ xác nhận &amp; gửi video 4K QC.
              </p>
            </div>

            {/* Two-column QR Card + Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Left: Official WhatsApp QR Card */}
              <div className="md:col-span-5 bg-emerald-50/60 border border-[#25D366]/40 rounded-xl p-4 flex flex-col items-center justify-between text-center space-y-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider">
                    <WhatsAppIcon className="w-3 h-3 flex-shrink-0" />
                    <span>Mã QR WhatsApp Owner</span>
                  </span>
                  <h4 className="text-sm font-bold text-obsidian-950 pt-1">
                    {WHATSAPP_CONTACT_NAME}
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-[#008A38]">
                    {displayWhatsappPhone}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-obsidian-800/10 shadow-sm">
                  <img
                    src={WHATSAPP_QR_CARD_IMAGE}
                    alt={`Mã QR WhatsApp ${WHATSAPP_CONTACT_NAME}`}
                    className="w-44 h-auto object-contain mx-auto"
                  />
                </div>

                <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                  Quét mã QR bằng camera WhatsApp hoặc bấm nút bên dưới để mở khung chat với Owner, sau đó <strong>Dán (Paste)</strong> thông tin đơn hàng.
                </p>
              </div>

              {/* Right: Customer & Order Info Box + Message Preview */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="bg-obsidian-800/5 border border-obsidian-800/10 rounded-xl p-4 text-xs space-y-2 font-mono">
                  <div className="flex justify-between gap-2">
                    <span className="text-obsidian-800/60">Mã đơn hàng:</span>
                    <span className="font-bold text-obsidian-950">#{orderCompletedData.orderId}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-obsidian-800/60">Khách hàng:</span>
                    <span className="font-semibold text-obsidian-950">{orderCompletedData.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-obsidian-800/60">SĐT / WhatsApp:</span>
                    <span className="font-semibold text-emerald-700">{orderCompletedData.customer.phone}</span>
                  </div>
                  {orderCompletedData.customer.email && (
                    <div className="flex justify-between gap-2">
                      <span className="text-obsidian-800/60">Email:</span>
                      <span className="font-semibold text-obsidian-950 truncate">{orderCompletedData.customer.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-obsidian-800/10 text-sm font-bold">
                    <span>Tổng giá trị đơn hàng:</span>
                    <span className="text-gold-600">{formatPrice(orderCompletedData.totalUSD)}</span>
                  </div>
                </div>

                {/* Formatted WhatsApp Message Box */}
                <div className="flex-1 flex flex-col border border-obsidian-800/15 rounded-xl overflow-hidden bg-white">
                  <div className="bg-obsidian-950 text-white px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold truncate min-w-0">Nội dung đơn hàng WhatsApp:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(liveOrderPreviewMessage)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded text-[10px] font-bold transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-300">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 flex-shrink-0" />
                          <span>Sao chép tin nhắn</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-obsidian-900 whitespace-pre-wrap break-words max-h-40 overflow-y-auto overflow-x-hidden bg-neutral-50 leading-relaxed">
                    {liveOrderPreviewMessage}
                  </pre>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  sendOrderToWhatsApp({
                    orderId: orderCompletedData.orderId,
                    customer: orderCompletedData.customer,
                    items: orderCompletedData.items || cart,
                    totalUSD: orderCompletedData.totalUSD,
                    totalFormatted: formatPrice(orderCompletedData.totalUSD),
                    coupon: appliedCoupon,
                    shippingFee: shippingFeeUSD,
                    notes: orderCompletedData.customer.notes
                  });
                }}
                className="w-full px-4 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] sm:text-xs uppercase tracking-wide sm:tracking-wider flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                <span className="sm:hidden">Mở WhatsApp ({displayWhatsappPhone}) &bull; Gửi Đơn</span>
                <span className="hidden sm:inline">Mở WhatsApp ({WHATSAPP_CONTACT_NAME} &bull; {displayWhatsappPhone}) &amp; Gửi Lại Đơn Hàng</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full px-4 py-3 bg-obsidian-950 hover:bg-obsidian-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wide sm:tracking-wider transition-colors whitespace-nowrap"
              >
                Quay Lại Cửa Hàng / Return To Storefront
              </button>
            </div>
          </div>
        ) : (
          // ===================== CHECKOUT FORM (CUSTOMER + PRODUCT + WHATSAPP INFO) =====================
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-obsidian-800/10">
            {/* Left 7 Columns: Customer Inputs + WhatsApp QR Info Section */}
            <div className="lg:col-span-7 p-5 sm:p-8 space-y-6 overflow-y-auto max-h-[82vh]">
              {/* Step 1: Customer Contact (Required: Full Name & Phone/WhatsApp, Optional: Email) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-obsidian-950 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Thông Tin Khách Hàng (Customer Contact)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/80 mb-1">
                      Họ và tên / Full Name <span className="text-crimson-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="VD: Nguyễn Văn A / Alexander Wright"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.fullName ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.fullName && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/80 mb-1">
                      Số điện thoại / WhatsApp <span className="text-crimson-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="VD: 0901234567 / +84 901 234 567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.phone ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.phone && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Email <span className="text-obsidian-800/40 font-normal">(Không bắt buộc / Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@domain.com (Nhận thêm thông báo & video 4K QC)"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.email ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.email && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Step 2: Optional Shipping Destination & Notes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-obsidian-950 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Địa Chỉ Giao Hàng &amp; Ghi Chú</span>
                  </span>
                  <span className="text-[10px] font-normal text-obsidian-800/50 normal-case">
                    (Không bắt buộc / Optional)
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Quốc gia / Country <span className="text-obsidian-800/40 font-normal">(Tùy chọn)</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-obsidian-800/20 focus:outline-none focus:border-gold-500 bg-white"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Địa chỉ nhận hàng / Street Address <span className="text-obsidian-800/40 font-normal">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-obsidian-800/20 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Thành phố / City <span className="text-obsidian-800/40 font-normal">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="VD: TP. Hồ Chí Minh / Hà Nội"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-obsidian-800/20 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Mã bưu điện / Postal Code <span className="text-obsidian-800/40 font-normal">(Không bắt buộc)</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="VD: 700000"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-obsidian-800/20 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">
                      Ghi chú đơn hàng / Order Notes <span className="text-obsidian-800/40 font-normal">(Không bắt buộc)</span>
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Ghi chú thêm cho Owner (kích thước cổ tay, yêu cầu quay video QC góc máy, thời gian liên hệ...)"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-obsidian-800/20 focus:outline-none focus:border-gold-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Mục Thông Tin WhatsApp — Thanh Phuong Luxury Watch */}
              <div id="whatsapp-dispatch-section">
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#25D366] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Thông Tin Liên Hệ WhatsApp &bull; {WHATSAPP_CONTACT_NAME}</span>
                </h3>

                <div className="border-2 border-[#25D366] bg-emerald-50/40 p-3 sm:p-4 space-y-4">
                  {/* Top Row: QR Code Card + Owner Contact Info */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 border border-emerald-200">
                    <div className="w-28 h-28 flex-shrink-0 bg-white border border-obsidian-800/10 p-1.5 rounded-lg shadow-xs flex items-center justify-center">
                      <img
                        src={WHATSAPP_QR_CODE_IMAGE}
                        alt={`Mã QR WhatsApp ${WHATSAPP_CONTACT_NAME}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#25D366]/15 text-[#008A38] text-[10px] font-bold uppercase tracking-wider">
                        <QrCode className="w-3 h-3 flex-shrink-0" />
                        <span>Kênh Chốt Đơn Trực Tiếp Với Owner</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-obsidian-950">
                        {WHATSAPP_CONTACT_NAME} <span className="font-mono text-[#008A38]">({displayWhatsappPhone})</span>
                      </h4>

                      <p className="text-[11px] text-obsidian-800/70 leading-relaxed">
                        Khi bạn bấm <strong>Hoàn Tất Đặt Hàng</strong>, hệ thống sẽ tự động đẩy toàn bộ <strong>Thông tin khách hàng</strong> và <strong>Thông tin sản phẩm mua</strong> tới số WhatsApp <strong>{displayWhatsappPhone}</strong> để Owner liên hệ tư vấn &amp; gửi video kiểm định 4K QC.
                      </p>

                      <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <a
                          href={generateWhatsAppUrl(liveOrderPreviewMessage, whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008A38] hover:underline whitespace-nowrap"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span>Mở chat WhatsApp: {displayWhatsappPhone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview of Customer + Order Info to be pushed to WhatsApp */}
                  <div className="border border-emerald-200 bg-white overflow-hidden">
                    <div className="bg-obsidian-950 text-white px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold flex items-center gap-1.5 min-w-0">
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
                        <span className="truncate">
                          <span className="sm:hidden">Xem trước tin nhắn:</span>
                          <span className="hidden sm:inline">Bản xem trước tin nhắn đơn hàng gửi qua WhatsApp:</span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(liveOrderPreviewMessage)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded text-[10px] font-bold transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {copiedMessage ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="text-emerald-300">Đã copy!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 flex-shrink-0" />
                            <span>Copy nội dung</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-obsidian-900 whitespace-pre-wrap break-words max-h-36 overflow-y-auto overflow-x-hidden bg-neutral-50/80 leading-relaxed">
                      {liveOrderPreviewMessage}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Sticky Product Summary & Submit */}
            <div className="lg:col-span-5 p-5 sm:p-8 bg-obsidian-800/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-4 pb-2 border-b border-obsidian-800/10">
                  Thông Tin Sản Phẩm Mua ({cartCount} sản phẩm)
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-6 divide-y divide-obsidian-800/10">
                  {cart.map(({ product, quantity, variantName, priceUSD }) => {
                    const unitRate = Number(priceUSD || product.priceUSD || product.variant1Price || 700);
                    const itemImg = Array.isArray(product.images) && product.images[0]
                      ? product.images[0]
                      : (product.primaryImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80');

                    return (
                      <div key={`${product.id}-${variantName || 'v'}`} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={itemImg}
                            alt={product.name}
                            className="w-11 h-11 object-cover border border-obsidian-800/10 flex-shrink-0 bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-obsidian-950 truncate max-w-[180px]">{product.name}</p>
                            <p className="text-[10px] text-obsidian-800/60 font-mono">
                              <span className="text-gold-700 font-semibold">{variantName || 'Swiss Movement'}</span> &bull; SL: {quantity} &times; {formatPrice(unitRate)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold flex-shrink-0">{formatPrice(unitRate * quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2 text-xs pt-4 border-t border-obsidian-800/10">
                  <div className="flex justify-between text-obsidian-800/70">
                    <span>Tạm tính (Subtotal):</span>
                    <span className="font-mono">{formatPrice(cartSubtotalUSD)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Mã ưu đãi VIP ({appliedCoupon.code} -{appliedCoupon.discountPercent}%):</span>
                      <span className="font-mono">-{formatPrice(discountAmountUSD)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-obsidian-800/70">
                    <span>Vận chuyển nhanh (DHL Express):</span>
                    <span className="font-mono font-medium">
                      {freeShippingUnlocked ? (
                        <span className="text-emerald-700 font-bold">MIỄN PHÍ ($0)</span>
                      ) : (
                        formatPrice(35)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-obsidian-950 pt-3 border-t border-obsidian-800/20">
                    <span>Tổng Cộng (Total):</span>
                    <span className="font-mono text-xl text-gold-600">
                      {formatPrice(finalTotalUSD)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-obsidian-800/10 text-[11px] text-obsidian-800/70 space-y-1">
                  <p className="font-bold text-obsidian-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cam Kết Từ {WHATSAPP_CONTACT_NAME}:
                  </p>
                  <p>1. Owner liên hệ trực tiếp qua WhatsApp &amp; gửi video 4K QC trước khi giao.</p>
                  <p>2. Bảo hiểm thông quan 100%, hỗ trợ đổi mới 1:1.</p>
                  <p>3. Bảo hành máy cơ 5 năm toàn cầu.</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wide sm:tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  {isSubmitting ? (
                    <span>Đang đẩy đơn sang WhatsApp...</span>
                  ) : (
                    <>
                      <span className="sm:hidden">Hoàn Tất Đặt Hàng &bull; Gửi WhatsApp</span>
                      <span className="hidden sm:inline">Hoàn Tất Đặt Hàng &bull; Gửi Qua WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
