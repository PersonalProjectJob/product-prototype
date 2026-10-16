import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Check, Truck } from 'lucide-react';
import WhatsAppIcon from './common/WhatsAppIcon';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotalUSD,
    freeShippingThreshold,
    freeShippingUnlocked,
    freeShippingProgress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    formatPrice,
    setIsCheckoutOpen,
    sendOrderToWhatsApp
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  if (!isCartOpen) return null;

  const discountAmountUSD = appliedCoupon
    ? (cartSubtotalUSD * appliedCoupon.discountPercent) / 100
    : 0;

  const finalTotalUSD = Math.max(0, cartSubtotalUSD - discountAmountUSD);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCoupon(inputCoupon);
    setInputCoupon('');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderViaWhatsApp = () => {
    sendOrderToWhatsApp({
      orderId: `CW-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart,
      totalUSD: finalTotalUSD + (freeShippingUnlocked ? 0 : 35),
      totalFormatted: formatPrice(finalTotalUSD + (freeShippingUnlocked ? 0 : 35)),
      coupon: appliedCoupon,
      shippingFee: freeShippingUnlocked ? 0 : 35,
      notes: orderNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-obsidian-950/70 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-obsidian-800/10 flex items-center justify-between bg-obsidian-950 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Your Shopping Bag ({cartCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-obsidian-900 text-white px-5 py-3 border-b border-white/10 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-gold-400" />
              {freeShippingUnlocked ? (
                <span className="text-emerald-400 font-bold">Free Priority Air Shipping Unlocked!</span>
              ) : (
                <span>
                  Add <strong className="text-gold-400">{formatPrice(freeShippingThreshold - cartSubtotalUSD)}</strong> for Free Express Delivery
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-white/60">{freeShippingProgress}%</span>
          </div>
          
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                freeShippingUnlocked ? 'bg-emerald-400' : 'bg-gold-500'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-obsidian-800/10">
          {cart.length > 0 ? (
            cart.map(({ product, quantity, variantName, priceUSD }) => {
              const itemUnitRate = Number(priceUSD || product.priceUSD || product.variant1Price || 700);
              const itemImg = Array.isArray(product.images) && product.images[0]
                ? product.images[0]
                : (product.primaryImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80');

              return (
                <div key={`${product.id}-${variantName || 'v'}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Watch Image */}
                  <div className="w-20 h-20 bg-obsidian-800/5 border border-obsidian-800/10 p-1 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={itemImg}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-obsidian-950 uppercase line-clamp-2">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(product.id, variantName)}
                          className="text-obsidian-800/40 hover:text-crimson-600 transition-colors p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant & Factory Tag */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="bg-obsidian-950 text-gold-400 font-bold px-1.5 py-0.5 uppercase text-[10px] tracking-wider">
                          {variantName || 'Swiss Movement'}
                        </span>
                        <span className="text-[11px] font-mono text-obsidian-800/60">
                          {product.caseSize || '40mm'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-obsidian-800/5">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-obsidian-800/20 text-xs">
                        <button
                          onClick={() => updateQuantity(product.id, variantName, -1)}
                          className="px-2 py-0.5 hover:bg-obsidian-800/10 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-mono font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, variantName, 1)}
                          className="px-2 py-0.5 hover:bg-obsidian-800/10 font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-obsidian-950">
                          {formatPrice(itemUnitRate * quantity)}
                        </span>
                        <div className="text-[10px] font-mono text-obsidian-800/50">
                          {formatPrice(itemUnitRate)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-obsidian-800/20 mx-auto mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-obsidian-950">
                Your Bag Is Empty
              </p>
              <p className="text-xs text-obsidian-800/60 mt-1 max-w-xs mx-auto">
                Explore our Swiss Calibre collection to find your next centerpiece timepiece.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-4 py-2 bg-obsidian-950 text-white text-xs font-bold uppercase tracking-wider"
              >
                Browse Watches
              </button>
            </div>
          )}
        </div>

        {/* Footer: Coupon, Totals & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-obsidian-800/10 bg-obsidian-800/5 space-y-4">
            
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent}%)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-crimson-600 hover:underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo Code (SUPERCLONE10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-obsidian-800/20 uppercase font-mono focus:border-gold-500 focus:outline-none"
                    />
                    <Tag className="w-3.5 h-3.5 text-obsidian-800/30 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-obsidian-950 text-white text-xs font-bold uppercase hover:bg-gold-500 hover:text-obsidian-950 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-crimson-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-obsidian-800/70">
                <span>Subtotal ({cartCount} items):</span>
                <span className="font-mono font-medium">{formatPrice(cartSubtotalUSD)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>VIP Discount ({appliedCoupon.discountPercent}%):</span>
                  <span className="font-mono">-{formatPrice(discountAmountUSD)}</span>
                </div>
              )}

              <div className="flex justify-between text-obsidian-800/70">
                <span>Estimated Priority Shipping:</span>
                <span className="font-mono font-medium">
                  {freeShippingUnlocked ? (
                    <span className="text-emerald-700 font-bold">FREE (Save $50)</span>
                  ) : (
                    formatPrice(35)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-obsidian-950 pt-2 border-t border-obsidian-800/10">
                <span>Estimated Total:</span>
                <span className="font-mono text-base text-gold-600">
                  {formatPrice(finalTotalUSD + (freeShippingUnlocked ? 0 : 35))}
                </span>
              </div>
            </div>

            {/* Checkout CTAs: WhatsApp VIP Order & Standard One-Page Checkout */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOrderViaWhatsApp}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Order Entire Bag via WhatsApp with Sale</span>
              </button>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-obsidian-950 hover:bg-obsidian-800 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all group"
              >
                <span>Proceed To One-Page Checkout</span>
                <ArrowRight className="w-4 h-4 text-gold-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-obsidian-800/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL 256-Bit Encrypted &bull; Discretion Guaranteed</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
