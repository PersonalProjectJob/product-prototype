import React, { useState, useMemo } from 'react';
import { useStore, getFigmaWatchThumbnail } from '../context/StoreContext';
import { ChevronRight, Eye, ShoppingBag, Check } from 'lucide-react';
import WhatsAppIcon from './common/WhatsAppIcon';

export default function DarkFeaturedSection() {
  const { watches, addToCart, setQuickViewProduct, formatPrice, sendQuickProductToWhatsApp, navigateToProduct } = useStore();
  const [activeTab, setActiveTab] = useState('Best');
  const [addedId, setAddedId] = useState(null);

  const tabs = ['Best', 'Best Price', 'Newest'];

  // Dynamically filter watches from CMS based on active tab
  const displayedWatches = useMemo(() => {
    if (!watches || watches.length === 0) return [];

    if (activeTab === 'Best') {
      // Top luxury showpieces: best sellers or high-rating models across Rolex, Omega, Patek, AP, Cartier
      const bestSellers = watches.filter(w => 
        w.badge === 'BEST SELLER' || 
        (w.variant2Price && w.variant2Price >= 1100) ||
        ['Patek Philippe', 'Audemars Piguet', 'Rolex', 'Omega', 'Cartier'].includes(w.brand)
      );
      return (bestSellers.length >= 8 ? bestSellers : watches).slice(0, 8);
    }

    if (activeTab === 'Best Price') {
      // Best value / accessible price models (e.g., Swiss Movement starting $600-$750)
      const sortedByPrice = [...watches].sort((a, b) => {
        const pA = a.variant1Price || a.priceUSD || 700;
        const pB = b.variant1Price || b.priceUSD || 700;
        return pA - pB;
      });
      return sortedByPrice.slice(0, 8);
    }

    if (activeTab === 'Newest') {
      // Fresh new releases from Clean / VS Factory
      return [...watches].slice(15, 23);
    }

    return watches.slice(0, 8);
  }, [watches, activeTab]);

  const handleAddToCart = (e, watch) => {
    e.stopPropagation();
    addToCart(watch, 1, {
      name: watch.variant2Name || 'VS / Clean 1:1 Super Clone',
      price: watch.variant2Price || 1199
    });
    setAddedId(watch.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleQuickWhatsApp = (e, watch) => {
    e.stopPropagation();
    sendQuickProductToWhatsApp({
      watch,
      variantName: watch.variant2Name || 'VS / Clean 1:1 Super Clone',
      variantPrice: watch.variant2Price || 1199,
      quantity: 1
    });
  };

  return (
    <section className="py-20 sm:py-24 bg-[#0C0C0C] text-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Top Navigation Bar */}
        <div className="flex items-center justify-between pb-8 mb-10 border-b border-white/10">
          {/* Left Tabs */}
          <div className="flex items-center space-x-8 sm:space-x-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm sm:text-base font-normal tracking-wide relative pb-2 transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right Link */}
          <button
            onClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs sm:text-sm font-normal text-neutral-300 hover:text-white flex items-center gap-1 group transition-colors"
          >
            <span>Show More</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 cols x 2 rows Grid on Dark Background */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayedWatches.map((watch) => {
            const isLogoOrPlaceholder = (url) => {
              if (!url || typeof url !== 'string') return true;
              if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
              if (url.includes('images.unsplash.com')) return true;
              if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
              return false;
            };
            const rawImages = Array.isArray(watch.images) && watch.images.length > 0
              ? watch.images
              : (watch.primaryImage ? [watch.primaryImage] : []);
            const cleanImgs = rawImages.filter(img => !isLogoOrPlaceholder(img));
            const fallbackFigmaImg = getFigmaWatchThumbnail(watch);
            const displayImage = watch.primaryImage && !isLogoOrPlaceholder(watch.primaryImage)
              ? watch.primaryImage
              : (cleanImgs[0] || fallbackFigmaImg);
            const v1Price = watch.variant1Price || watch.priceUSD || 700;
            const v2Price = watch.variant2Price || 1199;

            return (
              <div
                key={watch.id}
                onClick={() => (navigateToProduct ? navigateToProduct(watch) : setQuickViewProduct(watch))}
                className="group cursor-pointer flex flex-col transition-all duration-300"
              >
                {/* Product Image Container */}
                <div className="relative aspect-[4/5] bg-neutral-900 rounded-2xl overflow-hidden mb-3.5 border border-white/10 group-hover:border-white/25 transition-all duration-300 p-3 flex items-center justify-center">
                  <img
                    src={displayImage}
                    alt={watch.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackFigmaImg;
                    }}
                  />

                  {/* Top Factory Badge */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-black/85 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase rounded">
                      {watch.factory || 'CLEAN FACTORY'}
                    </span>
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(watch);
                      }}
                      className="p-3 bg-white text-black rounded-full hover:bg-neutral-100 shadow-md transition-transform hover:scale-110"
                      title="Quick View & Calibre Specs (Xem)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleQuickWhatsApp(e, watch)}
                      className="p-3 bg-[#25D366] text-white rounded-full hover:bg-[#20ba59] shadow-md transition-transform hover:scale-110"
                      title="Order via WhatsApp with Sale (Chốt đơn)"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, watch)}
                      className="p-3 bg-[#008A38] text-white rounded-full hover:bg-[#00742f] shadow-md transition-transform hover:scale-110"
                      title="Add to Cart"
                    >
                      {addedId === watch.id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Green Brand Badge (from Figma node 2086:4535) */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="bg-[#008A38] text-white text-[11px] font-medium px-2 py-0.5 rounded-[8px] inline-flex items-center tracking-wide">
                    {watch.brand}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal truncate max-w-[120px]">
                    {watch.modelCode || watch.spu}
                  </span>
                </div>

                {/* Product Title (16px DM Sans Regular, line-height 24px) */}
                <h3 className="text-[15px] sm:text-[16px] leading-6 font-normal text-neutral-200 line-clamp-2 min-h-[48px] group-hover:text-[#A88236] transition-colors mb-2" title={watch.name}>
                  {watch.name}
                </h3>

                {/* Price (16px DM Sans Medium, line-height 24px) */}
                <div className="text-[16px] leading-6 font-medium text-white mt-auto flex items-baseline justify-between">
                  <div>
                    {formatPrice(v1Price)}
                    <span className="text-[12px] text-neutral-400 font-normal ml-1.5">
                      &ndash; {formatPrice(v2Price)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    1:1 CLONE
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
