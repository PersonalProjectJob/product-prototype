import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useStore, getFigmaWatchThumbnail } from '../context/StoreContext';

export default function ProductCard({ watch }) {
  const { navigateToProduct, setQuickViewProduct } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const figmaImg = typeof getFigmaWatchThumbnail === 'function'
    ? getFigmaWatchThumbnail(watch)
    : ((typeof window !== 'undefined' && window.__FIGMA_WATCH_IMAGES__?.[0]) || '/figma-assets/watches/watch-0.png');

  const safeFallback = (typeof window !== 'undefined' && Array.isArray(window.__FIGMA_WATCH_IMAGES__) && window.__FIGMA_WATCH_IMAGES__[0])
    || figmaImg;

  const images = Array.isArray(watch.images) && watch.images.length > 0
    ? watch.images
    : [watch.primaryImage || figmaImg];

  const displayImg = isHovered && images[1] ? images[1] : (watch.primaryImage || images[0] || figmaImg);
  const priceUSD = Number(watch.variant1Price || watch.priceUSD || 700);
  const hasVideo = Array.isArray(watch.videos) && watch.videos.length > 0;

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
        {watch.nickname && (
          <span
            title="Tên gọi mô tả kiểu dáng, không xác nhận reference hay tính chính hãng (BR-08)"
            className="absolute top-2.5 left-2.5 bg-black/85 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-[6px] tracking-wide shadow-sm"
          >
            &ldquo;{watch.nickname}&rdquo;
          </span>
        )}
        {hasVideo && (
          <span
            title="Có video thực tế (QC MP4)"
            className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-[6px] inline-flex items-center gap-1"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Video</span>
          </span>
        )}
      </div>

      {/* 2. Info Container (Figma Node 2050:623 - Frame 139) */}
      <div className="flex flex-col gap-2 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="bg-[#0D0D0D] text-white text-[11px] font-medium px-2 py-0.5 rounded-[8px] inline-flex items-center tracking-wide">
            {watch.brand || 'Collector Edition'}
          </span>
          {watch.product_id && (
            <span className="text-[11px] font-mono text-gray-400">
              {watch.product_id}
            </span>
          )}
        </div>

        {/* Frame 138: Title & Price */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[15px] sm:text-[16px] leading-6 font-normal text-[#0D0D0D] line-clamp-2 min-h-[48px] group-hover:text-[#A88236] transition-colors">
            {watch.name}
          </h3>

          <p className="text-[16px] leading-6 font-medium text-[#0D0D0D]">
            $ {priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
