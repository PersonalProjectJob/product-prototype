import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function PrivateStockSlider() {
  const { setSelectedBrand } = useStore();

  const slides = [
    {
      id: "ps-1",
      type: "image",
      imageSrc: "/private-stock-banner.png",
      tagline: "Swiss 1:1 Super Clone Watches & Full Presentation Boxes 👉 click here.",
      btnText: "ACCESS PRIVATE STOCK",
      badge: "ROLEX SUBMARINER & DAYTONA UNBOXING"
    },
    {
      id: "ps-2",
      type: "video",
      videoSrc: "https://cdn.moncontentcdn.com/uploader/5b84d7fc4585c3f8cb5b67aa1d945087d95a0cf6111d194785c6a96253319402.mp4",
      poster: "/hero-banner-5.png",
      tagline: "Bags, shoes, jewelry, clothing, etc. 👉 click here.",
      btnText: "ACCESS PRIVATE STOCK",
      badge: "COMPLIMENTARY LUXURY PRESENTATION SUITE"
    },
    {
      id: "ps-3",
      type: "video",
      videoSrc: "https://cdn.moncontentcache.com/uploader/3672a88bb9317e951a2e21c14b61408bf35051c5fdc8c06c72ee4b7a60846161.mp4",
      poster: "/hero-banner-1.png",
      tagline: "Swiss 1:1 Super Clone Watches & Full Presentation Boxes 👉 click here.",
      btnText: "ACCESS PRIVATE STOCK",
      badge: "ROLEX GMT-MASTER II SPRITE 1:1 CALIBRE"
    },
    {
      id: "ps-4",
      type: "image",
      imageSrc: "/hero-banner-1.png",
      tagline: "Bags, shoes, jewelry, clothing, etc. 👉 click here.",
      btnText: "ACCESS PRIVATE STOCK",
      badge: "FACTORY SEALED QC GUARANTEE"
    },
    {
      id: "ps-5",
      type: "image",
      imageSrc: "/hero-banner-6.webp",
      tagline: "Swiss 1:1 Super Clone Watches & Full Presentation Boxes 👉 click here.",
      btnText: "ACCESS PRIVATE STOCK",
      badge: "HAUTE HORLOGERIE PRIVATE INVENTORY"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleAccessStock = (e) => {
    e.preventDefault();
    setSelectedBrand('All');
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const current = slides[currentSlide];

  return (
    <section 
      className="relative w-full overflow-hidden bg-obsidian-950 select-none group border-b border-obsidian-800/20"
      style={{ minHeight: 'clamp(320px, 42vw, 580px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Background Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {s.type === 'video' ? (
                <video
                  src={s.videoSrc}
                  poster={s.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={s.imageSrc}
                  alt={s.badge}
                  className="w-full h-full object-cover object-center"
                />
              )}

              {/* Darkened overlay matching reference */}
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Top Left Badge in Slide */}
      {current.badge && (
        <div className="absolute top-4 left-4 z-20 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-gold-400" />
          <span>{current.badge}</span>
        </div>
      )}

      {/* Floating Center-Bottom Content Overlay (Exact Match with Uploaded Image) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end items-center pb-6 sm:pb-10 md:pb-14 px-4 pointer-events-none">
        <div className="text-center max-w-2xl mx-auto pointer-events-auto flex flex-col items-center">
          
          {/* Micro-copy line */}
          <p 
            onClick={handleAccessStock}
            className="text-white text-xs sm:text-sm md:text-base font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] cursor-pointer hover:text-gold-300 transition-colors px-2"
          >
            {current.tagline}
          </p>

          {/* Animated Downward Pointing Emojis */}
          <div className="my-1.5 sm:my-2 flex justify-center gap-1.5 text-base sm:text-lg animate-bounce select-none">
            <span>⬇️</span>
            <span>⬇️</span>
            <span>⬇️</span>
          </div>

          {/* Outline Button */}
          <a
            href="#catalog-section"
            onClick={handleAccessStock}
            className="inline-block border-2 border-white bg-black/30 hover:bg-white text-white hover:text-obsidian-950 font-extrabold text-xs sm:text-sm tracking-[0.2em] px-6 sm:px-8 py-2.5 sm:py-3 uppercase transition-all duration-300 backdrop-blur-sm shadow-2xl hover:scale-105 active:scale-95"
          >
            {current.btnText}
          </a>

        </div>
      </div>

      {/* Left / Right Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 text-white/75 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 text-white/75 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Dots Indicator at Bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all rounded-full ${
              idx === currentSlide
                ? 'w-7 h-1.5 bg-white'
                : 'w-2 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
