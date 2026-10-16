import React, { useState, useMemo } from 'react';
import { useStore, getFigmaWatchThumbnail } from '../context/StoreContext';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import WhatsAppIcon from './common/WhatsAppIcon';

export default function CollectionByBrandsSection() {
  const { watches, addToCart, setQuickViewProduct, formatPrice, sendQuickProductToWhatsApp, navigateToProduct, navigateToBrands } = useStore();
  const [addedId, setAddedId] = useState(null);

  // Dynamically select top 8 Rolex models from CMS (prioritizing 4K CDN images and iconic models)
  const rolexWatches = useMemo(() => {
    if (!watches || watches.length === 0) return [];
    const list = watches.filter(w => (w.brand || '').toLowerCase().includes('rolex'));
    if (list.length === 0) return [];

    // Prioritize watches with rich CDN images
    const withCdn = list.filter(w => w.primaryImage && w.primaryImage.includes('moncontentcdn'));
    const others = list.filter(w => !w.primaryImage || !w.primaryImage.includes('moncontentcdn'));
    
    // Pick unique iconic models (Submariner, Daytona, GMT-Master, Datejust, Day-Date, etc.)
    const combined = [...withCdn, ...others];
    return combined.slice(0, 8);
  }, [watches]);

  // Dynamically select top 8 Omega models from CMS
  const omegaWatches = useMemo(() => {
    if (!watches || watches.length === 0) return [];
    const list = watches.filter(w => (w.brand || '').toLowerCase().includes('omega'));
    return list.slice(0, 8);
  }, [watches]);

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

  const isLogoOrPlaceholder = (url) => {
    if (!url || typeof url !== 'string') return true;
    if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
    if (url.includes('images.unsplash.com')) return true;
    if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
    return false;
  };

  const renderCard = (watch) => {
    const rawImages = Array.isArray(watch.images) && watch.images.length > 0
      ? watch.images
      : (watch.primaryImage ? [watch.primaryImage] : []);
    const cleanImgs = rawImages.filter(img => !isLogoOrPlaceholder(img));
    const fallbackFigmaImg = getFigmaWatchThumbnail(watch);
    const displayImage = watch.primaryImage && !isLogoOrPlaceholder(watch.primaryImage)
      ? watch.primaryImage
      : (cleanImgs[0] || fallbackFigmaImg);
    const displayPrice = watch.variant1Price || watch.priceUSD || 700;
    const v2Price = watch.variant2Price || 1199;

    return (
      <div
        key={watch.id}
        onClick={() => (navigateToProduct ? navigateToProduct(watch) : setQuickViewProduct(watch))}
        className="group cursor-pointer flex flex-col transition-all duration-300"
      >
        {/* Product Image Container with Figma proportions */}
        <div className="relative aspect-[4/5] bg-[#F8F9FA] rounded-2xl overflow-hidden mb-3.5 border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-3 flex items-center justify-center">
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

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
            <span className="bg-black/85 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase rounded shadow-xs">
              {watch.factory || 'VS / CLEAN 1:1'}
            </span>
            {watch.dataSheet?.calibre && (
              <span className="bg-emerald-900/90 text-emerald-200 text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded shadow-xs">
                CAL. {watch.dataSheet.calibre}
              </span>
            )}
          </div>

          {/* Hover Action Buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
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

        {/* Brand Tag (aligned with Brand Catalog) */}
        <div className="mb-2 flex items-center justify-between">
          <span className="bg-[#0D0D0D] text-white text-[11px] font-medium px-2 py-0.5 rounded-[8px] inline-flex items-center tracking-wide">
            {watch.brand || 'Rolex'}
          </span>
          <span className="text-[11px] text-gray-400 font-normal truncate max-w-[120px]">
            {watch.modelCode || watch.spu}
          </span>
        </div>

        {/* Product Title (16px DM Sans Regular, line-height 24px, color #0D0D0D) */}
        <h3 className="text-[15px] sm:text-[16px] leading-6 font-normal text-[#0D0D0D] line-clamp-2 min-h-[48px] group-hover:text-[#A88236] transition-colors mb-2" title={watch.name}>
          {watch.name}
        </h3>

        {/* Price (16px DM Sans Medium, line-height 24px, color #0D0D0D) */}
        <div className="flex items-baseline justify-between mt-auto pt-1">
          <p className="text-[16px] leading-6 font-medium text-[#0D0D0D]">
            {formatPrice(displayPrice)}
            <span className="text-[12px] text-gray-500 font-normal ml-1.5">
              &ndash; {formatPrice(v2Price)}
            </span>
          </p>
          <span className="text-[10px] text-emerald-700 font-medium uppercase tracking-wider">
            4K QC Video
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="collection-by-brands" className="py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Figma Heading: "Collection by Brands" */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-black tracking-tight">
            Collection by Brands
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto font-normal">
            Directly sourced from cleanroom Swiss clone manufacturers with Dandong calibres, 904L steel, and sapphire glass.
          </p>
        </div>

        {/* Brand Group 1: Rolex */}
        <div className="mb-20">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-heading font-medium text-black">
                Rolex
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Submariner, Daytona, GMT-Master II &bull; Clean Factory 1:1 Super Clone
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-neutral-700 hover:text-black underline"
            >
              Browse all Rolex &rarr;
            </button>
          </div>

          {/* 4 columns x 2 rows Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {rolexWatches.map(renderCard)}
          </div>

          {/* Figma "View More" Button */}
          <div className="text-center">
            <button
              onClick={() => {
                if (navigateToBrands) {
                  navigateToBrands('Rolex');
                } else {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center justify-center bg-[#1C1C1C] hover:bg-black text-white text-sm font-medium px-10 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow"
            >
              View More Rolex Models
            </button>
          </div>
        </div>

        {/* Brand Group 2: Omega */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-heading font-medium text-black">
                Omega
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Speedmaster Moonwatch, Seamaster Diver 300M &bull; Co-Axial Master Chronometer
              </p>
            </div>
            <button
              onClick={() => {
                if (navigateToBrands) {
                  navigateToBrands('Omega');
                } else {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-xs font-semibold text-neutral-700 hover:text-black underline"
            >
              Browse all Omega &rarr;
            </button>
          </div>

          {/* 4 columns x 2 rows Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {omegaWatches.map(renderCard)}
          </div>

          {/* Figma "View More" Button */}
          <div className="text-center">
            <button
              onClick={() => {
                if (navigateToBrands) {
                  navigateToBrands('Omega');
                } else {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center justify-center bg-[#1C1C1C] hover:bg-black text-white text-sm font-medium px-10 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow"
            >
              View More Omega Models
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
