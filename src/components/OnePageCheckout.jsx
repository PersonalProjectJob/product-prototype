import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowLeft, CreditCard, Coins, Landmark, AlertCircle } from 'lucide-react';
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
    sendOrderToWhatsApp
  } = useStore();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'whatsapp', // 'whatsapp' | 'crypto' | 'credit_card' | 'wise'
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompletedData, setOrderCompletedData] = useState(null);

  if (!isCheckoutOpen) return null;

  // Pricing math
  const discountAmountUSD = appliedCoupon
    ? (cartSubtotalUSD * appliedCoupon.discountPercent) / 100
    : 0;

  const afterCouponUSD = cartSubtotalUSD - discountAmountUSD;

  // Extra 5% discount if paying with Crypto
  const isCrypto = formData.paymentMethod === 'crypto';
  const cryptoDiscountUSD = isCrypto ? (afterCouponUSD * 0.05) : 0;

  const shippingFeeUSD = freeShippingUnlocked ? 0 : 35;
  const finalTotalUSD = Math.max(0, afterCouponUSD - cryptoDiscountUSD + shippingFeeUSD);

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Switzerland", "Netherlands", "Italy", 
    "Spain", "Japan", "Singapore", "United Arab Emirates"
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
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid Email is required for 4K QC video';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required for DHL/FedEx';
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal Code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const order = placeOrder({
        customer: formData,
        items: cart,
        paymentMethod: formData.paymentMethod,
        currency,
        totalUSD: finalTotalUSD,
        notes: formData.notes
      });
      setOrderCompletedData(order);
      setIsSubmitting(false);

      if (formData.paymentMethod === 'whatsapp') {
        sendOrderToWhatsApp({
          orderId: order.orderId,
          customer: formData,
          items: cart,
          totalUSD: finalTotalUSD,
          totalFormatted: formatPrice(finalTotalUSD),
          coupon: appliedCoupon,
          shippingFee: shippingFeeUSD,
          notes: formData.notes,
          paymentMethod: 'WhatsApp VIP Concierge'
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white w-full max-w-5xl shadow-2xl border border-obsidian-800/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="bg-obsidian-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-gold-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              One-Page Express Checkout &bull; 256-Bit Encrypted
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1 hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompletedData ? (
          // Order Success Screen inside modal
          <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-gold-600 uppercase tracking-widest">
                Order Received Successfully
              </span>
              <h3 className="text-2xl font-extrabold uppercase text-obsidian-950">
                Thank You, {orderCompletedData.customer.fullName}!
              </h3>
              <p className="text-xs sm:text-sm text-obsidian-800/70">
                Your order ID is <strong className="font-mono text-obsidian-950">{orderCompletedData.orderId}</strong>. A confirmation email and Timegrapher 4K QC video link will be sent to <strong className="text-obsidian-950">{orderCompletedData.customer.email}</strong> within 24-48 hours.
              </p>
            </div>

            <div className="bg-obsidian-800/5 border border-obsidian-800/10 p-5 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-obsidian-800/60">Estimated Dispatch:</span>
                <span className="font-semibold text-obsidian-950">DHL Express Priority (3–5 Days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-800/60">Tracking Code:</span>
                <span className="font-semibold text-emerald-700">{orderCompletedData.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-800/60">Payment Selected:</span>
                <span className="font-semibold uppercase text-obsidian-950">{orderCompletedData.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-obsidian-800/10 text-sm font-bold">
                <span>Total Paid:</span>
                <span className="text-gold-600">{formatPrice(orderCompletedData.totalUSD)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  sendOrderToWhatsApp({
                    orderId: orderCompletedData.orderId,
                    customer: orderCompletedData.customer,
                    items: orderCompletedData.items || cart,
                    totalUSD: orderCompletedData.totalUSD,
                    totalFormatted: formatPrice(orderCompletedData.totalUSD),
                    paymentMethod: 'WhatsApp VIP Concierge'
                  });
                }}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Open / Re-send Order to WhatsApp Sale Rep</span>
              </button>

              <button
                onClick={() => {
                  setOrderCompletedData(null);
                  setIsCheckoutOpen(false);
                }}
                className="w-full py-3 bg-obsidian-950 hover:bg-obsidian-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Return To Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-obsidian-800/10">
            
            {/* Left 7 Columns: Form Input Sections */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[80vh]">
              
              {/* Step 1: Customer Contact */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-obsidian-950 text-white flex items-center justify-center text-[10px]">1</span>
                  Customer &amp; 4K QC Delivery Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Alexander Wright"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.fullName ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.fullName && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Email (For 4K QC Video) *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alexander@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.email ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.email && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Phone / WhatsApp (For Courier &amp; Live QC Approval) *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.phone ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.phone && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-obsidian-950 text-white flex items-center justify-center text-[10px]">2</span>
                  Discreet Worldwide Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Country / Region *</label>
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
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.address ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.address && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. London / New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.city ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.city && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-obsidian-800/70 mb-1">Postal / ZIP Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="e.g. 90210"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 border ${errors.postalCode ? 'border-crimson-600' : 'border-obsidian-800/20'} focus:outline-none focus:border-gold-500`}
                    />
                    {errors.postalCode && <p className="text-[10px] text-crimson-600 mt-0.5">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-obsidian-950 text-white flex items-center justify-center text-[10px]">3</span>
                  Payment Gateway Selection
                </h3>

                <div className="space-y-2.5">
                  {/* Option 0: WhatsApp VIP Concierge (Recommended) */}
                  <label 
                    className={`block p-3.5 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'whatsapp'
                        ? 'border-[#25D366] bg-emerald-50/50 ring-1 ring-[#25D366]'
                        : 'border-obsidian-800/20 hover:border-obsidian-800/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="whatsapp"
                          checked={formData.paymentMethod === 'whatsapp'}
                          onChange={handleInputChange}
                          className="accent-[#25D366]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                            <span className="text-xs font-bold uppercase text-obsidian-950">
                              WhatsApp VIP Concierge (Sale Support &amp; 4K QC Video)
                            </span>
                          </div>
                          <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                            Direct horologist assistance &bull; Live Timegrapher video (+/- 2s/day) sent before payment
                          </p>
                        </div>
                      </div>
                      <span className="bg-[#25D366] text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded">
                        Recommended
                      </span>
                    </div>

                    {formData.paymentMethod === 'whatsapp' && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 text-[11px] text-obsidian-800/80 bg-white p-3 space-y-1">
                        <p className="font-semibold text-emerald-800">Direct VIP Order Dispatch Enabled:</p>
                        <p className="text-[10px] text-obsidian-800/70">
                          When you click Complete Order, your full delivery address and ordered timepieces will be pre-formatted and sent directly to our WhatsApp senior sales team for immediate processing.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Option A: Crypto (-5% discount) */}
                  <label 
                    className={`block p-3.5 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'crypto'
                        ? 'border-gold-500 bg-gold-50/50 ring-1 ring-gold-500'
                        : 'border-obsidian-800/20 hover:border-obsidian-800/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="crypto"
                          checked={formData.paymentMethod === 'crypto'}
                          onChange={handleInputChange}
                          className="accent-gold-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-gold-600" />
                            <span className="text-xs font-bold uppercase text-obsidian-950">
                              Cryptocurrency (USDT TRC20 / BTC / ETH)
                            </span>
                          </div>
                          <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                            100% Anonymous &amp; Untraceable &bull; Instant confirmation
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                        Save 5% Extra
                      </span>
                    </div>

                    {formData.paymentMethod === 'crypto' && (
                      <div className="mt-3 pt-3 border-t border-gold-500/20 text-[11px] text-obsidian-800/80 bg-white p-3 space-y-1 font-mono">
                        <p className="font-semibold text-obsidian-950">USDT TRC20 Official Reception Vault:</p>
                        <p className="bg-obsidian-800/5 p-1.5 border border-obsidian-800/10 text-[10px] break-all select-all">
                          TYq94mZc8BvU17qKxL2PReW88vVSF99cloneWatches
                        </p>
                        <p className="text-[10px] text-emerald-700">QR code and exact payment sum generated upon order submission.</p>
                      </div>
                    )}
                  </label>

                  {/* Option B: Credit / Debit Card */}
                  <label 
                    className={`block p-3.5 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'credit_card'
                        ? 'border-gold-500 bg-gold-50/50 ring-1 ring-gold-500'
                        : 'border-obsidian-800/20 hover:border-obsidian-800/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="accent-gold-500"
                      />
                      <CreditCard className="w-4 h-4 text-obsidian-800" />
                      <div>
                        <span className="text-xs font-bold uppercase text-obsidian-950">
                          Credit / Debit Card (Visa &amp; Mastercard)
                        </span>
                        <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                          Discreet billing descriptor &bull; 3D Secure Protection
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option C: Wise / Bank Wire */}
                  <label 
                    className={`block p-3.5 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'wise'
                        ? 'border-gold-500 bg-gold-50/50 ring-1 ring-gold-500'
                        : 'border-obsidian-800/20 hover:border-obsidian-800/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wise"
                        checked={formData.paymentMethod === 'wise'}
                        onChange={handleInputChange}
                        className="accent-gold-500"
                      />
                      <Landmark className="w-4 h-4 text-obsidian-800" />
                      <div>
                        <span className="text-xs font-bold uppercase text-obsidian-950">
                          Wise.com / Bank Wire Transfer (Global IBAN)
                        </span>
                        <p className="text-[11px] text-obsidian-800/60 mt-0.5">
                          Zero exchange rate markup &bull; Manual reference verification
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Sticky Order Summary & Submit */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-obsidian-800/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-950 mb-4 pb-2 border-b border-obsidian-800/10">
                  Order Summary ({cartCount} Items)
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-6 divide-y divide-obsidian-800/10">
                  {cart.map(({ product, quantity, variantName, priceUSD }) => {
                    const unitRate = Number(priceUSD || product.priceUSD || product.variant1Price || 700);
                    const itemImg = Array.isArray(product.images) && product.images[0]
                      ? product.images[0]
                      : (product.primaryImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80');

                    return (
                      <div key={`${product.id}-${variantName || 'v'}`} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={itemImg}
                            alt={product.name}
                            className="w-10 h-10 object-cover border border-obsidian-800/10 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-obsidian-950 truncate max-w-[170px]">{product.name}</p>
                            <p className="text-[10px] text-obsidian-800/60 font-mono">
                              <span className="text-gold-700 font-semibold">{variantName || 'Swiss Movement'}</span> &bull; {quantity} &times; {formatPrice(unitRate)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold">{formatPrice(unitRate * quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2 text-xs pt-4 border-t border-obsidian-800/10">
                  <div className="flex justify-between text-obsidian-800/70">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatPrice(cartSubtotalUSD)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>VIP Promo ({appliedCoupon.code} -{appliedCoupon.discountPercent}%):</span>
                      <span className="font-mono">-{formatPrice(discountAmountUSD)}</span>
                    </div>
                  )}

                  {isCrypto && (
                    <div className="flex justify-between text-gold-600 font-bold bg-gold-50 p-1.5 border border-gold-200">
                      <span>Crypto Direct Discount (-5%):</span>
                      <span className="font-mono">-{formatPrice(cryptoDiscountUSD)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-obsidian-800/70">
                    <span>Priority Shipping (DHL Express):</span>
                    <span className="font-mono font-medium">
                      {freeShippingUnlocked ? (
                        <span className="text-emerald-700 font-bold">FREE ($0)</span>
                      ) : (
                        formatPrice(35)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-obsidian-950 pt-3 border-t border-obsidian-800/20">
                    <span>Final Total Due:</span>
                    <span className="font-mono text-xl text-gold-600">
                      {formatPrice(finalTotalUSD)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-obsidian-800/10 text-[11px] text-obsidian-800/70 space-y-1">
                  <p className="font-bold text-obsidian-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    CloneWatches Guarantee:
                  </p>
                  <p>1. 4K QC video sent before item is shipped.</p>
                  <p>2. If customs seizure occurs, free reshipment is 100% guaranteed.</p>
                  <p>3. 2-Year internal movement mechanical warranty.</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-obsidian-950 hover:bg-gold-500 hover:text-obsidian-950 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order Credentials...</span>
                  ) : (
                    <span>Complete Order &bull; Request 4K QC Video</span>
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
