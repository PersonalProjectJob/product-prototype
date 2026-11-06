import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function FloatingCartButton() {
  const {
    cartCount,
    cartSubtotalUSD,
    formatPrice,
    isCartOpen,
    isCheckoutOpen,
    isAdminOpen,
    setIsCartOpen
  } = useStore();

  // Hide FAB when Cart Drawer, Checkout Modal, or Admin Dashboard is already open
  if (isCartOpen || isCheckoutOpen || isAdminOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open Shopping Cart"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 group flex items-center justify-center sm:gap-2.5 bg-obsidian-950 hover:bg-black text-white w-13 h-13 min-w-[52px] min-h-[52px] sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-gold-500/40 hover:border-gold-400 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingBag className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
        <span
          className={`absolute -top-2 -right-2.5 min-w-[19px] h-[19px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-sm ${
            cartCount > 0
              ? 'bg-[#008A38] text-white'
              : 'bg-neutral-700 text-white/80'
          }`}
        >
          {cartCount}
        </span>
      </div>

      {cartCount > 0 ? (
        <div className="hidden sm:flex flex-col items-start leading-tight pr-0.5">
          <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
            Giỏ hàng ({cartCount})
          </span>
          <span className="text-sm font-mono font-extrabold text-gold-400">
            {formatPrice(cartSubtotalUSD)}
          </span>
        </div>
      ) : (
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white/90 pr-0.5">
          Bag
        </span>
      )}
    </button>
  );
}
