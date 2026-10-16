import React, { useState } from 'react';
import { useStore, getFigmaWatchThumbnail } from '../context/StoreContext';

export default function ProductCard({ watch }) {
  const { navigateToProduct, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const isLogoOrPlaceholder = (url) => {
    if (!url || typeof url !== 'string') return true;
    if (url.includes('932e9558f0dc5') || url.includes('1f65403e05')) return true;
    if (url.includes('images.unsplash.com')) return true;
    if (url.includes('819e9bbafa326f2613358e0363f1a65638564f6d0ff9246c7f8874043a1e936d')) return true;
    return false;
  };

  const figmaImg = typeof getFigmaWatchThumbnail === 'function'
    ? getFigmaWatchThumbnail(watch)
    : ((typeof window !== 'undefined' && window.__FIGMA_WATCH_IMAGES__?.[0]) || '/figma-assets/watches/watch-0.png');

  const safeFallback = (typeof window !== 'undefined' && Array.isArray(window.__FIGMA_WATCH_IMAGES__) && window.__FIGMA_WATCH_IMAGES__[0])
    || figmaImg;

  const rawImages = Array.isArray(watch.images) && watch.images.length > 0
    ? watch.images
    : (watch.primaryImage ? [watch.primaryImage] : []);

  const cleanImages = rawImages.filter(img => !isLogoOrPlaceholder(img));
  const images = cleanImages.length > 0 ? cleanImages : [figmaImg];
  const displayImg = isHovered && images[1] ? images[1] : (watch.primaryImage || images[0] || figmaImg);

  const priceUSD = Number(watch.variant1Price || watch.priceUSD || 850);

  return (
    <div
      onClick={() => (navigateToProduct ? navigateToProduct(watch) : setQuickViewProduct(watch))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col space-y-3.5 transition-all duration-300"
    >
      {/* 1. Watch Image (Figma Node 2055:531 - 295x360 with cornerRadius 12) */}
      <div className="relative w-full aspect-[295/360] rounded-[12px] overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
        <img
          src={displayImg}
          alt={watch.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = safeFallback;
          }}
        />
      </div>

      {/* 2. Info Container (Figma Node 2050:623 - Frame 139) */}
      <div className="flex flex-col gap-2 pt-0.5">
        {/* Tag (Figma Node 2050:608 - 50x24 rounded-lg bg #0D0D0D) */}
        <div>
          <span className="bg-[#0D0D0D] text-white text-[11px] font-medium px-2 py-0.5 rounded-[8px] inline-flex items-center tracking-wide">
            {watch.brand || 'Rolex'}
          </span>
        </div>

        {/* Frame 138: Title & Price */}
        <div className="flex flex-col gap-2">
          {/* Title (16px DM Sans Regular, line-height 24px, color #0D0D0D) */}
          <h3 className="text-[15px] sm:text-[16px] leading-6 font-normal text-[#0D0D0D] line-clamp-2 min-h-[48px] group-hover:text-[#A88236] transition-colors">
            {watch.name}
          </h3>

          {/* Price (16px DM Sans Medium, line-height 24px, color #0D0D0D) */}
          <p className="text-[16px] leading-6 font-medium text-[#0D0D0D]">
            $ {priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
